import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const testLoginProcess = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    // 1. First verify the user exists
    const email = "admin@admin.com";
    const password = "admin123";
    
    console.log("\nStep 1: Finding user");
    console.log("-------------------");
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      console.log("User not found with email:", email);
      return;
    }

    console.log("User found:");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Password Hash:", user.password);

    // 2. Test password comparison
    console.log("\nStep 2: Testing password");
    console.log("----------------------");
    console.log("Input password:", password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    // 3. Update password again to ensure it's correct
    console.log("\nStep 3: Updating password again");
    console.log("----------------------------");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    console.log("Password updated successfully");
    console.log("\nNew login credentials:");
    console.log("Email:", email);
    console.log("Password:", password);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

testLoginProcess(); 