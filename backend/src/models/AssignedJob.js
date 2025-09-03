import mongoose from "mongoose";

const assignedJobSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // extra denormalized fields (for clarity in MongoDB Atlas)
  jobTitle: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },

  status: { type: String, enum: ["accepted", "passed"], required: true },
  assignedAt: { type: Date, default: Date.now }
});

export default mongoose.model("AssignedJob", assignedJobSchema);
