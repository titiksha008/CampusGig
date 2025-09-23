// models/AssignedJob.js
import mongoose from "mongoose";

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
