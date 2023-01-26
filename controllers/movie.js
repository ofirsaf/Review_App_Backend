const { sendEroor } = require("../utils/helper");
const cloudinary = require("../cloud");
const Movie = require("../models/movie");
const { isValidObjectId } = require("mongoose");

exports.uploadTrailer = async (req, res) => {
  const { file } = req;

  if (!file) return sendEroor(res, "Please provide a video file");
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: "video",
    }
  );
  res.status(201).json({ url, public_id });
};
exports.createMovie = async (req, res) => {
  const { file, body } = req;

  const {
    title,
    storyLine,
    director,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = body;

  const newMovie = new Movie({
    title,
    storyLine,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
  });

  if (director) {
    if (!isValidObjectId(director))
      return sendEroor(res, "Invalid director id!");
    newMovie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId))
        return sendEroor(res, "Invalid writer id!");
    }

    newMovie.writers = writers;
  }

  // uploading poster
  if (file) {
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });

    const finalPoster = { url, public_id, responsive: [] };

    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalPoster.responsive.push(secure_url);
      }
    }
    newMovie.poster = finalPoster;
  }

  await newMovie.save();

  res.status(201).json({
    movie: {
      id: newMovie._id,
      title,
    },
  });
};

exports.updateMovieWithoutPoster = async (req, res) => {
  const { movieId } = req.params;
  if (!isValidObjectId(movieId)) return sendEroor(res, "Invalid movie id!");

  const movie = await Movie.findById(movieId);
  if (!movie) return sendEroor(res, "Movie not found!", 404);

  const {
    title,
    storyLine,
    director,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.releseDate = releseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.tags = tags;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director))
      return sendEroor(res, "Invalid director id!");
    movie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId))
        return sendEroor(res, "Invalid writer id!");
    }

    movie.writers = writers;
  }
  await movie.save();
  res.status(200).json({ message: "Movie updated successfully!", movie });
};
exports.updateMovieWithPoster = async (req, res) => {
  const { movieId } = req.params;
  if (!isValidObjectId(movieId)) return sendEroor(res, "Invalid movie id!");
  if (!req.file) return sendEroor(res, "Please provide a poster file!");
  const movie = await Movie.findById(movieId);
  if (!movie) return sendEroor(res, "Movie not found!", 404);

  const {
    title,
    storyLine,
    director,
    releseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    language,
  } = req.body;

  movie.title = title;
  movie.storyLine = storyLine;
  movie.releseDate = releseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.tags = tags;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director))
      return sendEroor(res, "Invalid director id!");
    movie.director = director;
  }

  if (writers) {
    for (let writerId of writers) {
      if (!isValidObjectId(writerId))
        return sendEroor(res, "Invalid writer id!");
    }

    movie.writers = writers;
  }
  const posterId = movie.poster?.public_id;
  console.log(posterId);
  // uploading poster
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== "ok") {
      return sendEroor(res, "Something went wrong!");
    }
  }
  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(req.file.path, {
    transformation: {
      width: 1280,
      height: 720,
    },
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      max_images: 3,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];
  if (breakpoints.length) {
    for (let imgObj of breakpoints) {
      const { secure_url } = imgObj;
      finalPoster.responsive.push(secure_url);
    }
  }
  movie.poster = finalPoster;

  await movie.save();
  res.status(200).json({ message: "Movie updated successfully!", movie });
};

exports.removeMovie = async (req, res) => {
  const { movieId } = req.params;
  if (!isValidObjectId(movieId)) return sendEroor(res, "Invalid movie id!");
  const movie = await Movie.findById(movieId);
  if (!movie) return sendEroor(res, "Movie not found!", 404);

  // deleting poster
  const posterId = movie.poster?.public_id;
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== "ok") {
      return sendEroor(res, "Could not delete poster from cloud!");
    }
  }
  const trailerId = movie.trailer?.public_id;
  console.log(trailerId);
  if (!trailerId) {
    return sendEroor(res, "Not found trailer in the cloud");
  }
  const { result } = await cloudinary.uploader.destroy(trailerId, {
    resource_type: "video",
  });
  if (result !== "ok") {
    return sendEroor(res, "Could not delete trailer from cloud");
  }

  await Movie.findByIdAndDelete(movieId);
  res.json({ message: "Movie deleted successfully!" });
};
