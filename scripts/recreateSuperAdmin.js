import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const recreateSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    // 1. Delete current Super Admin
    console.log("\nStep 1: Deleting current Super Admin");
    const deleteResult = await User.deleteOne({ role: "Super Admin" });
    console.log("Deleted count:", deleteResult.deletedCount);

    // 2. Create new Super Admin
    console.log("\nStep 2: Creating new Super Admin");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const newSuperAdmin = await User.create({
      userName: "Essa Siddiqui",
      email: "myhp.lap2023@gmail.com",
      password: hashedPassword,
      role: "Super Admin",
      phone: "1234567890",
      address: "Admin Address",
      profileImage: {
        public_id: "default_profile_id",
        url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
      }
    });

    console.log("\nNew Super Admin created successfully!");
    console.log("Email:", newSuperAdmin.email);
    console.log("Password: admin123");
    console.log("Role:", newSuperAdmin.role);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

recreateSuperAdmin(); 