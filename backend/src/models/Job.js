// import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     category: { type: String, required: true },
//     price: { type: Number, required: true },
//     deadline: { type: Date, required: true },
//     postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     status: { type: String, enum: ["open", "assigned", "completed"], default: "open" }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Job", jobSchema);
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  deadline: Date,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } // ✅ new field
});

export default mongoose.model("Job", jobSchema);
