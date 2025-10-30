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
    const baseURL = 'https://jobportal-backend-d315.onrender.com';

    const applications = await Application.find({ job: jobId }).populate(
      'applicant',
      'username email phone skills' // <-- corrected field selection
    );

    const formatted = applications
      .filter(app => app.applicant)
      .map(app => ({
        _id: app._id,
        status: app.status,
        username: app.applicant.username,
        email: app.applicant.email,
        phone: app.applicant.phone || '',
        skills: app.applicant.skills || [],
        resumeName: app.resume?.name || '',
        resumeUrl: app.resume?.name
          ? `${baseURL}/resume/${encodeURIComponent(app.resume.name)}`
          : null,
      }));

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

const openpdf = async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.filename);
    const filePath = path.resolve(__dirname, '../uploads/cv', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error opening PDF:', error);
    res.status(500).json({ message: 'Error reading file' });
  }
};

 module.exports = {allApplication, applicant,getApplicantUser,openpdf };

