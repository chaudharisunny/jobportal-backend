const jwt=require('jsonwebtoken')
require("dotenv").config()


function newToken (user){
     const payload={
        userId:user._id,
        username:user.username,
        email:user.email
     }
     return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1d'})
}
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log('JWT error:', error.message);
    return null;
  }
}

module.exports={newToken,verifyToken}