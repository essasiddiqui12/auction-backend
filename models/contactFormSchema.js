import mongoose from "mongoose";

const contactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  emailError: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

export const ContactForm = mongoose.model("ContactForm", contactFormSchema);

