import { config } from "dotenv";
import { sendWinnerEmail } from "./utils/emailService.js";

// Load environment variables
config();

// Test data
const testWinnerDetails = {
  userName: "Test User",
  email: "essa.siddiquimahan@gmail.com" // Your actual email for testing
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

// Test function
async function testNodemailer() {
  try {
    console.log('Testing Nodemailer email sending...');
    
    // Verify environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Error: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
      process.exit(1);
    }
    
    // Send test email
    const result = await sendWinnerEmail(testWinnerDetails, testAuctionDetails, testPaymentDetails);
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  }
}

// Run the test
testNodemailer(); 