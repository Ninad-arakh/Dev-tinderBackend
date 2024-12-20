const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim : true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },
    password: {
        type: String,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error('Enter a Strong password!')
            }
        }
    },
    gender: {
        type: String,
        validate(value){
            if(!["male","female","other"].includes(value)){
                throw new Error("Invalid gender");
            }
        }
    },
    skills: {
        type: [String],
    },
    photoUrl: {
        type: String,
        default: "https://tse1.mm.bing.net/th?id=OIP.PqGa9lkt0PDixCqlcLIdSAHaHa&pid=Api&P=0&h=220"
    }
},
{
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;