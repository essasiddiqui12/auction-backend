import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const fixSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    // Find the superadmin
    const superAdmin = await User.findOne({ role: "Super Admin" });
    if (!superAdmin) {
      console.log("No Super Admin found.");
      return;
    }

    // Simple credentials
    const newEmail = "admin@admin.com";
    const newPassword = "admin123";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update credentials
    const updatedAdmin = await User.findByIdAndUpdate(
      superAdmin._id,
      {
        email: newEmail,
        password: hashedPassword
      },
      { new: true }
    );

    console.log("\nCredentials updated successfully!");
    console.log("New Email:", newEmail);
    console.log("New Password:", newPassword);

    // Verify the update
    const verifyAdmin = await User.findOne({ email: newEmail });
    const passwordMatch = await bcrypt.compare(newPassword, verifyAdmin.password);

    console.log("\nVerification:");
    console.log("User found with new email:", !!verifyAdmin);
    console.log("Password verification:", passwordMatch);
    console.log("Role:", verifyAdmin.role);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

fixSuperAdmin(); 