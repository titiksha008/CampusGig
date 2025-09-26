
<<<<<<< HEAD
// // // models/User.js
// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: { type: String, required: true },
// //     email: { type: String, required: true, unique: true },
// //     password: { type: String, required: true }, // hashed password
// //     role: { type: String, enum: ["employer", "freelancer"], required: true },
// //     collegeId: { type: String, required: true },
// //     branch: { type: String },
// //     year: { type: String },

// //     // Profile-related fields
// //     bio: { type: String, default: "" },
// //     profilePic: { type: String, default: "" },

// //     // Skills & Portfolio
// //     skills: [{ type: String }],
// //     portfolio: [
// //       {
// //         title: { type: String },
// //         img: { type: String },
// //         link: { type: String }
// //       }
// //     ],

// //     // Campus gigs / tasks completed
// //     tasksDone: [
// //       {
// //         title: { type: String },
// //         status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" }
// //       }
// //     ],

// //     // Contacts / Social Links
// //     contacts: {
// //       github: { type: String },
// //       linkedin: { type: String },
// //       email: { type: String }
// //     },

// //     // Ratings & Badges
// //     rating: { type: Number, default: 0 },
// //     badges: [String]
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("User", userSchema);

// // //models/User.js
// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: { type: String, required: true },
// //     email: { type: String, required: true, unique: true },
// //     password: { type: String, required: true }, // hashed
// //     role: { type: String, enum: ["employer", "freelancer"], required: true },
// //     collegeId: { type: String, required: true },
// //     branch: String,
// //     year: String,
// //     skills: [String],
// //     portfolio: String,
// //     rating: { type: Number, default: 0 },
// //     badges: [String]
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("User", userSchema);

// // models/User.js
=======
// //models/User.js
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
<<<<<<< HEAD
//     password: { type: String, required: true }, // hashed password
//     role: { type: String, enum: ["employer", "freelancer"], required: true },
//     collegeId: { type: String, required: true },
//     branch: { type: String },
//     college: { type: String },
//     year: { type: String },

//     // Profile-related fields
//     bio: { type: String, default: "" },
//     profilePic: { type: String, default: "" },

//     // Ratings & Badges
//     rating: { type: Number, default: 0 },
//     badges: [String],
//     jobsPosted: { type: Number, default: 0 } , // ✅ add this

//     // Skills & Portfolio
//     skills: [{ type: String }],
//     portfolio: [
//       {
//         title: { type: String },
//         img: { type: String },
//         link: { type: String }
//       }
//     ],

//     // Campus gigs / tasks completed
//     tasksDone: [
//       {
//         title: { type: String },
//         status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" }
//       }
//     ],

//     // Contacts / Social Links
//     contacts: {
//       phone: { type: String },  
//       github: { type: String },
//       linkedin: { type: String },
//       email: { type: String }
//     },

//     // Ratings & Badges
=======
//     password: { type: String, required: true }, // hashed
//     role: { type: String, enum: ["employer", "freelancer"], required: true },
//     collegeId: { type: String, required: true },
//     branch: String,
//     year: String,
//     skills: [String],
//     portfolio: String,
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
//     rating: { type: Number, default: 0 },
//     badges: [String]
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);

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

<<<<<<< HEAD
    // ✅ Track jobs
    jobsPosted: { type: Number, default: 0 },
    jobsAccepted: { type: Number, default: 0 }, // <-- add this field
=======
    // Ratings & Badges
    rating: { type: Number, default: 0 },   // average rating
    ratings: [{ type: Number, default: [] }] ,// store all ratings

    badges: [String],
    jobsPosted: { type: Number, default: 0 } , // ✅ add this
    jobsAccepted: { type: Number, default: 0 }, // ✅ add this
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6

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

    // Contacts / Social Links
    contacts: {
<<<<<<< HEAD
      phone: { type: String },
=======
      phone: { type: String },  
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      github: { type: String },
      linkedin: { type: String },
      email: { type: String }
    },
<<<<<<< HEAD

    // Ratings & Badges
    rating: { type: Number, default: 0 },
    badges: [String]
=======
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
