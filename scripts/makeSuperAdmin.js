import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({
  path: path.resolve(__dirname, "../config/config.env"),
});

// Define the user schema
const userSchema = new mongoose.Schema({
  userName: String,
  email: String,
  role: String,
});

// Create the User model
const User = mongoose.model("User", userSchema);

// Email to update
const emailToUpdate = process.argv[2];

if (!emailToUpdate) {
  console.error("Please provide an email address as an argument");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    try {
      // Find the user by email and update their role
      const user = await User.findOneAndUpdate(
        { email: emailToUpdate },
        { role: "Super Admin" },
        { new: true }
      );
      
      if (!user) {
        console.error(`User with email ${emailToUpdate} not found`);
        process.exit(1);
      }
      
      console.log(`User ${user.userName} (${user.email}) has been updated to Super Admin`);
    } catch (error) {
      console.error("Error updating user:", error.message);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }); 