const express = require("express");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");
const { validateEditProfile } = require("../utils/signupValid");
const sendEmail = require("../utils/sendEmail")

//PROFILE API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    
    // const sendMail = await sendEmail.run();
    // console.log("sendMail : ", sendMail);
    
    res.json({ data: req?.user });
  } catch (err) {
    return res.status(500).json({ ERROR: err.message });
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

    res.json({ message: "password changed successfully!" });
  } catch (err) {
    res.status(500).json("ERROR : ", err.message);
  }
});

profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid Edit Request!");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();
    res.json({ message: "data updated successfully.", data: loggedInUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = profileRouter;
