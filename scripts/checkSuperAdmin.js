import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

const checkSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    const superAdmin = await User.findOne({ role: "Super Admin" });
    if (!superAdmin) {
      console.log("No Super Admin found.");
      return;
    }

    console.log("Super Admin Details:");
    console.log("-------------------");
    console.log("ID:", superAdmin._id);
    console.log("Email:", superAdmin.email);
    console.log("Username:", superAdmin.userName);
    console.log("Role:", superAdmin.role);
    console.log("Account Created:", superAdmin.createdAt);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

checkSuperAdmin(); 