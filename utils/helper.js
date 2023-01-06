const crypto = require("crypto");

exports.sendEroor = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error });
};

exports.generateRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, async (err, buffer) => {
      if (err) {
        return reject(err);
      }
      resolve(buffer.toString("hex"));
    });
  });
};
