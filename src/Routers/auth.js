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

    await reqBody.save();
    res.send("user added successfully...");
    // console.log("user added successfully...");
  } catch (err) {
    res.status(500).send("ERROR : " + err.message);
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
      res.cookie("token", token);
      res.json({
        message: "Login Success.",
        data: userEmail
      })
    }
  } catch (err) {
    return res.status(500).send("ERROR: " + err.message);
  }
});

// LOGOUT API
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires : new Date(Date.now())
  })
  res.send("logout successful");
});

module.exports = authRouter;
