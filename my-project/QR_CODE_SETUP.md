# QR Code URL Setup

## Overview

The QR code generation system has been updated to use the frontend URL from environment variables and include the token ID in the URL path.

## How it works

1. **Initial QR Code Generation**: When generating identifiers, a temporary QR code URL is created with `/battery-passport/pending`
2. **Passport Creation**: After the passport is created on the blockchain and we get the token ID, the QR code URL is updated to include the actual token ID
3. **Final URL Format**: `{FRONTEND_URL}/battery-passport/{TOKEN_ID}`

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
# Frontend URL for QR code generation
VITE_FRONTEND_URL=https://your-frontend-domain.com
```

If `VITE_FRONTEND_URL` is not set, the system will fall back to `window.location.origin` (the current domain).

## URL Flow

1. **During Creation**: `/battery-passport/pending` - Shows a "processing" message
2. **After Creation**: `/battery-passport/{tokenId}` - Shows the actual battery passport

## Example URLs

- Development: `http://localhost:5173/battery-passport/123`
- Production: `https://battery-passport.com/battery-passport/123`

## Implementation Details

- The QR code URL is stored in the backend database with the correct token ID
- The smart contract stores the initial temporary URL
- Users scanning the QR code will be directed to the correct battery passport page 