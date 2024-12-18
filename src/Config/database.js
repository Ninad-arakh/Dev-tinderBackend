const database = require("mongoose");

const connectDB = async () =>{
    await database.connect("mongodb+srv://arakhninad:TXjXXBc1L24n3fzV@akatsuki.ilvkl.mongodb.net/devTinder");
}

module.exports = connectDB;