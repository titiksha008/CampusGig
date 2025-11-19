import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const run = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://CampusUser:Campus123@campuscluster.scwsk8p.mongodb.net/campusdb?retryWrites=true&w=majority&appName=CampusCluster"
    );

    console.log("MongoDB connected");

    const email = "siya00082@gmail.com"; // SAME EVERYWHERE

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists!");
      mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash("tia08", 10);

    const admin = new User({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      collegeId: "admin001",
    });

    await admin.save();
    console.log("Admin user created!");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
    mongoose.connection.close();
  }
};

run();
