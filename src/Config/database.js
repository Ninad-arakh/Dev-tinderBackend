const database = require("mongoose");

const connectDB = async () =>{
    await database.connect(process.env.DB_CONNECTION);
}

module.exports = connectDB;