const express = require("express");
const app = express();

const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");

const Database = require("./Config/database");
const User = require("./Models/User");
const { signUpValidationLogic } = require("./utils/signupValid");
const { userAuth } = require("./middlewares/userAuth");

app.use(express.json());
app.use(cookie());

//api to delete a user by id
app.delete("/user", async (req, res) => {
  const id = req.body.userId;
  try {
    await User.findByIdAndDelete(id);
    res.send("user deleted...");
  } catch (err) {
    res.status(500).send("ERROR");
  }
});

//PROFILE API
app.get("/profile",userAuth, async (req, res) => {
  try {
    res.send(req?.user);
  } catch (err) {
    res.status(500).send("ERROR : ", err.message);
  }
});

//TESTING API
app.post("/sendConnectionReq", userAuth, async (req, res)=>{
  try{
    res.send(req?.user?.firstName + " sent the connection request.")

  }catch(err){
    res.status(500).send("ERROR : ", err.message);
  }
})

// LOGIN API and SENDING JWT TOKEN
app.post("/login", async (req, res) => {
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
      const token = await jwt.sign({ _id: userEmail._id }, "DEV@Tinder358");
      res.cookie("token", token);
      res.send("login successful");
    }
  } catch (err) {
    return res.status(500).send("ERROR: " + err.message);
  }
});
//api to update the user
app.patch("/user/:userId", async (req, res) => {
  const id = req?.params?.userId;
  const data = req.body;

  try {
    const allowedUpdades = [
      "userId",
      "photoUrl",
      "firstName",
      "lastName",
      "password",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      allowedUpdades.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("update not allowed...");
    }
    await User.findByIdAndUpdate({ _id: id }, data, { runValidators: true });
    res.send("user updated...");
  } catch (err) {
    res.status(500).send("ERROR " + err.message);
  }
});

// api to find users of same email
app.get("/find", async (req, res) => {
  const userEmail = req.body.email;

  try {
    const arrUser = await User.find({ email: userEmail });
    res.send(arrUser);
  } catch (err) {
    res.status(404).send("ERROR...");
  }
});

//api to get all the users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(404).send("ERROR...");
  }
});

//api to create new user
app.post("/signup", async (req, res) => {
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
