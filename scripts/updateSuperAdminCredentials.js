import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const updateSuperAdminCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    const superAdmin = await User.findOne({ role: "Super Admin" });
    if (!superAdmin) {
      console.log("No Super Admin found.");
      return;
    }

    console.log("Current Super Admin Details:");
    console.log("---------------------------");
    console.log("Email:", superAdmin.email);
    console.log("Username:", superAdmin.userName);
    console.log("Role:", superAdmin.role);

    // Hash the new password
    const hashedPassword = await bcrypt.hash("Essa@123", 10);

    // Update both email and password
    const updatedSuperAdmin = await User.findByIdAndUpdate(
      superAdmin._id,
      { 
        email: "essa.siddiqui@gmail.com",
        password: hashedPassword
      },
      { new: true }
    );

    console.log("\nSuper Admin credentials updated successfully!");
    console.log("New Email: essa.siddiqui@gmail.com");
    console.log("New Password: Essa@123");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

updateSuperAdminCredentials(); 