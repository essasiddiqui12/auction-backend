import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    const email = "myhp.lap2023@gmail.com";
    const password = "123456";

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("\nLogin Test Results:");
    console.log("------------------");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("User found:", !!user);
    console.log("Password match:", isMatch);
    console.log("\nUser Details:");
    console.log("Role:", user.role);
    console.log("Username:", user.userName);
    console.log("Password Hash:", user.password);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

testLogin(); 