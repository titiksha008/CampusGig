// import express from "express";
// import Job from "../models/Job.js";
// import AssignedJob from "../models/AssignedJob.js";
// import { auth } from "../middleware/auth.middleware.js";
// import User from "../models/User.js";

// const router = express.Router();

// /**
//  * ------------------- GET Jobs (with search & role filter) -------------------
//  */
// router.get("/", async (req, res) => {
//   try {
//     const { search, role } = req.query;

//     // build query
//     const query = {};
//     if (search) {
//       query.title = { $regex: search, $options: "i" }; // case-insensitive
//     }
//     if (role) {
//       query.category = role; // assuming "category" == role
//     }

//     const jobs = await Job.find(query)
//       .populate("postedBy", "name email")
//       .sort({ createdAt: -1 });

//     res.json(jobs);
//   } catch (err) {
//     console.error("Error fetching jobs:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * ------------------- Create a Job -------------------
//  */
// router.post("/", auth, async (req, res) => {
//   try {
//     const job = new Job({
//       ...req.body,
//       postedBy: req.user._id, // attach user ID from token
//     });
//     await job.save();
//     res.status(201).json(job);
//   } catch (err) {
//     console.error("Error creating job:", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// /**
//  * ------------------- Accept Job -------------------
//  */
// router.put("/:id/accept", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     if (job.acceptedBy) {
//       return res.status(400).json({ message: "Job already accepted" });
//     }

//     // Assign job to current user
//     job.acceptedBy = req.user._id;
//     await job.save();

//     // Create assignedJob record
//     const assigned = await AssignedJob.create({
//       job: job._id,
//       student: req.user._id,
//       jobTitle: job.title,
//       studentName: req.user.name,
//       studentEmail: req.user.email,
//       status: "accepted",
//     });

//     // Increment user's acceptedJobsCount
//     await User.findByIdAndUpdate(req.user._id, {
//       $inc: { acceptedJobsCount: 1 },
//     });

//     res.json({ message: "Job accepted", job, assigned });
//   } catch (err) {
//     console.error("Error accepting job:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
// /**
//  * ------------------- Get Accepted Jobs for Current User -------------------
//  */
// router.get("/accepted", auth, async (req, res) => {
//   try {
//     const acceptedJobs = await AssignedJob.find({
//       student: req.user._id,
//       status: "accepted",
//     })
//       .populate("job", "title description category price deadline postedBy") // fetch job details
//       .populate("student", "name email") // fetch student details
//       .sort({ assignedAt: -1 });

//     res.json(acceptedJobs);
//   } catch (err) {
//     console.error("Error fetching accepted jobs:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * ------------------- Pass Job -------------------
//  */
// router.post("/:id/pass", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     const assigned = await AssignedJob.create({
//       job: job._id,
//       student: req.user._id,
//       jobTitle: job.title,
//       studentName: req.user.name,
//       studentEmail: req.user.email,
//       status: "passed",
//     });

//     res.json({ message: "Job passed", assigned });
//   } catch (err) {
//     console.error("Error passing job:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;import express from "express";
import express from "express";
import Job from "../models/Job.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";
import User from "../models/User.js";


const router = express.Router();

/**
 * ------------------- GET Jobs (only unaccepted) -------------------
 */
router.get("/", async (req, res) => {
  try {
    const { search, role } = req.query;

    const query = { acceptedBy: null }; // only jobs not yet accepted

    if (search) query.title = { $regex: search, $options: "i" };
    if (role) query.category = role;

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: err.message });
  }
});
// routes/job.routes.js
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const assignedJob = await AssignedJob.findById(req.params.id);
    if (!assignedJob) return res.status(404).json({ message: "Job not found" });
    if (assignedJob.status !== "completed")
      return res.status(400).json({ message: "Job not completed yet" });

    assignedJob.rating = rating;
    assignedJob.status = "rated"; // mark as rated
    await assignedJob.save();

    // Optional: Update freelancer's average rating
    const user = await User.findById(assignedJob.student);
    if (user) {
      const ratings = user.ratings || [];
      ratings.push(rating);
      user.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      await user.save();
    }

    res.json({ message: "Rating submitted", assignedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Create a Job -------------------
 */
router.post("/", auth, async (req, res) => {
  try {
    const job = new Job({ ...req.body, postedBy: req.user._id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * ------------------- Accept Job -------------------
 */
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.acceptedBy)
      return res.status(400).json({ message: "Job already accepted" });

    job.acceptedBy = req.user._id;
    await job.save();

    const assigned = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      jobTitle: job.title,
      studentName: req.user.name,
      studentEmail: req.user.email,
      status: "accepted",
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { jobsAccepted: 1 } });

    res.json({ message: "Job accepted", job, assigned });
  } catch (err) {
    console.error("Error accepting job:", err);
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
      status: "accepted",
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
 * ------------------- Get Jobs Posted by Current User -------------------
 */
router.get("/my", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).populate(
      "acceptedBy",
      "name email"
    );
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching my jobs:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

/**
 * ------------------- Pass Job -------------------
 */
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
      status: "passed",
    });

    res.json({ message: "Job passed", assigned });
  } catch (err) {
    console.error("Error passing job:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
