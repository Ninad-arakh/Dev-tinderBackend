const express = require("express");

const app = express();

let obj = {
  "firstName" : "Vijay",
  "lastName" : "Deverkonda",
  "age" : 33
}

app.get("/home",(req,res) => {
  res.send(obj);
})

app.post("/home", (req, res) =>{
  res.send("data added successfully!")
  
  console.log(req.query);
})

app.listen(7777, () => {
  console.log("server is running on port 7777");
});
