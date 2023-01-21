const express = require("express");
const {
  create,
  updateActor,
  removeActor,
  searchActors,
  getLatestActors,
  getSingleActor,
} = require("../controllers/actor");
const { uploadImage } = require("../middlewares/multer");
const { actorInfoValidator, validate } = require("../middlewares/validator");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  create
);

router.put(
  "/update/:id",
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  updateActor
);
router.delete("/:id", removeActor);
router.get("/search", searchActors);
router.get("/latest-uploads", getLatestActors);
router.get("/single/:id", getSingleActor);
module.exports = router;
