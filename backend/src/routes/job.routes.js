// // routes/job.routes.js
// import express from "express";
// import Job from "../models/Job.js";
// import AssignedJob from "../models/AssignedJob.js";
// import { auth } from "../middleware/auth.middleware.js";
// import User from "../models/User.js";

// const router = express.Router();

// /**
//  * ------------------- GET Jobs (only unaccepted) -------------------
//  */
// router.get("/", auth, async (req, res) => {
//   try {
//     const jobs = await Job.find({ acceptedBy: null })
//       .populate("postedBy", "name email")
//       .sort({ createdAt: -1 });
//     res.json(jobs);
//   } catch (err) {
//     console.error("Error fetching jobs:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Mark Assigned Job as Completed
// router.put("/:id/complete", auth, async (req, res) => {
//   try {
//     const assignedJob = await AssignedJob.findById(req.params.id);
//     if (!assignedJob) {
//       return res.status(404).json({ message: "Assigned job not found" });
//     }

//     if (assignedJob.status !== "accepted") {
//       return res
//         .status(400)
//         .json({ message: "Only accepted jobs can be marked as completed" });
//     }

//     assignedJob.status = "completed";
//     await assignedJob.save();

//     // // ✅ Also update the parent Job (optional, mirror flag)
//     // await Job.findByIdAndUpdate(assignedJob.job, { status: "completed" });

//     res.json({ message: "Job marked as completed", assignedJob });
//   } catch (err) {
//     console.error("Error completing job:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * ------------------- GET Accepted Jobs (student) -------------------
//  */
// router.get("/accepted", auth, async (req, res) => {
//   try {
//     const acceptedJobs = await AssignedJob.find({
//       student: req.user._id,
//       status: { $in: ["accepted", "completed", "rated"] }, // ✅ include all states
//     })
//       .populate({ path: "job", populate: { path: "postedBy", select: "name email" } })
//       .populate("student", "name email")
//       .sort({ assignedAt: -1 });

//     res.json(acceptedJobs);
//   } catch (err) {
//     console.error("Error fetching accepted jobs:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ------------------- Accept a job (student accepts a job) -------------------
// router.put("/:id/accept", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     if (job.acceptedBy)
//       return res.status(400).json({ message: "Job already accepted" });

//     // ✅ Mark job as accepted by current user
//     job.acceptedBy = req.user._id;
//     await job.save();

//     // ✅ Create an AssignedJob entry
//     const assignedJob = await AssignedJob.create({
//       job: job._id,
//       student: req.user._id,
//       status: "accepted",
//       assignedAt: new Date(),
//     });

//     res.json({ message: "Job accepted successfully", job, assignedJob });
//   } catch (err) {
//     console.error("Error accepting job:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // ------------------- Rate a completed job -------------------
// router.put("/:id/rate", auth, async (req, res) => {
//   try {
//     const { rating, review } = req.body;

//     const assignedJob = await AssignedJob.findById(req.params.id).populate("job");
//     if (!assignedJob) {
//       return res.status(404).json({ message: "Assigned job not found" });
//     }

//     // Only the job poster can rate
//     if (String(assignedJob.job.postedBy) !== String(req.user._id)) {
//       return res.status(403).json({ message: "Not authorized to rate this job" });
//     }

//     if (assignedJob.status !== "completed") {
//       return res
//         .status(400)
//         .json({ message: "Only completed jobs can be rated" });
//     }

//     assignedJob.rating = rating;
//     assignedJob.review = review;
//     assignedJob.status = "rated";
//     await assignedJob.save();

//     res.json({ message: "Job rated successfully", assignedJob });
//   } catch (err) {
//     console.error("Error rating job:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /**
//  * ------------------- GET My Posted Jobs (employer) -------------------
//  */
// router.get("/my", auth, async (req, res) => {
//   try {
//     const jobs = await Job.find({ postedBy: req.user._id })
//       .populate("acceptedBy", "name email")
//       .lean();

//     const jobIds = jobs.map((j) => j._id);

//     const assigned = await AssignedJob.find({ job: { $in: jobIds } })
//       .populate("student", "name email")
//       .lean();

//   const jobsWithStatus = jobs.map((job) => {
//   const assignedEntry = assigned.find(
//     (a) => (a.job?._id || a.job).toString() === job._id.toString()
//   );

//   return {
//     ...job,
//     status: assignedEntry?.status || "pending",  // ✅ always from AssignedJob
//     acceptedBy: assignedEntry ? assignedEntry.student : null,
//     assignedJobId: assignedEntry?._id,
//     rating: assignedEntry?.rating || null,
//     review: assignedEntry?.review || null,
//   };
// });


//     res.json(jobsWithStatus);
//   } catch (err) {
//     console.error("Error fetching my jobs:", err);
//     res.status(500).json({ message: "Error fetching jobs" });
//   }
// });

// export default router;
import express from "express";
import Job from "../models/Job.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * ------------------- GET Jobs (only unaccepted) -------------------
 */
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ acceptedBy: null })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- GET Accepted Jobs (student) -------------------
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
 * ------------------- Accept a job (student accepts a job) -------------------
 */
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.acceptedBy)
      return res.status(400).json({ message: "Job already accepted" });

    job.acceptedBy = req.user._id;
    await job.save();

    const assignedJob = await AssignedJob.create({
      job: job._id,
      student: req.user._id,
      status: "accepted",
      assignedAt: new Date(),
    });

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
    if (!assignedJob) {
      return res.status(404).json({ message: "Assigned job not found" });
    }

    if (assignedJob.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Only accepted jobs can be marked as completed" });
    }

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
    if (!assignedJob) {
      return res.status(404).json({ message: "Assigned job not found" });
    }

    // Only the job poster can rate
    if (String(assignedJob.job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to rate this job" });
    }

    if (assignedJob.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Only completed jobs can be rated" });
    }

    assignedJob.rating = rating;
    assignedJob.review = review;
    assignedJob.status = "rated";
    await assignedJob.save();

    res.json({ message: "Job rated successfully", assignedJob });
  } catch (err) {
    console.error("Error rating job:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- GET My Posted Jobs (employer) -------------------
 */
router.get("/my", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate("acceptedBy", "name email")
      .lean();

    const jobIds = jobs.map((j) => j._id);

    const assigned = await AssignedJob.find({ job: { $in: jobIds } })
      .populate("student", "name email")
      .lean();

    const jobsWithStatus = jobs.map((job) => {
      const assignedEntry = assigned.find(
        (a) => (a.job?._id || a.job).toString() === job._id.toString()
      );

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
