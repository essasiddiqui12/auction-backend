import express from "express";
import { testWinnerEmail, testGeneralEmail, testContactForm } from "../controllers/emailTestController.js";

const router = express.Router();

router.post("/test-winner-email", testWinnerEmail);
router.post("/test-general-email", testGeneralEmail);
router.post("/test-contact-form", testContactForm);

export default router; 