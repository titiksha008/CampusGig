import express from "express";
import Job from "../models/Job.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";
import User from "../models/User.js"; // ✅ import User model

const router = express.Router();

// ------------------- Create a Job -------------------
router.post("/", auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id // attach user ID from token
    });

    await job.save();

    // increment jobsPosted count for employer
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { jobsPosted: 1 }
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(400).json({ error: err.message });
  }
});

// ------------------- Get Jobs (unaccepted + filters) -------------------
router.get("/", async (req, res) => {
  try {
    const { search, role } = req.query;
    let filter = { acceptedBy: null }; // ✅ only jobs not accepted

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
    console.error("Error fetching jobs:", err);
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

    // assign job to current user
    job.acceptedBy = req.user._id;
    await job.save();

    // create assignedJob record
    const assigned = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      jobTitle: job.title,
      studentName: req.user.name,
      studentEmail: req.user.email,
      status: "accepted"
    });

    // ✅ increment user's acceptedJobsCount
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { acceptedJobsCount: 1 }
    });

    res.json({ message: "Job accepted", job, assigned });
  } catch (err) {
    console.error("Error accepting job:", err);
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
    console.error("Error passing job:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
