const validator = require("validator");

const signUpValidationLogic = (req) => {
  const { firstName, email, password } = req?.body;

  if (!firstName) {
    throw new Error("please enter first Name!");
  } else if (firstName.length < 4 || firstName.length > 50) {
    throw new Error("First Name must be between 4 and 25 characters");
  } else if (!validator.isEmail(email)) {
    throw new Error("Invalid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be at least 8 characters, and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    );
  }
};

const validateEditProfile = (req) => {
  const allowedUpdate = [
    "firstName",
    "lastName",
    "about",
    "gender",
  ];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedUpdate.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  signUpValidationLogic,
  validateEditProfile,
};
