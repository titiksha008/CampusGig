// backend/src/routes/job.routes.js
import express from "express";
import Job from "../models/Jobs.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";
import User from "../models/User.js"; // ✅ import User model at the top

const router = express.Router();

// Create a job
router.post("/", auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id // attach user ID from token
    });
    await job.save();
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { jobsPosted: 1 }  // increment by 1
    });
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// GET all jobs with optional search and role filters
router.get("/", async (req, res) => {
  try {
    const { search, role } = req.query;
    let filter = {};

    // 🔎 Search by title OR description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // 🎭 Filter by category/role
    if (role && role !== "") {
      filter.category = { $regex: role, $options: "i" };
    }

    const jobs = await Job.find(filter).populate("postedBy", "name email");
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------- Accept Job -------------------
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.acceptedBy) {
      return res.status(400).json({ message: "Job already accepted" });
    }

    job.acceptedBy = req.user._id;
    await job.save();

    const assigned = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      jobTitle: job.title,           // ✅ denormalized
      studentName: req.user.name,    // ✅ denormalized
      studentEmail: req.user.email,  // ✅ denormalized
      status: "accepted"
    });

    res.json({ message: "Job accepted", job, assigned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Pass Job -------------------
router.post("/:id/pass", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const assigned = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      jobTitle: job.title,           
      studentName: req.user.name,    
      studentEmail: req.user.email,  
      status: "passed"
    });

    res.json({ message: "Job passed", assigned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;