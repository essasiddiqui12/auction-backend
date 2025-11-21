import serverless from "serverless-http";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import app from "../app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({
  path: join(__dirname, "..", "config", "config.env"),
  override: true,
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = mongoose.connection.readyState === 1;
};

const handler = serverless(app);

export default async function vercelHandler(req, res) {
  if (!process.env.MONGO_URI) {
    return res.status(500).json({
      success: false,
      message: "MONGO_URI is not configured",
    });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to connect to MongoDB",
    });
  }

  return handler(req, res);
}

