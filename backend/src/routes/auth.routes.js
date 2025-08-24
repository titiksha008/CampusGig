import { Router } from "express";
import { login, signup, me } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, me);

export default router;
