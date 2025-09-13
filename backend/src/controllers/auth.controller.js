// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const signup = async (req, res) => {
//   try {
//     const { name, email, password, role, collegeId } = req.body;

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: "User already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashed, role, collegeId });

//     res.status(201).json({ message: "User created", user: { id: user._id, email: user.email } });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
//     res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// export const me = async (req, res) => {
//   res.json({ user: req.user });
// };//auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT and set cookie
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token expiry
  });

  // Set token in HTTP-only cookie
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // false on localhost, true on prod
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

};

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, collegeId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      collegeId,
    });

    // set cookie
    generateToken(res, user._id);

    res.status(201).json({
      message: "User created",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // set cookie
    generateToken(res, user._id);

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get current user (requires auth middleware)
export const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    res.json({user:req.user});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update profile (requires auth middleware)
export const updateProfile = async (req, res) => {
  try {
    console.log("req.user:", req.user);   // Log user coming from auth middleware
    console.log("req.body:", req.body);   // Log payload from frontend

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    //update user in db
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true } // also good to enforce schema
    ).select("-password");

    console.log("updatedUser:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (e) {
    console.error("Update profile error:", e); // ✅ log error
    res.status(500).json({ error: e.message });
  }
};

//logout
export const logout = (req, res) => {
  // res.clearCookie("token"); // clear cookie set at login
  res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",  // must match cookie settings
});

  res.status(200).json({ message: "Logged out successfully" });
};