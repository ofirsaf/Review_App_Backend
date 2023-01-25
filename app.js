const express = require("express");
const { errorHandler } = require("./middlewares/errorHandler");
const cors = require("cors");
require("express-async-errors");
require("dotenv").config();
require("./db/");
const userRouter = require("./routes/user");
const actorRouter = require("./routes/actor");
const movieRouter = require("./routes/movie");
const { handleNotFound } = require("./utils/helper");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/actor", actorRouter);
app.use("/api/movie", movieRouter);

app.use("/*", handleNotFound);
app.use(errorHandler);

// app.post(
//   "/sign-in",
//   (req, res, next) => {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.json({ message: "Please provide email and password" });

//     next();
//   },
//   (req, res) => {
//     res.send("<h1>About page</h1>");
//   }
// );
console.log(app.listen(8000, () => console.log("listening on port 8000")));
