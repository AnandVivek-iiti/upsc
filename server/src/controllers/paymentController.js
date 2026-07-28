const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const PLANS = {
  monthly: { amount: 19900, label: "Premium Monthly", durationDays: 30 },
  yearly: { amount: 200000, label: "Premium Yearly", durationDays: 365 },
};

function computeExpiry(plan, from = new Date()) {
  const days = PLANS[plan]?.durationDays || 30;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

async function activateSubscriptionForOrder(orderRecord, paymentId) {
  if (orderRecord.status === "paid") return; // idempotent - already applied

  orderRecord.status = "paid";
  if (paymentId) orderRecord.razorpay_payment_id = paymentId;
  await orderRecord.save();

  const user = await User.findByPk(orderRecord.user_id);
  if (!user) return;

  const base =
    user.hasActivePremium() && user.subscription_expires_at
      ? new Date(user.subscription_expires_at)
      : new Date();

  user.subscription_tier = "premium";
  user.subscription_source = "razorpay";
  user.subscription_expires_at = computeExpiry(orderRecord.plan, base);
  await user.save();
}

// ─── POST /api/payments/create-order ──────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan. Choose 'monthly' or 'yearly'.",
      });
    }

    const order = await razorpay.orders.create({
      amount: planConfig.amount,
      currency: "INR",
      receipt: `user_${req.user.id}_${Date.now()}`,
      notes: { user_id: req.user.id, plan },
    });

    await Payment.create({
      user_id: req.user.id,
      plan,
      razorpay_order_id: order.id,
      amount: planConfig.amount,
      currency: "INR",
      status: "created",
    });

    // Only what the client needs to open Checkout - never the key secret.
    res.json({
      success: true,
      order_id: order.id,
      amount: planConfig.amount,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/verify ────────────────────────────────────────────────
// Called by the frontend's Razorpay Checkout success handler. This is a
// convenience path for instant UI feedback - the webhook below is the real
// source of truth and will also activate the subscription independently if
// this call never happens (e.g. user closes the tab right after paying).
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment verification fields." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // timingSafeEqual needs equal-length buffers - guard against length
    // mismatch throwing before we even get to compare.
    const sigMatches =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!sigMatches) {
      return res.status(400).json({ success: false, error: "Payment signature verification failed." });
    }

    const orderRecord = await Payment.findOne({
      where: { razorpay_order_id, user_id: req.user.id },
    });
    if (!orderRecord) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }

    await activateSubscriptionForOrder(orderRecord, razorpay_payment_id);

    const user = await User.findByPk(req.user.id);
    res.json({
      success: true,
      subscription: {
        tier: user.subscription_tier,
        source: user.subscription_source,
        expiresAt: user.subscription_expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
// Source of truth, independent of the client callback above. Mounted in
// server.js with express.raw() BEFORE the global express.json() parser -
// req.body here is a Buffer, not a parsed object.
const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ success: false, error: "Missing signature header." });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw Buffer
      .digest("hex");

    const sigMatches =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!sigMatches) {
      return res.status(400).json({ success: false, error: "Invalid webhook signature." });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const orderRecord = await Payment.findOne({ where: { razorpay_order_id: orderId } });
        // Idempotent: activateSubscriptionForOrder no-ops if already "paid",
        // so re-delivered webhooks (Razorpay retries on any non-2xx) are safe.
        if (orderRecord) await activateSubscriptionForOrder(orderRecord, paymentId);
      }
    } else if (event.event === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        await Payment.update(
          { status: "failed" },
          { where: { razorpay_order_id: orderId, status: "created" } }
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err.message);
    // 5xx (not 2xx) so Razorpay retries - this branch means something on our
    // end failed (DB down, bad JSON, etc.), not that the event was invalid.
    res.status(500).json({ success: false });
  }
};

module.exports = { createOrder, verifyPayment, webhook, PLANS };