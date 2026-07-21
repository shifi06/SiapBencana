import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import relawanRoutes from "./routes/relawan.routes";
import koordinatorRoutes from "./routes/koordinator.routes";

export const app = express();

app.set("trust proxy", 1); // penting untuk req.ip yang akurat di belakang reverse proxy

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true, // wajib true karena kita pakai httpOnly cookie
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.isProd ? "combined" : "dev"));

app.get("/api/health", (_req, res) => res.json({ success: true, message: "OK" }));

app.use("/api/auth", authRoutes);
app.use("/api/relawan", relawanRoutes);
app.use("/api/koordinator", koordinatorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
