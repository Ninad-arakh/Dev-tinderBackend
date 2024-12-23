const express = require("express");

const requestRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");

//TESTING API
requestRouter.post("/sendConnectionReq", userAuth, async (req, res) => {
  try {
    res.send(req?.user?.firstName + " sent the connection request.");
  } catch (err) {
    res.status(500).send("ERROR : ", err.message);
  }
});

module.exports = requestRouter;
