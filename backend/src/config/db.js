<<<<<<< HEAD
=======
//config/db.js
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
