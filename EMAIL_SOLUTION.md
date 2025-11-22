# Email Service Solution for Render Free Tier

## Problem Identified

**Root Cause:** Render free tier **BLOCKS outbound SMTP connections** on ports 465 and 587. This is why you're getting `ETIMEDOUT` errors when trying to connect to Gmail's SMTP server.

## Current Solution (Implemented)

✅ **Contact form submissions are now stored in the database**
- All submissions are saved even if email fails
- You can retrieve them via API: `GET /api/v1/contact/submissions` (requires admin auth)
- Submissions include: name, email, phone, subject, message, timestamps

## Solutions to Enable Email Sending

### ✅ Option 1: Use Resend HTTP API (IMPLEMENTED - Recommended for Free Tier)

**Already implemented in the code!** Just need to configure:

1. **Sign up for Resend** (free): https://resend.com
   - Free tier: 3,000 emails/month
   - No credit card required

2. **Get your API key:**
   - Go to Resend Dashboard → API Keys
   - Create a new API key
   - Copy the key

3. **Add to Render Environment Variables:**
   - Go to Render Dashboard → Your backend service → Environment
   - Add these variables:
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxxx (your API key)
     RESEND_FROM=onboarding@resend.dev (or your verified domain email)
     EMAIL_USER=essa.siddiquimahan@gmail.com (where to send contact forms)
     ```
   - Or use `EMAIL_FROM` if you already have it set

4. **Redeploy** - Emails will now work via HTTP API (no SMTP needed!)

**The code automatically uses Resend if `RESEND_API_KEY` is set, otherwise falls back to SMTP.**

### Option 2: Upgrade Render Plan
- Upgrade to Render's paid plan ($7/month)
- Paid plans allow outbound SMTP connections
- Your current nodemailer + Gmail setup will work immediately

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

