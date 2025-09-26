<<<<<<< HEAD
// backend/src/middleware/auth.middleware.js
=======

// //auth.middleware.js
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const auth = async (req, res, next) => {
//   try {
//     const token = req.cookies?.token; // ✅ read token from cookie
//     if (!token) return res.status(401).json({ message: "No token" });

//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(payload.id).select("-password");
//     if (!user) return res.status(401).json({ message: "Invalid user" });

//     req.user = user;
//     next();
//   } catch(err) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };
// auth.middleware.js
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    console.log("🔍 Cookies received:", req.cookies);

    const token = req.cookies?.token;
    if (!token) {
      console.log("❌ No token found in cookies");
<<<<<<< HEAD
      return res.status(401).json({ message: "No token provided" });
    }

=======
      return res.status(401).json({ message: "No token" });
    }

    console.log("✅ Token found:", token);

>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Decoded payload:", payload);

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      console.log("❌ No user found with ID:", payload.id);
      return res.status(401).json({ message: "Invalid user" });
    }

<<<<<<< HEAD
=======
    console.log("✅ Authenticated user:", user.email);

>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
