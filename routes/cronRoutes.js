import express from "express";
import {
  runEndedAuctions,
  runCommissionVerification,
} from "../controllers/cronController.js";
import { verifyCronKey } from "../middlewares/cronAuth.js";

const router = express.Router();

router.post("/ended-auctions", verifyCronKey, runEndedAuctions);
router.get("/ended-auctions", verifyCronKey, runEndedAuctions);
router.post("/verify-commissions", verifyCronKey, runCommissionVerification);
router.get("/verify-commissions", verifyCronKey, runCommissionVerification);

export default router;

