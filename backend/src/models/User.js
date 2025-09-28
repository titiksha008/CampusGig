
// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password
    role: { type: String, enum: ["employer", "freelancer"], required: true },
    collegeId: { type: String, required: true },
    branch: { type: String },
    college: { type: String },
    year: { type: String },

    // Profile-related fields
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },


    // ✅ Track jobs
    jobsPosted: { type: Number, default: 0 },
    jobsAccepted: { type: Number, default: 0 }, // <-- add this field

    // Ratings & Badges
    rating: { type: Number, default: 0 },   // average rating
    ratings: [{ type: Number, default: [] }] ,// store all ratings

    badges: [String],
    jobsPosted: { type: Number, default: 0 } , // ✅ add this
    jobsAccepted: { type: Number, default: 0 }, // ✅ add this

    // Skills & Portfolio
    skills: [{ type: String }],
    portfolio: [
      {
        title: { type: String },
        img: { type: String },
        link: { type: String }
      }
    ],

    // Campus gigs / tasks completed
    tasksDone: [
      {
        title: { type: String },
        status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" }
      }
    ],
    portfolio: [
  {
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String }, // e.g., GitHub/Drive/Figma link
    createdAt: { type: Date, default: Date.now }
  }
],


    // Contacts / Social Links
    contacts: {

      phone: { type: String },

      phone: { type: String },  

      github: { type: String },
      linkedin: { type: String },
      email: { type: String }
    },


    // Ratings & Badges
    rating: { type: Number, default: 0 },
    badges: [String]

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
