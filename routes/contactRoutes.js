import express from "express";
import { submitContactForm, getContactSubmissions } from "../controllers/contactController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/submit", submitContactForm);
router.get("/submissions", isAuthenticated, authorizeRoles("Super Admin", "Admin"), getContactSubmissions);

export default router; 