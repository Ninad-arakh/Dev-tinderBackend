const ConnectionRequest = require("../Models/ConnectionRequest");

const areFriends = async (userId, toUserId) => {
  return await ConnectionRequest.findOne({
    $or: [
      { fromUserId: userId, toUserId: toUserId, status: "accepted" },
      { fromUserId: toUserId, toUserId: userId, status: "accepted" },
    ],
  });
};

module.exports = areFriends;
