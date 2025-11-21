import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

const updateSuperAdminEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database.");

    const superAdmin = await User.findOne({ role: "Super Admin" });
    if (!superAdmin) {
      console.log("No Super Admin found.");
      return;
    }

    const updatedSuperAdmin = await User.findByIdAndUpdate(
      superAdmin._id,
      { email: "myhp.lap2023@gmail.com" },
      { new: true }
    );

    console.log("Super Admin email updated successfully:", updatedSuperAdmin.email);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

updateSuperAdminEmail(); 