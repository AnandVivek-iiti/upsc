const express  = require("express");
const router   = express.Router();
const {
  register, login, googleAuth, getProfile, updateProfile, changePassword,
} = require("../controllers/authController");
const { protect }     = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post  ("/register",        authLimiter, register);
router.post  ("/login",           authLimiter, login);
router.post  ("/google",          authLimiter, googleAuth); 
router.get   ("/me",              protect,     getProfile);
router.patch ("/profile",         protect,     updateProfile);
router.patch ("/change-password", protect,     changePassword);

module.exports = router;
