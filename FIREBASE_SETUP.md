# Firebase Setup for SanctuaryBase v2

## Current Status
- **Demo Mode**: ✅ Working - Click "Try Demo" on login screen
- **Google Sign-In**: ❌ Requires Firebase project setup

## Getting Firebase Credentials

### Option 1: Use Existing Firebase Project
If you already have a Firebase project for Yuma Reptiles/SanctuaryBase, get your Web SDK config:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click Settings ⚙️ → Project Settings
4. Scroll to "Your apps" section
5. Click the Web app (or create one if needed)
6. Copy the config object

### Option 2: Create New Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create project"
3. Name it "SanctuaryBase" or "Yuma Reptiles"
4. Skip Google Analytics (optional)
5. After creation, create a Web app
6. Copy the config

## Update Credentials

Edit `src/services/firebase.js` and replace the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
}
```

## Enable Google Sign-In

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** → Enable it
3. Add your development domain (localhost) to authorized domains
4. For production, add `sanctuarybase-v2.pages.dev`

## Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **Test mode** (for development)
4. Choose region (us-east1 recommended)

## Create Collections (Optional - for later)

When you're ready to use the database:

1. In Firestore, create collections:
   - `animals`
   - `shifts`
   - `volunteers`
   - `users`
   - `donations`

## Test It

After updating credentials:
1. `npm run dev` - Start dev server
2. Navigate to login screen
3. Click "Sign in with Google"
4. Should now work without the popup disappearing

## Demo Mode

Demo mode works without Firebase:
- Click "Try Demo" on login screen
- Uses hardcoded demo account: admin@yumareptiles.com
- Full access to all features with mock data

## Troubleshooting

**Popup closes immediately?**
- Firebase config credentials are invalid
- Check that `authDomain` matches your Firebase project
- Make sure Google sign-in is enabled in Firebase

**CORS errors?**
- Add your domain to Firebase console → Authentication → Settings → Authorized domains

**Data not saving?**
- Make sure Firestore is enabled and has test permissions
- Check browser console for specific Firestore errors
