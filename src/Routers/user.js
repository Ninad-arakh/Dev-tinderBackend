const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const ConnectionRequest = require("../Models/ConnectionRequest");
const userRouter = express.Router();

const user_SaFe_data = "firstName lastName";

userRouter.get("/user/requests/reviewed", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const pendingReq = await ConnectionRequest.find({
      toUserId: user._id,
      status: "intrested",
    }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "fetched data successfully.",
      data: pendingReq,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: user._id, status: "accepted" },
        { toUserId: user._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", user_SaFe_data)
      .populate("toUserId", user_SaFe_data);

      const data = await connections.map((row) =>{
        if(row.fromUserId._id.toString() === user._id.toString()){
            
            return row.toUserId;
        }
        return row.fromUserId;
      })

      res.json({message : "data fetched successfully.",
        data
      })
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});

module.exports = userRouter;
