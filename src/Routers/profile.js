const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");
const { validateEditProfile } = require("../utils/signupValid");
const path = require("path");
const User = require("../Models/User");
const cloudinary = require("../utils/Cloudinary");
// const sendEmail = require("../utils/sendEmail");

// Multer setup (still needed to handle file upload before sending to Cloudinary)
const uploadPath = "./uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const userName = req.user.firstName + req.user.lastName;
    cb(null, userName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 🔹 Upload profile image to Cloudinary
profileRouter.post(
  "/profile/uploadImage",
  userAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userName = req.user.firstName + req.user.lastName;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pictures",
        public_id: `${userName}_${req.user._id}`, // unique per user
        overwrite: true,
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
        ],
      });
      // console.log("Cloudinary upload result:", result.url);

      // Remove local file after upload
      fs.unlinkSync(req.file.path);

      // Update user record with Cloudinary URL
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { photoUrl: result.secure_url } },
        { new: true, runValidators: true } // ensure validators & return updated doc
      );
      await updatedUser.save();
      // console.log("updatedUser :", updatedUser);

      res.status(200).json({
        message: "Profile image uploaded successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error during Cloudinary upload:", error);
      res
        .status(500)
        .json({ message: "Error uploading file", error: error.message });
    }
  }
);

//PROFILE API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    // const sendMail = await sendEmail.run();
    // console.log("sendMail : ", sendMail);

    res.json({ data: req?.user });
  } catch (err) {
    return res.status(500).json({ ERROR: err.message });
  }
});

profileRouter.post("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const isValid = req?.body?.emailId.toLowerCase() === user?.email;

    if (!isValid) {
      throw new Error("Email is not valid!");
    }
    const passHash = await bcrypt.hash(req?.body?.passwordc, 10);

    user.password = passHash;

    await user.save();

    res.json({ message: "password changed successfully!" });
  } catch (err) {
    res.status(500).json("ERROR : ", err.message);
  }
});

profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid Edit Request!");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();
    res.json({ message: "data updated successfully.", data: loggedInUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = profileRouter;
