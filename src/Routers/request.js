const express = require("express");

const requestRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");
const ConnectionRequest = require("../Models/ConnectionRequest");
const User = require("../Models/User");

// CONNECTION REQ SEND API
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res
          .status(400)
          .json({ message: "Can't find the user you are looking for!" });
      }

      const isConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (isConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request Already Sent!" });
      }

      if (toUserId !== fromUserId) {
        const connectionReq = new ConnectionRequest({
          fromUserId,
          toUserId,
          status,
        });

        await connectionReq.save();

        res.json({
          message: "Connection request sent successfully",
          data: connectionReq,
        });
      }
      else{
        console.log("will this execute?")
        return res.status(400).json({message: "You can't send connection request to yourself"});
      }
    } catch (err) {
      res.status(400).send("ERROR : ", err.message);
    }
  }
);

module.exports = requestRouter;
