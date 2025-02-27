const mongoose = require("mongoose");

const ConnectionRequestSchema = mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "User",
      required: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "intrested", "accepted", "rejected"],
        message: `{VALUE} is not defined.`,
      },
    },
  },
  {
    timestamps: true,
  }
);

ConnectionRequestSchema.pre("save", function(next){
  const connectionReqes = this;
  if(connectionReqes.fromUserId.equals(connectionReqes.toUserId)){
    throw new Error("You can't send connection request to yourself!")
  }
  next();
})

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

module.exports = ConnectionRequestModel;