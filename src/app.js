const express = require("express");
const app = express();

const cookie = require("cookie-parser");
const Database = require("./Config/database");

const authRouter = require("./Routers/auth");
const profileRouter = require("./Routers/profile");
const requestRouter = require("./Routers/request");

app.use(express.json());
app.use(cookie());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

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
