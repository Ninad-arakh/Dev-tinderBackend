const express = require("express");

const app = express();
const { adminAuth } = require("./utils/utils")

// app.use("/admin", adminAuth); 

app.get("/admin/Details",adminAuth, (req, res, next) =>{
  res.send("admin details");
  console.log("admin details sent")
});

app.get("/admin/posts", (req, res, next) =>{
  res.send("admin posts");
  console.log("admin posts sent")
})

app.listen(7777, () => {
  console.log("server is running on port 7777");
});
