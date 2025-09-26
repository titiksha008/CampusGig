<<<<<<< HEAD
=======
//app.js
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
<<<<<<< HEAD

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
=======
import chatRoutes from "./routes/chatRoutes.js";


const app = express();
// app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true,              // ✅ allow cookies
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
<<<<<<< HEAD
// backend/index.js


app.use("/uploads", express.static("uploads"));


app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);


// ...
app.use("/api/jobs", jobRoutes);


export default app;
=======

app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

app.use("/api/chat", chatRoutes);


export default app;
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
