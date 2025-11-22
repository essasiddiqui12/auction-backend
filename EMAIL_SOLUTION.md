# Email Service Solution for Render Free Tier

## Problem Identified

**Root Cause:** Render free tier **BLOCKS outbound SMTP connections** on ports 465 and 587. This is why you're getting `ETIMEDOUT` errors when trying to connect to Gmail's SMTP server.

## Current Solution (Implemented)

✅ **Contact form submissions are now stored in the database**
- All submissions are saved even if email fails
- You can retrieve them via API: `GET /api/v1/contact/submissions` (requires admin auth)
- Submissions include: name, email, phone, subject, message, timestamps

## Solutions to Enable Email Sending

### Option 1: Upgrade Render Plan (Recommended)
- Upgrade to Render's paid plan ($7/month)
- Paid plans allow outbound SMTP connections
- Your current nodemailer + Gmail setup will work immediately

### Option 2: Use HTTP-Based Email Service (Free Tier Available)
Use services that provide HTTP APIs instead of SMTP:

#### A. Resend (Recommended - Free Tier: 3,000 emails/month)
```bash
npm install resend
```

Update `utils/emailService.js` to use Resend:
```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactFormEmail = async (contactDetails) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER,
    replyTo: contactDetails.email,
    subject: `Contact Form: ${contactDetails.subject}`,
    html: `...`
  });
  
  if (error) throw error;
  return data;
};
```

#### B. SendGrid (Free Tier: 100 emails/day)
Similar HTTP API approach

#### C. Mailgun (Free Tier: 5,000 emails/month)
Similar HTTP API approach

### Option 3: Use Gmail API (More Complex)
Requires OAuth2 setup, more complex than SMTP

## Current Status

✅ Contact form works and saves to database
❌ Email sending fails due to Render SMTP blocking
✅ All submissions are retrievable via API

## To View Contact Submissions

1. Login as Super Admin
2. Call: `GET /api/v1/contact/submissions`
3. All submissions will be returned with full details

## Next Steps

1. **Immediate:** Contact form works, submissions saved in database
2. **Short-term:** Choose an HTTP-based email service (Resend recommended)
3. **Long-term:** Consider upgrading Render plan for full SMTP support

