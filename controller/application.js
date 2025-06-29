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
 const { jobId } = req.params;
 
  try {
    // Fetch applications with populated applicant data
    const applications = await Application.find({ job: jobId }).populate('applicant', 'username email,phone,skill,resume');

    // Filter out applications where applicant data is missing
    const formatted = applications
      .filter(app => app.applicant) // Only include those with a valid applicant reference
      .map(app => ({
        _id: app._id,
        status: app.status,
        username: app.applicant.username,
        email: app.applicant.email,
        resumeName: app.resume?.name || '',
        resumeUrl: app.resume?.url || '',
      }));

    res.status(200).json({ applicants: formatted });
  } catch (err) {
    console.error('Error fetching applicants:', err.message);
    res.status(500).json({ message: 'Server error while fetching applicants' });
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

