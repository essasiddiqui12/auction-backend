// A completely clean server file with no EmailJS references
import express from 'express';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';

// Import routes
import userRouter from './router/userRoutes.js';
import auctionItemRouter from './router/auctionItemRoutes.js';
import bidRouter from './router/bidRoutes.js';
import commissionRouter from './router/commissionRouter.js';
import superAdminRouter from './router/superAdminRoutes.js';
import emailTestRouter from './routes/emailTestRoutes.js';
import contactRouter from './routes/contactRoutes.js';
import cronRouter from './routes/cronRoutes.js';

// Import cron jobs
import { endedAuctionCron } from './automation/endedAuctionCron.js';
import { verifyCommissionCron } from './automation/verifyCommissionCron.js';

// Import error middleware
import { errorMiddleware } from './middlewares/error.js';

// Path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();
config({
  path: join(__dirname, 'config', 'config.env'),
  override: true
});

// Create Express app
const app = express();

// Log environment variable status
console.log('=== Environment Variables ===');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT || '4004');

if (process.env.MONGO_URI) {
  try {
    const mongoUrl = new URL(process.env.MONGO_URI);
    console.log('MongoDB Host:', mongoUrl.hostname);
  } catch (error) {
    console.log('MongoDB URI parse error:', error.message);
  }
}

// Email configuration (Nodemailer only)
console.log('\n=== NODEMAILER Configuration ===');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Not set');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins in development or if ALLOW_ALL_ORIGINS is set
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow all origins in development or if ALLOW_ALL_ORIGINS is set
  if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_ALL_ORIGINS === 'true') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    // In production, only allow specific origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173'];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  next();
});

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/',
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/auctionitem', auctionItemRouter);
app.use('/api/v1/bid', bidRouter);
app.use('/api/v1/commission', commissionRouter);
app.use('/api/v1/superadmin', superAdminRouter);
app.use('/api/v1/test', emailTestRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/cron', cronRouter);

// Start cron jobs conditionally
if (process.env.RUN_CRONS === 'true') {
  endedAuctionCron();
  verifyCommissionCron();
  console.log('Cron jobs scheduled to run in-process.');
} else {
  console.log('RUN_CRONS is not set to true. Skipping local cron scheduling.');
}

// Error middleware
app.use(errorMiddleware);

// Start server
const port = process.env.PORT || 4004;
const host = process.env.HOST || '0.0.0.0'; // Allow external connections

app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
  console.log(`Local access: http://localhost:${port}`);
  console.log(`Network access: http://0.0.0.0:${port}`);
});