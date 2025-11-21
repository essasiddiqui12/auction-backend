import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  let profileImageData = {
    public_id: "default_profile_id",
    secure_url: "https://via.placeholder.com/150"
  };

  if (req.files && Object.keys(req.files).length > 0) {
    const { profileImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
      return next(new ErrorHandler("File format not supported.", 400));
    }
  }

  const {
    userName,
    email,
    password,
    phone,
    address,
    role,
    bankAccountNumber,
    bankAccountName,
    bankName,
    googlepayNumber,
    paypalEmail,
  } = req.body;

  if (!userName || !email || !phone || !password || !address || !role) {
    return next(new ErrorHandler("Please fill full form.", 400));
  }
  
  // Validate phone number format (international format with country code)
  if (!phone.match(/^\+\d{1,4}\s\d{5,15}$/)) {
    return next(new ErrorHandler("Please provide a valid international phone number with country code.", 400));
  }
  
  if (role === "Auctioneer") {
    if (!bankAccountName || !bankAccountNumber || !bankName) {
      return next(
        new ErrorHandler("Please provide your full bank details.", 400)
      );
    }
    // Removed Google Pay validation - no longer required
    
    // Only validate Google Pay number if it's provided
    if (googlepayNumber && !googlepayNumber.match(/^\+\d{1,4}\s\d{5,15}$/)) {
      return next(new ErrorHandler("Please provide a valid international Google Pay number with country code.", 400));
    }
    
    if (!paypalEmail) {
      return next(new ErrorHandler("Please provide your paypal email.", 400));
    }
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered.", 400));
  }
  
  const user = await User.create({
    userName,
    email,
    password,
    phone,
    address,
    role,
    profileImage: {
      public_id: profileImageData.public_id,
      url: profileImageData.secure_url,
    },
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      googlepay: {
        googlepayNumber,
      },
      paypal: {
        paypalEmail,
      },
    },
  });
  generateToken(user, "User Registered.", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please fill full form."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }
  generateToken(user, "Login successfully.", 200, res);
});

export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout Successfully.",
    });
});

export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ moneySpent: { $gt: 0 } });
  const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);
  res.status(200).json({
    success: true,
    leaderboard,
  });
});

// Forgot Password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  console.log("Forgot password request for email:", email);

  if (!email) {
    return next(new ErrorHandler("Please provide your email address.", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("No user found with this email address.", 404));
  }

  console.log("User found:", user.userName);

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log("Reset token generated, attempting to send email...");

  try {
    // Send email
    await sendPasswordResetEmail(user.email, user.userName, resetToken);

    console.log("Password reset email sent successfully");

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Email sending failed:", error);

    // Clear reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(`Failed to send password reset email: ${error.message}`, 500));
  }
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }

  if (password.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters long.", 400));
  }

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: { $exists: true },
    passwordResetExpires: { $gt: Date.now() }
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user || !user.verifyPasswordResetToken(token)) {
    return next(new ErrorHandler("Invalid or expired password reset token.", 400));
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login with your new password.",
  });
});
