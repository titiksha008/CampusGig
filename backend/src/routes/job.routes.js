// backend/src/routes/job.routes.js
import express from "express";
import Job from "../models/Job.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a job
router.post("/", verifyToken, async (req, res) => {
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

export default router;
