const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVarificationToken");
const { isValidObjectId } = require("mongoose");
const { genertaeMailTrapTransport } = require("../utils/mail");
const { sendEroor, generateRandomBytes } = require("../utils/helper");
const PasswordResetToken = require("../models/passwordResetToken");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;
  const oldUser = await User.findOne({
    email: email,
  });
  if (oldUser) {
    return sendEroor(res, "the email is already in use");
  }
  const newUser = new User({ name, email, password });
  await newUser.save();

  //create 6 digit OTP
  let OTP = Math.floor(100000 + Math.random() * 900000);
  //store OTP in database
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });
  await newEmailVerificationToken.save();
  //send OTP to user email
  var transport = genertaeMailTrapTransport();

  transport.sendMail({
    from: "verfication@reviewapp.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `<p>your verfication OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return res.json("invalid user id");
  const user = await User.findById(userId);
  if (!user) return sendEroor(res, "user not found", 404);
  if (user.isVerified) return sendEroor(res, "user already verified");
  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendEroor(res, "token not found");

  const isMatch = await token.compareToken(OTP);
  if (!isMatch) return sendEroor(res, "Please submit a valid OTP");

  user.isVerified = true;
  await user.save();
  await EmailVerificationToken.findByIdAndDelete(token._id);
  var transport = genertaeMailTrapTransport();
  transport.sendMail({
    from: "verfication@reviewapp.com",
    to: user.email,
    subject: "Wellcome Email",
    html: "<h1>Wellcome to review app</h1>",
  });
  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
    },
    message: "user verified",
  });
};

exports.reSendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return sendEroor(res, "user not found");
  if (user.isVerified) return sendEroor(res, "user already verified");
  const alreadyHastoken = await emailVarificationToken.findOne({
    owner: userId,
  });
  if (alreadyHastoken)
    return sendEroor(res, "Only after one hour you can request another token");

  let OTP = Math.floor(100000 + Math.random() * 900000);
  //store OTP in database
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });
  await newEmailVerificationToken.save();

  //send OTP to user email
  var transport = genertaeMailTrapTransport();
  transport.sendMail({
    from: "verfication@reviewapp.com",
    to: user.email,
    subject: "Email Verification",
    html: `<p>your verfication OTP</p>
    <h1>${OTP}</h1>
    `,
  });
  res.json({ message: "New OTP sent to your email again" });
};

exports.foregetPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) return sendEroor(res, "email is required");

  const user = await User.findOne({ email });
  if (!user) return sendEroor(res, "user not found!", 404);

  if (!user.isVerified) return sendEroor(res, "user not verified");
  const alreadyHasToken = await PasswordResetToken.findOne({
    owner: user._id,
  });
  if (alreadyHasToken)
    return sendEroor(res, "Only after one hour you can request another token");

  const token = await generateRandomBytes();
  const newToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newToken.save();
  const resetPasswordUrl = `http://localhost:3000/auth/reset-password/${token}/${user._id}`;
  const transport = genertaeMailTrapTransport();
  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Reset password Link",
    html: `<p>Click here to reset password</p>
    <a href=${resetPasswordUrl}>Change password </a>
    `,
  });
  res.json({ message: "reset password link sent to your email" });
};

exports.sendResetPasswordTokemStatus = (req, res) => {
  res.json({ valid: true });
};
exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return sendEroor(res, "user not found");
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendEroor(res, "new password can not be same as old password");

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = genertaeMailTrapTransport();
  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Reset Reset succcessfully",
    html: `<h1>Password Reset succcessfully</h1>
    <p>Now you can user the new paasword</p>
    `,
  });
  res.json({
    message: "Password reset successfully, now you can use the new paasword",
  });
};
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return sendEroor(res, "email and password is required");

  const user = await User.findOne({ email });
  if (!user) return sendEroor(res, "Email/Password is not correct");
  if (!user.isVerified) return sendEroor(res, "user not verified");

  const matched = await user.comparePassword(password);
  if (!matched) return sendEroor(res, "Email/Password is not correct");

  const { _id, name } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);
  res.json({ user: { id: _id, name, email, token: jwtToken } });
};
