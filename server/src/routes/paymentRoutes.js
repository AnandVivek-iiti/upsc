const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { createOrder, verifyPayment } = require("../controllers/paymentController");

// Both of these run after the global express.json() parser, same as every
// other route in the app - only the webhook needs special raw-body handling,
// and that route is intentionally NOT here (see server.js for why).
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;