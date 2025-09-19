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

// export default router;
// routes/job.routes.js
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

    // build query: only jobs that are NOT yet accepted
    const query = { acceptedBy: null };

    if (search) {
      query.title = { $regex: search, $options: "i" }; // case-insensitive
    }
    if (role) {
      query.category = role;
    }

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- Create a Job -------------------
 */
router.post("/", auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id,
    });
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

    if (job.acceptedBy) {
      return res.status(400).json({ message: "Job already accepted" });
    }

    // Mark job accepted by current user
    job.acceptedBy = req.user._id;
    await job.save();

    // Create AssignedJob record
    const assigned = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      jobTitle: job.title,
      studentName: req.user.name,
      studentEmail: req.user.email,
      status: "accepted",
    });

    // Increment user's acceptedJobsCount
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { acceptedJobsCount: 1 },
    });

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
      .populate({
        path: "job",
        populate: { path: "postedBy", select: "name email" }, // include job poster
      })
      .populate("student", "name email") // include student details
      .sort({ assignedAt: -1 });

    res.json(acceptedJobs);
  } catch (err) {
    console.error("Error fetching accepted jobs:", err);
    res.status(500).json({ error: err.message });
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
