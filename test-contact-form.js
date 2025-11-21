import { config } from "dotenv";
import { sendContactFormEmail } from "./utils/emailService.js";

// Load environment variables
config();

// Test data
const testContactDetails = {
  name: "Test User",
  email: "essa.siddiquimahan@gmail.com",
  phone: "+1 1234567890",
  subject: "Test Contact Form",
  message: "This is a test message from the contact form.\nTesting multiple lines.\nRegards,\nTest User"
};

// Test function
async function testContactForm() {
  try {
    console.log('Testing contact form email sending...');
    
    // Verify environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Error: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
      process.exit(1);
    }
    
    // Send test email
    const result = await sendContactFormEmail(testContactDetails);
    console.log('Contact form email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending contact form email:', error);
    process.exit(1);
  }
}

// Run the test
testContactForm(); 