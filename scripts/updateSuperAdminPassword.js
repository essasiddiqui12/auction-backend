import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const updateSuperAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    const superAdmin = await User.findOne({ role: "Super Admin" });
    if (!superAdmin) {
      console.log("No Super Admin found.");
      return;
    }

    // Hash the new password with a specific number of rounds
    const hashedPassword = await bcrypt.hash("admin@123", 8);

    const updatedSuperAdmin = await User.findByIdAndUpdate(
      superAdmin._id,
      { password: hashedPassword },
      { new: true }
    );

    console.log("Super Admin password updated successfully!");
    console.log("New password: admin@123");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

updateSuperAdminPassword(); 