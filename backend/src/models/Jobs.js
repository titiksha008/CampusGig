// //modls/job.js

// import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   category: String,
//   skills: [String], // ✅ new field for required skills
//   price: Number,
//   deadline: Date,
//   postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // ✅ new field
// },
//   { timestamps: true }
// );

// export default mongoose.models.Job || mongoose.model("Job", jobSchema);



import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // Existing fields
    title: String,
    description: String,
    category: String,
    skills: [String],
    price: Number, // price in rupees
    deadline: Date,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔹 NEW: Payment + lifecycle fields
    status: {
      type: String,
      enum: [
        "OPEN",
        "ACCEPTED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "DISPUTE",
      ],
      default: "OPEN",
    },

    payment: {
      orderId: { type: String }, // Razorpay order_id
      paymentId: { type: String }, // Razorpay payment_id
      signature: { type: String }, // Optional client verification
      captured: { type: Boolean, default: false }, // Payment captured?
      heldAmount: { type: Number }, // in paise (₹499 => 49900)
      platformFee: { type: Number },
      workerPayout: { type: Number },
      payoutId: { type: String }, // RazorpayX or manual UTR
      status: {
        type: String,
        enum: ["NONE", "PENDING", "PAID", "REFUNDED", "FAILED"],
        default: "NONE",
      },
    },

    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", jobSchema);
