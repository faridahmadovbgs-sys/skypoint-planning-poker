# Firebase Setup Instructions for SkyPoint

To enable true multi-user functionality across devices, you'll need to configure Firebase:

## Quick Setup (5 minutes)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Create a project"
   - Name it "skypoint-planning-poker"

2. **Enable Realtime Database**
   - In your Firebase console, go to "Realtime Database"
   - Click "Create Database"
   - Choose "Start in test mode" for now

3. **Get Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click "Web" icon to add web app
   - Copy the firebaseConfig object

4. **Update Environment Variables**
   Create `.env.local` file with your config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

5. **Deploy**
   - Push to GitHub
   - Vercel will automatically detect env variables
   - Add them in Vercel dashboard if needed

## Security Rules (Production)

In Firebase Console > Realtime Database > Rules:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["joinedAt", "lastSeen"]
      }
    }
  }
}
```

## Current Status
- ✅ Firebase integration code ready
- ⚠️ Requires Firebase project setup
- 🔄 Falls back to demo mode without config

Once configured, users can join the same session from any device!