import { Router } from "express";
import { listKoordinator, addKoordinator, deleteKoordinator } from "../controllers/koordinator.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), listKoordinator);
router.post("/", authenticate, authorize("ADMIN"), addKoordinator);

router.delete(
  "/:kode",
  authenticate,
  authorize("ADMIN"),
  deleteKoordinator
);

export default router;
