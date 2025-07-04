const Job = require('../models/job');
const Application=require('../models/application')
const path=require('path')
const fs = require('fs');
const User = require('../models/user');

const allApplication=async(req,res)=>{
  try {
       const allApp=await Application.find()
       res.status(200).json({data:allApp})   
  } catch (error) {
        res.status(500).json({error:'server error'})
  }
 
}


const applicant = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const applications = await Application.find({ job: jobId }).populate(
      'applicant',
      'username +email resumeName phone skills' // ✅ ensure email is included
    );

    const formatted = applications.map((app) => {
      const applicant = app.applicant;

      return {
        _id: applicant._id,
        username: applicant.username,
        email: applicant.email,
        phone: applicant.phone,
        skills: applicant.skills,
        resumeName: applicant.resumeName
      };
    });

    res.status(200).json({ applicants: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getApplicantUser=async(req,res)=>{
  try {
        const user=await User.findById(req.params.userId).select('-password');
     if (!user) return res.status(404).json({ message: 'User not found' });

  return res.status(200).json({ applicant: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error ' }); 
  }
 
}

const openpdf=async(req,res)=>{
   const fileName = decodeURIComponent(req.params.filename);
  const filePath = path.resolve(__dirname, '../uploads/cv', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="' + fileName + '"');
  res.sendFile(filePath);
  }

 module.exports = {allApplication, applicant,getApplicantUser,openpdf };

