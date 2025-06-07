const Job = require("../models/job");

const allJob = async (req, res) => {
  try {
    const {
      search,       // e.g. React or OpenAI
      category,     // fulltime | parttime | remote
      skill,        // comma-separated: "React,JavaScript"
      page = 1,     // default page
      limit = 10,   // default limit
    } = req.query;

    const query = {};

    // 🔍 Search in title or company
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Category filter
    if (category) {
      query.category = category;
    }

    // 🛠 Skill filter
    if (skill) {
      const skillsArray = skill.split(",").map((s) => s.trim());
      query.skill = { $in: skillsArray };
    }

    const skip = (page - 1) * limit;
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
    
      .sort({ createdAt: -1 }) // newest jobs first
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      limit: Number(limit),
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Server error" });
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
    res.status(500).json({ message: 'Server error', error });
  }
};


  


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
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    console.error('Job fetch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
  
const applyJob=async(req,res)=>{
 try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    job.resumePath = req.file.path; // Save path to DB
    await job.save();

    res.json({ success: true, message: 'Resume uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Resume upload failed' });
  }
}
module.exports = {allJob,createJob,updateJob,deleteJob,findJob,applyJob,getApply};
