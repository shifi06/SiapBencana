import { Router } from "express";
import {
  getAllRelawan,
  getStats,
  registerRelawan,
  updateMyProfile,
  approveRelawan,
  deleteRelawan,
  flagRelawan,
  resetFlag,
} from "../controllers/relawan.controller";
import { authenticate, authorize } from "../middleware/auth";
import { registerLimiter, generalLimiter } from "../middleware/rateLimit";

const router = Router();

// ── Publik ────────────────────────────────────────────────────────
router.get("/", generalLimiter, getAllRelawan);
router.get("/stats", generalLimiter, getStats);
router.post("/", registerLimiter, registerRelawan);
router.post("/:kode/flag", generalLimiter, flagRelawan);

// ── Relawan (login sebagai diri sendiri) ────────────────────────────
router.patch("/me", authenticate, authorize("RELAWAN"), updateMyProfile);

// ── Admin only ───────────────────────────────────────────────────
router.patch("/:kode/approve", authenticate, authorize("ADMIN"), approveRelawan);
router.delete("/:kode", authenticate, authorize("ADMIN"), deleteRelawan);
router.post("/:kode/reset-flag", authenticate, authorize("ADMIN"), resetFlag);

export default router;
