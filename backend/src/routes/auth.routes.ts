import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { loginLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;
