<<<<<<< HEAD
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

// export default router;import express from "express";
import express from "express";
import Job from "../models/Job.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

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
      postedBy: req.user._id, // link job to logged-in user
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.error("Error posting job:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

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
=======
import express from "express";
import Job from "../models/Jobs.js";
import AssignedJob from "../models/AssignedJob.js";
import { auth } from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

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

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------- GET all jobs (unaccepted, optional search/filter) -------------------
router.get("/", async (req, res) => {
  try {
    const { search, role } = req.query;
    let filter = { acceptedBy: null }; // ✅ Only unaccepted jobs

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
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
/**
 * ------------------- GET Accepted Jobs (student) -------------------
 */
=======
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
      status: "accepted", // ✅ updated enum
      rating: null,
      review: null
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { jobsAccepted: 1 } });

    res.json({ message: "Job accepted", job, assigned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Mark Job Completed -------------------
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const assignedJob = await AssignedJob.findById(req.params.id);
    if (!assignedJob) return res.status(404).json({ message: "Assigned job not found" });
    if (assignedJob.status !== "accepted")
      return res.status(400).json({ message: "Only accepted jobs can be completed" });

    assignedJob.status = "completed"; // ✅ update status
    await assignedJob.save();

    res.json({ message: "Job marked as completed", assignedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Rate Completed Job -------------------
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    const assignedJob = await AssignedJob.findById(req.params.id);
    if (!assignedJob) return res.status(404).json({ message: "Job not found" });
    if (assignedJob.status !== "completed")
      return res.status(400).json({ message: "Job not completed yet" });

    // Update assigned job
    assignedJob.rating = rating;
    assignedJob.review = review;
    assignedJob.status = "rated";
    await assignedJob.save();

    // Update freelancer's ratings
    const user = await User.findById(assignedJob.student);
    if (user) {
      // Ensure ratings array exists
      user.ratings = user.ratings || [];
      user.ratings.push(rating);  // Add new rating
      user.rating = user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length; // Average
      await user.save();
    }

    res.json({ message: "Rating submitted", assignedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ------------------- Get Accepted Jobs for Current User -------------------
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
router.get("/accepted", auth, async (req, res) => {
  try {
    const acceptedJobs = await AssignedJob.find({
      student: req.user._id,
<<<<<<< HEAD
      status: { $in: ["accepted", "completed", "rated"] },
=======
      status: { $in: ["accepted", "completed", "rated"] } // ✅ status filter
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    })
      .populate({ path: "job", populate: { path: "postedBy", select: "name email" } })
      .populate("student", "name email")
      .sort({ assignedAt: -1 });

    res.json(acceptedJobs);
  } catch (err) {
<<<<<<< HEAD
    console.error("Error fetching accepted jobs:", err);
=======
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
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

=======
// ------------------- Get Jobs Posted by Current User -------------------
router.get("/my", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).populate("acceptedBy", "name email").lean();

    const jobIds = jobs.map(j => j._id);
    const assigned = await AssignedJob.find({ job: { $in: jobIds } }).populate("student", "name email").lean();

    const jobsWithStatus = jobs.map(job => {
      const assignedEntry = assigned.find(a => (a.job?._id || a.job).toString() === job._id.toString());
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      return {
        ...job,
        status: assignedEntry?.status || "pending",
        acceptedBy: assignedEntry ? assignedEntry.student : null,
        assignedJobId: assignedEntry?._id,
        rating: assignedEntry?.rating || null,
<<<<<<< HEAD
        review: assignedEntry?.review || null,
=======
        review: assignedEntry?.review || null
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      };
    });

    res.json(jobsWithStatus);
  } catch (err) {
<<<<<<< HEAD
    console.error("Error fetching my jobs:", err);
=======
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

<<<<<<< HEAD
=======
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    // Count accepted jobs
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
    res.status(500).json({ error: err.message });
  }
});

>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
export default router;
