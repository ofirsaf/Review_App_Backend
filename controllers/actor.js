const actor = require("../models/actor");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});
exports.create = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;

  const newActor = new actor({ name, about, gender });
  const { secure_url, public_id } = await cloudinary.uploader.upload(file.path);
  newActor.avatar = { url: secure_url, public_id };
  await newActor.save();
  res.json(newActor);
  res.staus(201).json({ message: "actor created", newActor });
};
