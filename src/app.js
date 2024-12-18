const express = require("express");

const app = express();
const Database = require("./Config/database");
const User = require("./Models/User");

app.post("/signup", async (req, res) => {
  const obj = new User({
    firstName: "Ninad",
    lastName: "Arakh",
    email: "ninad.arakh@gmail.com",
    password: "123456",
  });

  try {
    await obj.save();
    res.send("user added successfully...");
    console.log("user added successfully...");
  } catch (err) {
    console.log(err);
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
