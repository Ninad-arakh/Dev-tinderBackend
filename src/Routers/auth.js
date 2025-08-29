const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

const { signUpValidationLogic } = require("../utils/signupValid");
const User = require("../Models/User");

//api to create new user
authRouter.post("/signup", async (req, res) => {
  try {
    signUpValidationLogic(req);
    const { firstName, lastName, email, password, gender } = req?.body;

    const passHash = await bcrypt.hash(password, 10);

    const reqBody = new User({
      firstName,
      lastName,
      email,
      password: passHash,
      gender,
    });

    const token = await reqBody.getJWT();

    await reqBody.save();
    res.cookie("token", token, {
      httpOnly: true, // prevents JS access
      secure: true, // required for HTTPS (Render is HTTPS)
      sameSite: "none", // allow cross-origin
      path: "/", // cookie available to all routes
    });

    res.json({
      message: "user added successfully....",
      data: reqBody,
    });
  } catch (err) {
    res.status(500).json({ ERROR: err.message });
  }
});

// LOGIN API and SENDING JWT TOKEN
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const isEmailValid = validator.isEmail(email);
    if (!isEmailValid) {
      throw new Error("Please enter a valid email!");
    }

    const userEmail = await User.findOne({ email: email });
    if (!userEmail) {
      throw new Error("User not found!");
    }
    const isPassword = await bcrypt.compare(password, userEmail.password);
    if (!isPassword) {
      throw new Error("Password is incorrect!");
    }
    if (isPassword) {
      const token = await userEmail.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      res.json({
        message: "Login Success.",
        data: userEmail,
      });
    }
  } catch (err) {
    return res.status(500).json({ ERROR: err.message });
  }
});

// LOGOUT API
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    expires: new Date(0),
  });
  res.json({ message: "logout successful" });
});

module.exports = authRouter;
