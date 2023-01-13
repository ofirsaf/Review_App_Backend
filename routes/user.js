const express = require("express");

const {
  create,
  verifyEmail,
  reSendEmailVerificationToken,
  foregetPassword,
  sendResetPasswordTokemStatus,
  resetPassword,
  signIn,
} = require("../controllers/user");
const {
  userValidator,
  validtePassword,
  signInValidator,
} = require("../middlewares/validator");
const { runValidation } = require("../middlewares/validator");
const { isValidPassResetToken } = require("../middlewares/user");
const { isAuth } = require("../middlewares/auth");
const router = express.Router();

router.post("/create", userValidator, runValidation, create);
router.post("/verify-email", verifyEmail);
router.post("/sign-in", signInValidator, runValidation, signIn);
// router.get("is-auth");
router.post("/resend-email-verification-token", reSendEmailVerificationToken);
router.post("/forget-password", foregetPassword);
router.post(
  "/verify-pass-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokemStatus
);
router.get("/is-auth",isAuth,(req,res)=>{
  const {user}=req;
  res.json({ user: { id: user._id, name: user.name, email: user.email } });

});

router.post(
  "/reset-password",
  validtePassword,
  runValidation,
  isValidPassResetToken,
  resetPassword
);
module.exports = router;
