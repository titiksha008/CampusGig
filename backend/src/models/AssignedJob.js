// models/AssignedJob.js
import mongoose from "mongoose";

<<<<<<< HEAD
const AssignedJobSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "completed", "rated"],
    default: "accepted",
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },

  // ⭐️ New fields
 rating: {
  type: Number,
  min: 1,
  max: 5,
  default: null, // important
},

  review: {
    type: String,
    trim: true,
  },
});

const AssignedJob = mongoose.model("AssignedJob", AssignedJobSchema);
export default AssignedJob;
=======
const assignedJobSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // extra denormalized fields (for clarity in MongoDB Atlas)
  jobTitle: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },

  // ✅ Updated status field
  status: { type: String, enum: ["accepted", "completed", "rated"], default: "accepted" },

  assignedAt: { type: Date, default: Date.now },

  // ✅ New fields for ratings/reviews
  rating: { type: Number, min: 1, max: 5, default: null },
  review: { type: String, trim: true },
});

export default mongoose.model("AssignedJob", assignedJobSchema);
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
