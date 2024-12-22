const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("token is not valid!");
    }
    const decodedData = await jwt.verify(token, "DEV@Tinder358");
    const { _id } = decodedData;
    const user = await User.findById(_id);
    if(!user){
        throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Please authenticate!" });
  }
};


module.exports = {
    userAuth,
};