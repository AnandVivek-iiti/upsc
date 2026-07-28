import { useCallback, useState } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

let checkoutScriptPromise = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      checkoutScriptPromise = null;
      reject(new Error("Couldn't load Razorpay checkout. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return checkoutScriptPromise;
}

export function usePayment(token, { onSuccess } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubscription = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders(token) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load subscription status.");
      return data.user?.subscription || null;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [token]);

  const startCheckout = useCallback(
    async (plan, user) => {
      setError("");
      setLoading(true);
      try {
        await loadRazorpayScript();

        const orderRes = await fetch(`${BASE}/payments/create-order`, {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({ plan }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success) {
          throw new Error(orderData.error || "Could not start checkout.");
        }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.order_id,
          name: "UPSC Mentor",
          description: plan === "yearly" ? "Premium — Yearly" : "Premium — Monthly",
          prefill: { name: user?.name || "", email: user?.email || "" },
          theme: { color: "#f59e0b" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${BASE}/payments/verify`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || "Payment verification failed. Contact support if you were charged.");
              }
              onSuccess?.(verifyData.subscription);
            } catch (e) {
              setError(e.message);
            } finally {
              setLoading(false);
            }
          },
          modal: {
            // Fires if the user closes the Checkout modal without paying.
            ondismiss: () => setLoading(false),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => {
          setError(resp.error?.description || "Payment failed. Please try again.");
          setLoading(false);
        });
        rzp.open();
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    },
    [token, onSuccess]
  );

  return { startCheckout, fetchSubscription, loading, error, setError };
}