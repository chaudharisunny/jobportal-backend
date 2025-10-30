require("dotenv").config()
const jwt=require('jsonwebtoken')

function newToken (user){
     const payload={
        userId:user._id,
        username:user.username,
        email:user.email
     }
     return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1d'})
     
}
console.log("JWT_SECRET at sign:", process.env.JWT_SECRET);
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
    
  } catch (error) {
    console.log('JWT error:', error.message);
    return null;
  }
  
}
console.log("JWT_SECRET at verify:", process.env.JWT_SECRET);


module.exports={newToken,verifyToken}