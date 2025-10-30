const profile = require('../models/profile')
const Profile = require('../models/profile')
const User=require('../models/user') 

const getProfile=async(req,res)=>{
     try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ data: profile });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


const userProf=async(req,res)=>{
    try {
    const{email,phone,location,skill,education}=req.body 
    const{id}=req.params
    const user=await User.findById(id)
    const resume=req.file?.path

    if(!user){
       res.status(404).json({error:'user not found'}) 
    }

    const userProfile={
        user:id,
        email,
        phone,
        location,
        skill:skill?.split(',').map((s)=>s.trim()),
        education,
        resume
    }
    const newProfile=await Profile.create({email,phone,location,skill,education,resume,user})
    res.status(201).json({data:newProfile})
    } catch (error) {
        return res.status(500).json({error:'server error'})
    }
       
}

const updateProfile=async(req,res)=>{
    try{
        const{id}=req.params
        if(!id){
            return res.status(404).json({error:'user not found'})
        }
        const editProfile=await Profile.findByIdAndUpdate({_id:id},req.body,{new:true})
        return res.status(200).json({data:editProfile})
    }catch(err){
        console.log(err)
         res.status(500).json({error:"server error"})
    }
}
module.exports={getProfile,userProf,updateProfile}