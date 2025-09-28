// routes/job.routes.js
import express from "express";
import Job from "../models/Job.js";
import AssignedJob from "../models/AssignedJob.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.middleware.js";
import Bid from "../models/Bid.js";

const router = express.Router();

/**
 * ------------------- Place a Bid -------------------
 */
router.post("/:id/bid", auth, async (req, res) => {
  try {
    const { bidAmount } = req.body;
    if (!bidAmount) return res.status(400).json({ message: "Bid amount required" });

    // Ensure max 5 bids per job
    const bidCount = await Bid.countDocuments({ job: req.params.id });
    if (bidCount >= 5) {
      return res.status(400).json({ message: "Maximum bids reached for this job" });
    }

    const bid = await Bid.create({
      job: req.params.id,
      student: req.user._id,
      bidAmount,
    });

    res.status(201).json({ message: "Bid placed successfully", bid });
  } catch (err) {
    console.error("Error placing bid:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Get all bids for a job (poster only) -------------------
 */
router.get("/:id/bids", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bids = await Bid.find({ job: req.params.id })
      .populate("student", "name email rating")
      .sort({ bidAmount: 1 });

    res.json(bids);
  } catch (err) {
    console.error("Error fetching bids:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Select a Winning Bid -------------------
 */
// ------------------- Select a Winning Bid -------------------
router.put("/:jobId/select/:bidId", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bid = await Bid.findById(req.params.bidId).populate("student");
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    // ✅ Mark this bid as accepted
    bid.status = "accepted";
    await bid.save();

    // ✅ Mark others as rejected
    await Bid.updateMany(
      { job: req.params.jobId, _id: { $ne: req.params.bidId } },
      { $set: { status: "rejected" } }
    );

    // ✅ Update the job to mark it accepted
    job.acceptedBy = bid.student._id;
    await job.save();

    // ✅ Create an AssignedJob
    const assignedJob = await AssignedJob.create({
      job: job._id,
      student: bid.student._id,
      jobTitle: job.title,
      studentName: bid.student.name,
      studentEmail: bid.student.email,
      status: "accepted",
    });

    res.json({ message: "Bid selected and job assigned", assignedJob });
  } catch (err) {
    console.error("Error selecting bid:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- POST Job (create a new job) -------------------
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, category, price, deadline } = req.body;
    if (!title || !description || !category || !price || !deadline) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const job = await Job.create({
      title,
      description,
      category,
      price,
      deadline,
      postedBy: req.user._id,
    });

    // Increment user's jobsPosted
    await User.findByIdAndUpdate(req.user._id, { $inc: { jobsPosted: 1 } });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.error("Error posting job:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ------------------- GET all unaccepted jobs -------------------
 */
router.get("/", auth, async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = { acceptedBy: null };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const jobs = await Job.find(filter).populate("postedBy", "name email");
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Accept a job (student accepts a job) -------------------
 */
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.acceptedBy) return res.status(400).json({ message: "Job already accepted" });

    job.acceptedBy = req.user._id;
    await job.save();

    const assignedJob = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      status: "accepted",
      assignedAt: new Date(),
    });

    // Increment user's jobsAccepted
    await User.findByIdAndUpdate(req.user._id, { $inc: { jobsAccepted: 1 } });

    res.json({ message: "Job accepted successfully", job, assignedJob });
  } catch (err) {
    console.error("Error accepting job:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * ------------------- Mark Assigned Job as Completed -------------------
 */
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const assignedJob = await AssignedJob.findById(req.params.id);
    if (!assignedJob) return res.status(404).json({ message: "Assigned job not found" });
    if (assignedJob.status !== "accepted")
      return res.status(400).json({ message: "Only accepted jobs can be completed" });

    assignedJob.status = "completed";
    await assignedJob.save();

    res.json({ message: "Job marked as completed", assignedJob });
  } catch (err) {
    console.error("Error completing job:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Rate a completed job -------------------
 */
router.put("/:id/rate", auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const assignedJob = await AssignedJob.findById(req.params.id).populate("job");
    if (!assignedJob) return res.status(404).json({ message: "Assigned job not found" });

    // Only the job poster can rate
    if (String(assignedJob.job.postedBy) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized to rate this job" });

    if (assignedJob.status !== "completed")
      return res.status(400).json({ message: "Only completed jobs can be rated" });

    assignedJob.rating = rating;
    assignedJob.review = review;
    assignedJob.status = "rated";
    await assignedJob.save();

    // Update student's average rating
    const student = await User.findById(assignedJob.student);
    if (student) {
      student.ratings = student.ratings || [];
      student.ratings.push(rating);
      student.rating = student.ratings.reduce((a, b) => a + b, 0) / student.ratings.length;
      await student.save();
    }

    res.json({ message: "Job rated successfully", assignedJob });
  } catch (err) {
    console.error("Error rating job:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Get Accepted Jobs for Current User -------------------
 */
router.get("/accepted", auth, async (req, res) => {
  try {
    const acceptedJobs = await AssignedJob.find({
      student: req.user._id,
      status: { $in: ["accepted", "completed", "rated"] },
    })
      .populate({ path: "job", populate: { path: "postedBy", select: "name email" } })
      .populate("student", "name email")
      .sort({ assignedAt: -1 });

    res.json(acceptedJobs);
  } catch (err) {
    console.error("Error fetching accepted jobs:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Get My Posted Jobs (employer) -------------------
 */
router.get("/my", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).lean();
    const jobIds = jobs.map((j) => j._id);
    const assigned = await AssignedJob.find({ job: { $in: jobIds } }).populate("student", "name email").lean();

    const jobsWithStatus = jobs.map((job) => {
      const assignedEntry = assigned.find((a) => (a.job?._id || a.job).toString() === job._id.toString());
      return {
        ...job,
        status: assignedEntry?.status || "pending",
        acceptedBy: assignedEntry ? assignedEntry.student : null,
        assignedJobId: assignedEntry?._id,
        rating: assignedEntry?.rating || null,
        review: assignedEntry?.review || null,
      };
    });

    res.json(jobsWithStatus);
  } catch (err) {
    console.error("Error fetching my jobs:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

export default router;
