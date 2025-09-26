<<<<<<< HEAD

=======
// routes/auth.routes.js
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import { Router } from "express";
import { login,logout, signup, me, updateProfile } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected
router.get("/me", auth, me);
router.put("/me", auth, updateProfile); // <-- added update profile route

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
