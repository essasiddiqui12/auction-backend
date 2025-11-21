import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { sendContactFormEmail } from "../utils/emailService.js";

export const submitContactForm = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    
    if (!name || !email || !subject || !message) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }
    
    // Validate phone number format if provided
    if (phone && !phone.match(/^\+\d{1,4}\s\d{5,15}$/)) {
      return next(new ErrorHandler("Please provide a valid international phone number with country code.", 400));
    }
    
    await sendContactFormEmail({
      name,
      email,
      subject,
      message,
      phone
    });
    
    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully"
    });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return next(new ErrorHandler("Failed to send message. Please try again later.", 500));
  }
}); 