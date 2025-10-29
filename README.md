# 🔐 NextAuth with **magic-links** Email flow + 🤖 AI Models Integration

A minimal **Next.js 14 (App Router)** project featuring:

- **NextAuth.js** for authentication (Google & GitHub OAuth + Manual Credentials Login / Register).
- **Verify-Email & Forgot-Password** with email's magic-links && SSE flow.
- **SSE events** implementation at `/api/events` page.
- **AI Model Integrations** with **Gemini**, **OpenRouter**, **Hugging Face**, **Groq Cloud**, **SambNova** (easily swappable).
- A simple **Chat UI** to test multiple AI models.

## Workflows

#### **1.** Manual SignUp flow with Email Verification (magic-link)

```
request sent to '/api/auth/register' API with payload as { name, email, password }
      ⬇
/register -> Creates a new user in DB & Sends an 'Email' to user with 'magic-link' for 'Email-Verification' & redirects to `/success` page
      ⬇
/success?email=<email> -> Opens an 'SSE EventStream' connection via the `client's email` with backend API to receive instant updates
      ⬇
When user Opens/Clicks 'magic-link' in Email -> Then it requests to '/api/auth/verify-email?token=<token>'
      ⬇
Then /verify-email -> Verify's the 'token' & Responds with the HTML page (like Success / Failure page) & If success, then it Broadcasts an SSE-event to all connected clients of that specific` user's email`
      ⬇
Now Email Verification is done, User can 'Login' Now...
```

#### **2.** Forgot Password with Magic-Link flow

```
request sent to '/api/auth/forgot-password' API with payload as { username / email }
      ⬇
/forgot-password -> Validates 'email' & Creates a 'crypto-token', stores in DB & Sends an 'Email' to user with 'magic-link'(contains 'token') for 'Password Reset'
      ⬇
When user Opens/Clicks 'magic-link' in Email -> Then it navigates to '/reset-password?token=<token>' -page
      ⬇
Then /reset-password -page -> Verify's the 'token' & Allows the user to update password (Only Once per Token)
      ⬇
Now the Password is Modified, User can 'Login' Now...
```

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone https://github.com/srinivas-batthula/next-auth
cd next-auth
npm install
npm run dev
```
