const express = require("express");
const {
  create,
  updateActor,
  removeActor,
  searchActors,
  getLatestActors,
  getSingleActor,
} = require("../controllers/actor");
const { isAuth, isAdmin } = require("../middlewares/auth");
const { uploadImage } = require("../middlewares/multer");
const { actorInfoValidator, validate } = require("../middlewares/validator");

const router = express.Router();

router.post(
  "/create",
  isAuth,
  isAdmin,
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  create
);

router.put(
  "/update/:id",
  isAuth,
  isAdmin,
  uploadImage.single("avatar"),
  actorInfoValidator,
  validate,
  updateActor
);
router.delete("/:id", isAuth, isAdmin, removeActor);
router.get("/search", isAuth, isAdmin, searchActors);
router.get("/latest-uploads", isAuth, isAdmin, getLatestActors);
router.get("/single/:id", getSingleActor);
module.exports = router;
