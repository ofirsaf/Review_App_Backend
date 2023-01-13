const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendEroor } = require("../utils/helper");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;
  const jwtToken = token.split("Bearer ")[1];
  if (!jwtToken) return sendEroor(res, "token not found");
  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;
  const user = await User.findById(userId);
  if (!user) return sendEroor(res, "user not found", 404);
  req.user = user;
  next();
};
