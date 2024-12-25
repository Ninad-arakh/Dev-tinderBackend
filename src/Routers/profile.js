const express = require("express");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");

//PROFILE API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req?.user);
  } catch (err) {
    res.status(500).send("ERROR : ", err.message);
  }
});

profileRouter.post("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const isValid = req?.body?.emailId.toLowerCase() === user?.email;

    if (!isValid) {
      throw new Error("Email is not valid!");
    }
    const passHash = await bcrypt.hash(req?.body?.passwordc, 10);

    user.password = passHash;

    await user.save();

    res.send("password changed successfully!");
  } catch (err) {
    res.status(500).json("ERROR : ", err.message);
  }
});

module.exports = profileRouter;
