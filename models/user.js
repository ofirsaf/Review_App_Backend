const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false, required: true },
  role: {
    type: String,
    default: "user",
    required: true,
    enum: ["admin", "user"],
  },
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
userSchema.methods.comparePassword = async function (password) {
  result = await bcrypt.compare(password, this.password);
  return result;
};
module.exports = mongoose.model("User", userSchema);
