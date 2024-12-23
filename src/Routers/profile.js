const express = require("express");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");

//PROFILE API
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    res.send(req?.user);
  } catch (err) {
    res.status(500).send("ERROR : ", err.message);
  }
});

module.exports = profileRouter;
