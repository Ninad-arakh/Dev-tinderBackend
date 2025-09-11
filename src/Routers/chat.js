const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const { Chat } = require("../Models/chat");
const ConnectionRequest = require("../Models/ConnectionRequest");

const chatRouter = express.Router();

chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
  const toUserId = req.params.toUserId;
  const userId = req?.user?._id;

  try {
    //checking if they are friends or not

    const isFriend = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: toUserId, status: "accepted" },
        { fromUserId: toUserId, toUserId: userId, status: "accepted" },
      ],
    });
    // console.log("isFriend : ", isFriend);
    if (!isFriend) {
      return res.status(500).json({ data: "Please be friends with the user first!" });
    } else {
      let chat = await Chat.findOne({
        participants: { $all: [userId, toUserId] },
      }).populate({
        path: "messages.senderId",
        select: "firstName lastName photoUrl",
      });

      if (!chat) {
        chat = new Chat({
          participants: [userId, toUserId],
          messages: [],
        });
        await chat.save();
      }
      res.json(chat);
    }
  } catch (err) {
    return res.status(500).json({ ERROR: err.message });
  }
});

module.exports = chatRouter;
