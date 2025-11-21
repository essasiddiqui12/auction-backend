import express from "express";
import {
  fetchLeaderboard,
  getProfile,
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isAuthenticated, getProfile);
router.get("/logout", isAuthenticated, logout);
router.get("/leaderboard", fetchLeaderboard);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
