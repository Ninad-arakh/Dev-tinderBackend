const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs")

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/userAuth");
const { validateEditProfile } = require("../utils/signupValid");
const path = require("path");
const User = require("../Models/User");
// const sendEmail = require("../utils/sendEmail");

// Ensure the 'uploads' directory exists
const uploadPath = "./uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);  
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);  
  },
  filename: (req, file, cb) => {
    const userName = req.user.firstName + req.user.lastName ;  
    // const fileExtension = path.extname(file.originalname); 
    cb(null, userName + ".jpg"); 
  }
});

const upload = multer({storage})

profileRouter.post(
  "/profile/uploadImage",
  userAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });  
      }

      const userName = req.user.firstName + req.user.lastName;  
      let filePath = req.file.path;
      const fileName = req.file.filename;

      filePath = path.posix.join('uploads', fileName);

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,  // Assuming user id is in req.user
        {
          $set: {
            photoUrl: {
              userName: userName,
              filePath: filePath,
              fileName: fileName,
            },
          },
        },
        { new: true }
      );

      // Return a success response with the file details
      res.status(200).json({
        message: 'Profile image uploaded successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).json({ message: 'Error uploading the file', error: error.message });
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
