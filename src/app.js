const express = require("express");

const app = express();
const Database = require("./Config/database");
const User = require("./Models/User");

app.use(express.json());

//api to delete a user by id
app.delete("/user", async (req, res) => {
  const id = req.body.userId;
  try {
    await User.findByIdAndDelete(id);
    res.send("user deleted...");
  } catch (err) {
    res.status(500).send("something went wrong");
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
    res.status(500).send("something went wrong " + err.message);
  }
});

// api to find users of same email
app.get("/find", async (req, res) => {
  const userEmail = req.body.email;

  try {
    const arrUser = await User.find({ email: userEmail });
    res.send(arrUser);
  } catch (err) {
    res.status(404).send("something went wrong...");
  }
});

//api to get all the users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(404).send("something went wrong...");
  }
});

//api to create new user
app.post("/signup", async (req, res) => {
  // console.log(req.body);

  const reqBody = new User(req.body);

  try {
    await reqBody.save();
    res.send("user added successfully...");
    // console.log("user added successfully...");
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong " + err.message);
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
