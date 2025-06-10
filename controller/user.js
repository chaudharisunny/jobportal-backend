const { newToken } = require("../middleware/createToken")
const User=require("../models/user")

 const newUser=async(req,res)=>{
    try {
        const{username,email,password,roll,phone,company}=req.body

        if(!username||!email||!password){
            return res.status(400).json({error:"all fields are reqired"})
        }

        const createUser=await User.create({username,email,password,roll,phone,company})
        return  res.status(201).json({data:createUser})

    } catch (error) {
        console.log(error);
        
        res.status(500).json({error:"server error"})
    }
}

const loginUser=async(req,res)=>{
    try {
        const{email,password}=req.body 
        const user=await User.findOne({email})
        if(!user){
            return res.status(401).json({error:"user not found"})
        }
        const isPassword=await user.comparePassword(password)
        if(!isPassword){
            return res.status(201).json({error:"user not found"})
        }
        const token=newToken(user)
        return res.status(201).json({message:"login success",token})
    } catch (error) {
        res.status(500).json({error:"server error"})
    }
}

const logout=(req,res)=>{
    res.clearCookie('token')
    res.status(201).json({message:"logout user"})
}

const edituser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const updateUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!updateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ data: updateUser });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};


const deleteUser=async(req,res)=>{
    try {
        const{id}=req.params 
        if(!id){
            return res.status(400).json({error:"id is not found"})
        }
        const deleteUser=await User.findByIdAndDelete({id})
        return res.status(201).json({message:"user deleted",data:deleteUser})
    } catch (error) {
         res.status(500).json({error:"server error"})
    }
}

const upgradeRoll=async(req,res)=>{
   try {
    const userId = req.user.id;
    const updates = req.body;

    const allowedFields = ['roll', 'company', 'username', 'email'];
    const isValidUpdate = Object.keys(updates).every(key => allowedFields.includes(key));

    if (!isValidUpdate) {
      return res.status(400).json({ message: "Invalid fields in update request" });
    }

    // If roll is included, validate it
    if (updates.roll) {
      const allowedRoles = ["applicant", "recruiter"];
      if (!allowedRoles.includes(updates.roll)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }
    }

    // Update and return the new user data
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User data updated successfully", user });
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports={newUser,loginUser,logout,edituser,deleteUser,upgradeRoll}