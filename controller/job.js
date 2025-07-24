const Job = require("../models/job");
const mongoose = require("mongoose");
const Application = require("../models/application");

const allJob = async (req, res) => {
  try {
    const { search, category, skill, page = 1, limit = 10 } = req.query;

    const query = {};
    const currentPage = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (currentPage - 1) * limitNum;

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (skill) {
      const skillsArray = skill.split(",").map((s) => s.trim());
      query.skill = { $in: skillsArray };
    }

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(
      query,
      search ? { score: { $meta: "textScore" } } : {}
    )
      .sort(search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      total,
      page: currentPage,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const findJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Job ID required" });

    const job = await Job.findById(id).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ data: job });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const myJob = async (req, res) => {
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
    console.error("Error fetching jobs with applicant count:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createJob = async (req, res) => {
  try {
    const { title, description, company, location, category, salaryRange, skill, deadline } = req.body;

    if (!title || !description || !company || !location || !category || !salaryRange || !skill || !deadline) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newJob = await Job.create({
      title,
      description: typeof description === "string" ? description.split(".") : description,
      company,
      location,
      category,
      salaryRange,
      skill: typeof skill === "string" ? skill.split(",") : skill,
      deadline,
      postedBy: req.user.userId,
      recruiter: req.user.userId,
    });

    return res.status(200).json({ data: newJob });
  } catch (error) {
    console.log("Error creating job:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Job ID required" });

    const editJob = await Job.findByIdAndUpdate({ _id: id }, req.body, { new: true });
    res.status(200).json({ data: editJob });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Job ID required" });

    const deletedJob = await Job.findByIdAndDelete({ _id: id });
    res.status(200).json({ data: deletedJob });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getApply = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ data: job });
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ message: "Failed to fetch job details" });
  }
};

const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;
    const resumeFile = req.file;

    if (!resumeFile) return res.status(400).json({ message: "Resume file is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyApplied = await Application.findOne({ job: jobId, applicant: userId });
    if (alreadyApplied) return res.status(400).json({ message: "You already applied to this job" });

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
    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error while applying for job" });
  }
};

const getApplicantsByJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const applicants = await Application.find({ job: jobId })
      .populate("applicant", "name email")
      .select("-resume.data");

    res.status(200).json({ data: applicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Server error fetching applicants" });
  }
};

const downloadResume = async (req, res) => {
  try {
    const appId = req.params.appId;

    const application = await Application.findById(appId);
    if (!application || !application.resume || !application.resume.data) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.set({
      "Content-Type": application.resume.contentType,
      "Content-Disposition": `attachment; filename="${application.resume.name}"`,
    });

    res.send(application.resume.data);
  } catch (error) {
    console.error("Error downloading resume:", error);
    res.status(500).json({ message: "Server error downloading resume" });
  }
};

module.exports = {
  allJob,
  myJob,
  createJob,
  updateJob,
  deleteJob,
  findJob,
  applyJob,
  getApply,
  getApplicantsByJob,
  downloadResume,
};
