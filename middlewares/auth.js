const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendEroor } = require("../utils/helper");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;
  if (!token) return sendEroor(res, "token not found");
  const jwtToken = token.split("Bearer ")[1];
  if (!jwtToken) return sendEroor(res, "token not found");
  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;
  const user = await User.findById(userId);
  if (!user) return sendEroor(res, "user not found", 404);
  req.user = user;
  next();
};

exports.isAdmin = async (req, res, next) => {
  const { user } = req;
  if (user.role !== "admin") return sendEroor(res, "you are not admin", 401);
  next();
};
