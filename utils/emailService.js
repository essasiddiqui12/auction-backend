import nodemailer from 'nodemailer';

// Create reusable transporter object using nodemailer service
const createTransporter = () => {
  console.log("Creating transporter with config:", {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    passwordSet: !!process.env.EMAIL_PASSWORD
  });

  // Use nodemailer service-based approach (simpler and recommended)
  // Increased timeouts significantly for Render free tier (instances may take 50+ seconds to spin up)
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // nodemailer handles Gmail SMTP automatically
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use app-specific password for Gmail
    },
    // Increased timeouts to account for Render free tier spin-up delays (50+ seconds)
    connectionTimeout: 60000, // 60 seconds - accounts for instance wake-up time
    greetingTimeout: 60000, // 60 seconds
    socketTimeout: 60000, // 60 seconds
    // Additional settings for better reliability
    pool: true, // Use connection pooling
    maxConnections: 1, // Limit connections
    maxMessages: 3 // Limit messages per connection
  });
};

// Function to send general emails
export const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      text: message,
      html: html || `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>${subject}</h2>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Zeeshu Auction Team</p>
      </div>`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to send winner notification emails
export const sendWinnerEmail = async (winnerDetails, auctionDetails, paymentDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: winnerDetails.email,
      subject: 'Congratulations! You Won the Auction',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">🎉 Auction Won! 🎉</h1>
          
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #2c3e50;">Congratulations ${winnerDetails.userName}!</h2>
            <p>You have successfully won the auction for: <strong>${auctionDetails.title}</strong></p>
            <p>Winning Bid: <strong>${auctionDetails.currentBid}</strong></p>
            <p>Auction End Date: ${new Date(auctionDetails.endTime).toLocaleDateString()}</p>
          </div>

          <div style="background-color: #e9ecef; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #2c3e50;">Payment Information</h3>
            
            <h4 style="color: #2c3e50;">Bank Transfer</h4>
            <ul style="list-style: none; padding-left: 0;">
              <li>Bank Name: ${paymentDetails.bankTransfer.bankName}</li>
              <li>Account Name: ${paymentDetails.bankTransfer.bankAccountName}</li>
              <li>Account Number: ${paymentDetails.bankTransfer.bankAccountNumber}</li>
            </ul>

            <h4 style="color: #2c3e50;">Google Pay</h4>
            <p>Number: ${paymentDetails.googlepay.googlepayNumber}</p>

            <h4 style="color: #2c3e50;">PayPal</h4>
            <p>Email: ${paymentDetails.paypal.paypalEmail}</p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #6c757d;">
            <p>Please complete the payment using any of the methods above.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Winner notification sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending winner notification:', error);
    throw error;
  }
};

// Function to send welcome emails
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Welcome to Auction Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">Welcome to Auction Platform!</h1>
          
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #2c3e50;">Hello ${userName}!</h2>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            
            <h3 style="color: #2c3e50; margin-top: 20px;">You can now start:</h3>
            <ul>
              <li>Browsing available auctions</li>
              <li>Placing bids on items</li>
              <li>Creating your own auctions</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #6c757d;">
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, response: info };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Function to send password reset emails
export const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    console.log("Creating email transporter...");
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log("Reset URL:", resetUrl);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Password Reset Request - PrimeBid Auction',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10.2V11.2H16.2V16H7.8V11.2H9.2V10.2C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.4 8.7 10.4 10.2V11.2H13.6V10.2C13.6 8.7 12.8 8.2 12 8.2Z"/>
                </svg>
              </div>
              <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
            </div>

            <!-- Content -->
            <div style="margin-bottom: 30px;">
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hello <strong>${userName}</strong>,
              </p>

              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your PrimeBid account. If you made this request, click the button below to reset your password:
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                  Reset My Password
                </a>
              </div>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #3b82f6; font-size: 14px; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 6px;">
                ${resetUrl}
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 6px;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                ⚠️ Security Notice: This link will expire in 10 minutes for your security.
              </p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>PrimeBid Auction Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Function to send auction end emails
export const sendAuctionEndEmail = async (userEmail, userName, auctionTitle) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Your Auction Has Ended',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">Auction Ended</h1>
          
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #2c3e50;">Hello ${userName},</h2>
            <p>Your auction for <strong>${auctionTitle}</strong> has ended.</p>
            <p>You can check the results in your dashboard.</p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #6c757d;">
            <p>Thank you for using our platform!</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Auction end email sent successfully:', info.messageId);
    return { success: true, response: info };
  } catch (error) {
    console.error('Error sending auction end email:', error);
    throw error;
  }
};

// Function to send contact form emails
export const sendContactFormEmail = async (contactDetails) => {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      const error = new Error('Email service is not configured. EMAIL_USER and EMAIL_PASSWORD must be set.');
      console.error('Email configuration error:', error.message);
      throw error;
    }

    console.log('📧 Creating email transporter...');
    console.log('Email will be sent to:', process.env.EMAIL_USER);
    const transporter = createTransporter();
    
    // Skip verify() to avoid extra connection attempt that times out
    // The connection will be established when sendMail() is called
    console.log('⏭️ Skipping connection verification (will connect on send)');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin email
      replyTo: contactDetails.email, // Allow replying to the sender
      subject: `Contact Form: ${contactDetails.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">New Contact Form Submission</h1>
          
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #2c3e50;">Contact Details</h2>
            <ul style="list-style: none; padding-left: 0;">
              <li><strong>Name:</strong> ${contactDetails.name}</li>
              <li><strong>Email:</strong> ${contactDetails.email}</li>
              <li><strong>Phone:</strong> ${contactDetails.phone || 'Not provided'}</li>
              <li><strong>Subject:</strong> ${contactDetails.subject}</li>
            </ul>
          </div>

          <div style="background-color: #e9ecef; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #2c3e50;">Message</h2>
            <p style="white-space: pre-wrap;">${contactDetails.message}</p>
          </div>
        </div>
      `
    };
    
    console.log('📤 Sending email...');
    console.log('⏱️ Connection timeouts set to 60 seconds for Render free tier spin-up delays');
    
    // Direct sendMail call - connection timeouts are handled by transporter config
    // No need for additional timeout wrapper since connectionTimeout is already 60s
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending contact form email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Error response:', error.response);
    console.error('Full error:', error);
    throw error;
  }
}; 