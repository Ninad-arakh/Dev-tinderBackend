const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const ConnectionRequest = require("../Models/ConnectionRequest");
const userRouter = express.Router();
const User = require("../Models/User");

const user_SaFe_data = "firstName lastName skills gender photoUrl about";

userRouter.get("/user/requests/reviewed", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const pendingReq = await ConnectionRequest.find({
      toUserId: user._id,
      status: "intrested",
    }).populate("fromUserId", ["firstName", "lastName", "about", "photoUrl"]);

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

    const data = await connections.map((row) => {
      if (row.fromUserId._id.toString() === user._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ message: "data fetched successfully.", data });
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    page = page < 1 ? 1 : page;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hiddenUserFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hiddenUserFromFeed.add(req.fromUserId.toString());
      hiddenUserFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(user_SaFe_data)
      .skip(skip)
      .limit(limit);

    res.json({ message: "data fetched successfully.", users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
