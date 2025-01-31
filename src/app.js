const express = require("express");
const app = express();

require("dotenv").config();

const cookie = require("cookie-parser");
const Database = require("./Config/database");

const authRouter = require("./Routers/auth");
const profileRouter = require("./Routers/profile");
const requestRouter = require("./Routers/request");
const userRouter = require("./Routers/user");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookie());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

Database()
  .then(() => {
    console.log("Database Connected successfully...");
    app.listen(7777, () => {
      console.log("server is running on port 7777...");
    });
  })
  .catch(() => {
    console.log("Database Not Connected...");
  });
