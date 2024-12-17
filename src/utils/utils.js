const adminAuth = 
    (req, res, next) =>{
     const reqTok = "abc";
     const isAdmin = reqTok === "abc";
     console.log("checking for admin")
     if (!isAdmin) {
       res.status(401).send("admin is not valid");
     }else{
       next();
     }
    }

 module.exports = {adminAuth};