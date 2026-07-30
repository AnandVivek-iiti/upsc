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

    // ── TEMP DEBUG: confirm keys are actually loaded (never logs the secret) ──
    console.log("[createOrder] RAZORPAY_KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
    console.log("[createOrder] RAZORPAY_KEY_ID prefix:", process.env.RAZORPAY_KEY_ID?.slice(0, 8));
    console.log("[createOrder] RAZORPAY_KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);
    console.log("[createOrder] req.user.id:", req.user?.id);

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
    // ── TEMP DEBUG: surface the real error in Render logs ─────────────────────
    console.error("[createOrder] FAILED:", err.message);
    if (err.error) console.error("[createOrder] Razorpay error detail:", JSON.stringify(err.error));
    if (err.statusCode) console.error("[createOrder] Razorpay statusCode:", err.statusCode);
    console.error("[createOrder] Full error object:", err);
    next(err);
  }
};
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
    console.error("[verifyPayment] FAILED:", err.message);
    next(err);
  }
};
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
    res.status(500).json({ success: false });
  }
};

module.exports = { createOrder, verifyPayment, webhook, PLANS };