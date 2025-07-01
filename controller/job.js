const Job = require("../models/job");
const mongoose=require('mongoose')
const Application=require('../models/application')

const allJob = async (req, res) => {
  try {
    const {
      search,
      category,
      skill,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    const currentPage = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (currentPage - 1) * limitNum;

    // 🔍 Full-text search on title and company
    if (search) {
      query.$text = { $search: search };
    }

    // 🎯 Category filter
    if (category) {
      query.category = category;
    }

    // 🛠 Skill filter
    if (skill) {
      const skillsArray = skill.split(',').map((s) => s.trim());
      query.skill = { $in: skillsArray };
    }

    // 📊 Count total matching jobs
    const total = await Job.countDocuments(query);

    // ⚡ Fast, sorted, lean fetch
    const jobs = await Job.find(
      query,
      search ? { score: { $meta: 'textScore' } } : {}
    )
      .sort(search ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // ⚡ faster than default

    res.status(200).json({
      total,
      page: currentPage,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /alljob/:id

  const findJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'id not found' });
    }

    const job = await Job.findById(id); // ✅ fix here

    if (!job) return res.status(404).json({ message: 'Job not found' });

    console.log(job);
    res.status(200).json({ data: job });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


  const myJob=async(req,res)=>{
   try {
    const recruiterId = req.user.userId;

    const jobs = await Job.find({ postedBy: new mongoose.Types.ObjectId(recruiterId) }).lean();

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job, applicantCount };
      })
    );

    res.status(200).json({ data: jobsWithCounts });
  } catch (error) {
    console.error('Error fetching jobs with applicant count:', error);
    res.status(500).json({ message: 'Server error' });
  }
  } 


const createJob = async (req, res) => {
  try {
    const { title, description, company, location, category, salaryRange, skill, deadline } = req.body;

    if (!title || !description || !company ||!location|| !category || !salaryRange || !skill || !deadline) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newJob = await Job.create({
      title,
      description: typeof req.body.description === 'string' ? req.body.description.split('.') : req.body.description,
      company,
      location,
      category,
      salaryRange,
      skill: typeof req.body.skill === 'string' ? req.body.skill.split(',') : req.body.skill,
      deadline,
      postedBy: req.user.userId, // FIXED: match schema
      recruiter: req.user.userId  // <-- optional, or leave null/undefined
    });

    return res.status(200).json({ data: newJob });
  } catch (error) {
    console.log("Error creating job:", error);
    return res.status(500).json({ error: "Server error" }); 
  }
};

const updateJob=async(req,res)=>{
  try {
    const{id}=req.params
    if(!id){
      res.status(400).json({error:"id not found"})
    }
    const editJob=await Job.findByIdAndUpdate({_id:id},req.body,{new:true}) 
    res.status(200).json({data:editJob})
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Server error" });
  }
}
const deleteJob=async(req,res)=>{
  try {
    const{id}=req.params
    if(!id){
      res.status(400).json({error:"id not found"})
    }
    const deleteJob=await Job.findByIdAndDelete({_id:id})
     res.status(200).json({data:deleteJob})
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
const getApply=async(req,res)=>{
    try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ data: job });
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ message: 'Failed to fetch job details' });
  }
}
  
const applyJob=async(req,res)=>{

try {
   const jobId = req.params.id;
    const userId = req.user.userId;
    const resumeFile = req.file;

  
    if (!resumeFile) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = await Application.findOne({ job: jobId, applicant: userId });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You already applied to this job' });
    }

    const application = new Application({
      job: jobId,
      applicant: userId,
      resume: {  
        data: resumeFile.buffer,
        contentType: resumeFile.mimetype,
        name: resumeFile.originalname,
      },
    });

    await application.save();
    return res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json({ message: 'Server error while applying for job' });
  }

}
module.exports = {allJob,myJob,createJob,updateJob,deleteJob,findJob,applyJob,getApply};
