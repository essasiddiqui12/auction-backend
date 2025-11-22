import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { sendContactFormEmail } from "../utils/emailService.js";
import { ContactForm } from "../models/contactFormSchema.js";

export const submitContactForm = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    
    console.log('Contact form submission received:', { name, email, subject, phone: phone ? 'provided' : 'not provided' });
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorHandler("Please provide a valid email address", 400));
    }
    
    // Phone is optional - accept any format since it's not required
    let formattedPhone = null;
    if (phone && typeof phone === 'string' && phone.trim()) {
      formattedPhone = phone.trim();
      // Just log the phone, don't validate since it's optional
      console.log('Phone provided:', formattedPhone);
    }
    
    // Store contact form submission in database first
    const contactSubmission = await ContactForm.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      phone: formattedPhone || null,
      emailSent: false
    });
    
    console.log('✅ Contact form submission saved to database:', contactSubmission._id);
    console.log('Contact form details:', {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      phone: formattedPhone || 'not provided',
      messageLength: message.trim().length
    });
    
    // Try to send email in background (non-blocking)
    // Note: Render free tier blocks SMTP, so this will likely fail
    // But submissions are saved in database and can be retrieved
    sendContactFormEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      phone: formattedPhone
    }).then(async (info) => {
      console.log('✅ Contact form email sent successfully!');
      console.log('Email Message ID:', info.messageId);
      // Update database record
      await ContactForm.findByIdAndUpdate(contactSubmission._id, {
        emailSent: true,
        emailSentAt: new Date()
      });
    }).catch(async (emailError) => {
      console.error('❌ Email sending failed (non-blocking):');
      console.error('Error message:', emailError.message);
      console.error('Error code:', emailError.code);
      // Update database record with error
      await ContactForm.findByIdAndUpdate(contactSubmission._id, {
        emailError: emailError.message || 'Email sending failed'
      });
      console.log('⚠️ Note: Contact form submission is saved in database and can be retrieved');
    });
    
    // Return success immediately (submission is saved in database)
    res.status(200).json({
      success: true,
      message: "Your message has been received and saved successfully"
    });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return next(new ErrorHandler(error.message || "Failed to send message. Please try again later.", 500));
  }
}); 