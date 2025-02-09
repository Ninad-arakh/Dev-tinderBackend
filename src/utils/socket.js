const socket = require("socket.io");
const { Chat } = require("../Models/chat");
const ConnectionRequest = require("../Models/ConnectionRequest");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //handle events
    socket.on("joinChat", async ({ firstName, userId, toUserId }) => {
      try {
        const isFriend = await ConnectionRequest.findOne({
          $or: [
            { fromUserId: userId, toUserId: toUserId, status: "accepted" },
            { fromUserId: toUserId, toUserId: userId, status: "accepted" },
          ],
        });
        if (isFriend) {
          const roomId = [userId, toUserId].sort().join("_");
          console.log("joining rooom " + firstName + " " + roomId);
          socket.join(roomId);
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, toUserId, text }) => {
        const roomId = [userId, toUserId].sort().join("_");

        //saving the messages to the database
        try {
          const isFriend = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: toUserId, status: "accepted" },
              { fromUserId: toUserId, toUserId: userId, status: "accepted" },
            ],
          });
          if (isFriend) {
            let chat = await Chat.findOne({
              participants: { $all: [userId, toUserId] },
            });

            if (!chat) {
              chat = new Chat({
                participants: [userId, toUserId],
                messages: [],
              });
            }
            chat.messages.push({
              senderId: userId,
              text,
            });
            await chat.save();
            io.to(roomId).emit("messageRecieved", {
              firstName,
              lastName,
              text,
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
