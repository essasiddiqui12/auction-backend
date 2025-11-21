import { config } from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables before anything else
try {
  // First try loading from root .env
  config();
  console.log('Loaded environment variables from root .env');
  
  // Then load from config/config.env (this will override any duplicates)
  config({
    path: join(__dirname, "config", "config.env")
  });
  console.log('Loaded environment variables from config/config.env');

  // Log environment variable status
  console.log('Environment variables loaded successfully');
  console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
  console.log('MONGO_URI value:', process.env.MONGO_URI ? 'Set' : 'Not set');
  console.log('PORT exists:', !!process.env.PORT);
  console.log('PORT value:', process.env.PORT);
  
  // Check ONLY Nodemailer configuration - NOT EmailJS
  console.log('');
  console.log('========== NODEMAILER CONFIGURATION CHECK ==========');
  console.log('EMAIL_SERVICE exists:', !!process.env.EMAIL_SERVICE);
  console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
  console.log('EMAIL_FROM exists:', !!process.env.EMAIL_FROM);
  console.log('====================================================');
  console.log('');

  // Validate required environment variables
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration is incomplete. Please check EMAIL_USER and EMAIL_PASSWORD');
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
  process.exit(1);
}

// Now we can safely import and use modules that depend on env variables
import app from "./app.js";
import cloudinary from "cloudinary";
import { connection } from "./database/connection.js";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
connection();

// Start the server
const port = process.env.PORT || 4004;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
