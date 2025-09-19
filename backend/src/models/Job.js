// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number },
    deadline: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🔑 Add this field
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
