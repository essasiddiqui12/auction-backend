import { sendEmail, sendWinnerEmail, sendContactFormEmail } from "../utils/emailService.js";

export const testWinnerEmail = async (req, res) => {
  try {
    console.log('Testing winner email with Nodemailer');
    
    const testWinnerDetails = {
      userName: "Test User",
      email: req.body.email || "essa.siddiquimahan@gmail.com"
    };

    const testAuctionDetails = {
      title: "Test Auction Item",
      currentBid: 1000,
      endTime: new Date()
    };

    const testPaymentDetails = {
      bankTransfer: {
        bankName: "Test Bank",
        bankAccountNumber: "1234567890",
        bankAccountName: "Test Account"
      },
      googlepay: {
        googlepayNumber: "9876543210"
      },
      paypal: {
        paypalEmail: "test@paypal.com"
      }
    };
    
    const response = await sendWinnerEmail(testWinnerDetails, testAuctionDetails, testPaymentDetails);
    
    return res.status(200).json({
      success: true,
      message: "Test winner email sent successfully using Nodemailer",
      response
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
};

export const testGeneralEmail = async (req, res) => {
  try {
    console.log('Testing general email with Nodemailer');
    
    const response = await sendEmail({
      email: req.body.email || "essa.siddiquimahan@gmail.com",
      subject: "Test Email from Auction Platform via Nodemailer",
      message: "This is a test email to verify that the Nodemailer configuration is working correctly.",
      html: "<b>This is a test email to verify that the Nodemailer configuration is working correctly.</b>"
    });
    
    return res.status(200).json({
      success: true,
      message: "Test general email sent successfully using Nodemailer",
      response
    });
  } catch (error) {
    console.error("Error sending test general email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test general email",
      error: error.message
    });
  }
};

export const testContactForm = async (req, res) => {
  try {
    console.log('Testing contact form with Nodemailer');
    
    const { name, email, subject, message, phone } = req.body;
    
    const response = await sendContactFormEmail({
      name: name || "Test User",
      email: email || "test@example.com",
      subject: subject || "Test Contact Form Submission",
      message: message || "This is a test message from the contact form.",
      phone: phone || "1234567890"
    });
    
    return res.status(200).json({
      success: true,
      message: "Test contact form email sent successfully using Nodemailer",
      response
    });
  } catch (error) {
    console.error("Error in test contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test contact form",
      error: error.message
    });
  }
}; 