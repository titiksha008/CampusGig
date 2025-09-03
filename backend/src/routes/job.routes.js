// // backend/src/routes/job.routes.js
// import express from "express";
// import Job from "../models/Job.js";
// import { verifyToken } from "../middleware/auth.middleware.js";

// const router = express.Router();

// // Create a job
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const job = new Job({
//       ...req.body,
//       postedBy: req.user._id // attach user ID from token
//     });
//     await job.save();
//     res.status(201).json(job);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all jobs
// router.get("/", async (req, res) => {
//   try {
//     const jobs = await Job.find().populate("postedBy", "name email");
//     res.json(jobs);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
// backend/src/routes/job.routes.js
import express from "express";
import Job from "../models/Job.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a job
router.post("/", auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id // attach user ID from token
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Accept Job -------------------
router.post("/:id/accept", auth, async (req, res) => {
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
