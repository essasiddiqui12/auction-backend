import { sendEmail, sendWinnerEmail, sendContactFormEmail } from "../utils/emailService.js";

// This is a placeholder for any test controller functions
// that might have previously used emailjsSend.js

export const testEmail = async (req, res) => {
  try {
    console.log('Test email controller called');
    res.status(200).json({
      success: true,
      message: "This is a placeholder controller that properly uses Nodemailer"
    });
  } catch (error) {
    console.error('Error in test controller:', error);
    res.status(500).json({
      success: false,
      message: "Error in test controller",
      error: error.message
    });
  }
}; 