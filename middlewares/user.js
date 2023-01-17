const { isValidObjectId } = require("mongoose");
const passwordResetToken = require("../models/passwordResetToken");
const { sendEroor } = require("../utils/helper");

exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;
  if (!token.trim() || !isValidObjectId(userId)) {
    return sendEroor(res, "invalid request!");
  }

  const resetToken = await passwordResetToken.findOne({ owner: userId });
  if (!resetToken) {
    return sendEroor(res, "Unauthorized access, invalid request!");
  }
  const matched = await resetToken.compareToken(token);
  if (!matched) return sendEroor(res, "Unauthorized access, invalid request!");
  req.resetToken = resetToken;
  next();
};
