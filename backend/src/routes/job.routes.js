import express from "express";
import Job from "../models/Jobs.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import Bid from "../models/Bid.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  notifyNewJob,
  notifyNewBid,
  notifyJobAccepted,
  notifyJobCompleted,
  notifyJobRated,
} from "../utils/notification.js";

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

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const bid = await Bid.create({
      job: req.params.id,
      student: req.user._id,
      bidAmount,
    });

    // Notify job poster about new bid (non-blocking)
    try {
      const notifBid = { userId: bid.student, message: req.body.message || "" };
      const notifJob = { posterId: job.postedBy, title: job.title, _id: job._id };
      notifyNewBid(notifBid, notifJob).catch(console.error);
    } catch (notifyErr) {
      console.error("notifyNewBid error:", notifyErr);
    }

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

    // Notify both parties (non-blocking)
    try {
      const notifJob = { posterId: job.postedBy, title: job.title, _id: job._id };
      notifyJobAccepted(notifJob, bid.student._id).catch(console.error);
    } catch (notifyErr) {
      console.error("notifyJobAccepted error:", notifyErr);
    }

    res.json({ message: "Bid selected and job assigned", assignedJob });
  } catch (err) {
    console.error("Error selecting bid:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Create a Job -------------------
router.post("/", auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id
    });
    await job.save();

    // Increment user's jobsPosted
    await User.findByIdAndUpdate(req.user._id, { $inc: { jobsPosted: 1 } });

    // Notify poster about new job (non-blocking)
    try {
      const notifJob = { posterId: job.postedBy, title: job.title, _id: job._id };
      notifyNewJob(notifJob).catch(console.error);
    } catch (notifyErr) {
      console.error("notifyNewJob error:", notifyErr);
    }

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------- GET all jobs (unaccepted, optional search/filter) -------------------
router.get("/", auth, async (req, res) => {
  try {
    const { search, role } = req.query;
    const user = await User.findById(req.user._id).lean();

    // Make sure passedJobs are ObjectIds
    const passedJobIds = (user?.passedJobs || []).map(
      id => new mongoose.Types.ObjectId(id)
    );

    // 🛠 Debug log
    console.log("Passed job IDs:", passedJobIds);

    // Base filter: only unaccepted jobs + exclude passed jobs
    let filter = {
      acceptedBy: null,
      _id: { $nin: passedJobIds }
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (role && role !== "") {
      filter.category = { $regex: role, $options: "i" };
    }

    const jobs = await Job.find(filter).populate("postedBy", "name email");
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs list:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Accept Job -------------------
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.acceptedBy) return res.status(400).json({ message: "Job already accepted" });

    job.acceptedBy = req.user._id;
    await job.save();

    const assigned = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      jobTitle: job.title,
      studentName: req.user.name,
      studentEmail: req.user.email,
      status: "accepted",
      rating: null,
      review: null
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { jobsAccepted: 1 } });

    res.json({ message: "Job accepted", job, assigned });
  } catch (err) {
    console.error("Error accepting job:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Mark Job Completed -------------------
router.put("/:id/complete", auth, async (req, res) => {
  try {
    console.log('📝 Processing job completion:', req.params.id);

    // Fetch assigned job with populated fields
    const assignedJob = await AssignedJob.findById(req.params.id);
    if (!assignedJob) {
      console.log('❌ Assigned job not found:', req.params.id);
      return res.status(404).json({ message: "Assigned job not found" });
    }

    if (assignedJob.status !== "accepted") {
      console.log('❌ Invalid job status:', assignedJob.status);
      return res.status(400).json({ message: "Only accepted jobs can be completed" });
    }

    // Fetch related data in parallel
    const [job, student] = await Promise.all([
      Job.findById(assignedJob.job).select('title postedBy'),
      User.findById(assignedJob.student).select('name email'),
    ]);

    // Update status
    assignedJob.status = "completed";
    await assignedJob.save();

    // Prepare populated data for notification
    const populatedAssignedJob = {
      ...assignedJob.toObject(),
      job: job,
      student: student
    };
    // Send completion emails and wait for result so we can surface errors
    console.log('📧 Sending completion notifications...');
    try {
      const notifResult = await notifyJobCompleted(populatedAssignedJob);
      if (!notifResult || !notifResult.success) {
        console.error('❌ Some or all completion notifications failed', notifResult);
      }

      res.json({ 
        message: "Job marked as completed", 
        assignedJob: populatedAssignedJob,
        notification: notifResult || null,
        nextStep: "The job poster will be notified to provide a rating."
      });
    } catch (notifyErr) {
      console.error("❌ Error sending completion notifications:", notifyErr);
      // Still return success for completion but include error details
      res.json({ 
        message: "Job marked as completed", 
        assignedJob: populatedAssignedJob,
        notification: { success: false, error: notifyErr?.message || String(notifyErr) },
        nextStep: "The job poster will be notified to provide a rating."
      });
    }
  } catch (err) {
    console.error("❌ Error marking job completed:", err);
    res.status(500).json({ error: err.message });
  }
});

// // ------------------- Rate Completed Job -------------------
// router.post("/:id/rate", auth, async (req, res) => {
//   try {
//     const { rating, review } = req.body;

//     const assignedJob = await AssignedJob.findById(req.params.id);
//     if (!assignedJob) return res.status(404).json({ message: "Job not found" });
//     if (assignedJob.status !== "completed")
//       return res.status(400).json({ message: "Job not completed yet" });

//     assignedJob.rating = rating;
//     assignedJob.review = review;
//     assignedJob.status = "rated";
//     await assignedJob.save();

//  const user = await User.findById(assignedJob.student);
//     if (user) {
//       user.ratings = user.ratings || [];
//       user.ratings.push(rating);
//       user.rating = user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length;
//       await user.save();
//     }

//     // Send rating notification emails (non-blocking)
//     try {
//       notifyJobRated(assignedJob).catch(console.error);
//     } catch (notifyErr) {
//       console.error("Rating notification failed:", notifyErr);
//     }

//     res.json({ 
//       message: "Rating submitted", 
//       assignedJob,
//       updatedRating: user?.rating || null
//     });
//   } catch (err) {
//     console.error("Error submitting rating:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// ...existing code...

// ------------------- Rate Completed Job -------------------
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    console.log('📝 Processing rating submission:', { jobId: req.params.id, rating, review });

    const assignedJob = await AssignedJob.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title postedBy');
      
    if (!assignedJob) {
      console.log('❌ Job not found:', req.params.id);
      return res.status(404).json({ message: "Job not found" });
    }
    
    if (assignedJob.status !== "completed") {
      console.log('❌ Invalid job status:', assignedJob.status);
      return res.status(400).json({ message: "Job not completed yet" });
    }

    assignedJob.rating = rating;
    assignedJob.review = review;
    assignedJob.status = "rated";
    await assignedJob.save();

    const user = await User.findById(assignedJob.student);
    if (user) {
      user.ratings = user.ratings || [];
      user.ratings.push(rating);
      user.rating = user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length;
      await user.save();
    }

    // Send rating notification emails (non-blocking)
    try {
      console.log('📧 Triggering rating notification...');
      await notifyJobRated(assignedJob);
      console.log('✅ Rating notification sent successfully');
    } catch (notifyErr) {
      console.error("❌ Rating notification failed:", notifyErr);
    }

    res.json({ 
      message: "Rating submitted",
      assignedJob,
      updatedRating: user?.rating || null
    });
  } catch (err) {
    console.error("❌ Error submitting rating:", err);
    res.status(500).json({ error: err.message });
  }
});

// ...existing code...

// ------------------- Get Accepted Jobs for Current User -------------------
router.get("/accepted", auth, async (req, res) => {
  try {
    const acceptedJobs = await AssignedJob.find({
      student: req.user._id,
      status: { $in: ["accepted", "completed", "rated"] }
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

// ------------------- Get Jobs Posted by Current User -------------------
router.get("/my", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).populate("acceptedBy", "name email").lean();

    const jobIds = jobs.map(j => j._id);
    const assigned = await AssignedJob.find({ job: { $in: jobIds } }).populate("student", "name email").lean();

    const jobsWithStatus = jobs.map(job => {
      const assignedEntry = assigned.find(a => (a.job?._id || a.job).toString() === job._id.toString());
      return {
        ...job,
        status: assignedEntry?.status || "pending",
        acceptedBy: assignedEntry ? assignedEntry.student : null,
        assignedJobId: assignedEntry?._id,
        rating: assignedEntry?.rating || null,
        review: assignedEntry?.review || null
      };
    });

    res.json(jobsWithStatus);
  } catch (err) {
    console.error("Error fetching user's jobs:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    const acceptedJobsCount = await AssignedJob.countDocuments({
      student: req.user._id,
      status: { $in: ["accepted", "completed", "rated"] }
    });

    res.json({
      user: {
        ...user,
        jobsAccepted: acceptedJobsCount
      }
    });
  } catch (err) {
    console.error("Error fetching /me:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Pass Job -------------------
router.post("/:id/pass", auth, async (req, res) => {
  try {
    const jobId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Before:", user.passedJobs);

    user.passedJobs = user.passedJobs || [];

    const jobObjectId = new mongoose.Types.ObjectId(jobId);

    if (!user.passedJobs.some(id => id.equals(jobObjectId))) {
      user.passedJobs.push(jobObjectId);
      await user.save();
      console.log("After:", user.passedJobs);
    } else {
      console.log("Job already in passedJobs");
    }

    res.json({ message: "Job passed for this user" });
  } catch (err) {
    console.error("Error in /pass route:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;