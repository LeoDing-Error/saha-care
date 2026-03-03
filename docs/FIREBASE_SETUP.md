# Firebase Project Setup Guide

This guide walks you through setting up a Firebase project for Saha-Care development.

## Prerequisites

- A Google account
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** (or **"Add project"**)
3. Enter project name: `saha-care` (or `saha-care-dev` for development)
4. **Disable Google Analytics** (optional for development, can enable later)
5. Click **"Create project"** and wait for provisioning

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Go to the **Sign-in method** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

## Step 3: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Choose a Cloud Firestore location:
   - **us-central1** (recommended for North America)
   - Or choose a region closer to your users
5. Click **"Enable"**

> **Note:** Test mode rules expire after 30 days. We'll deploy proper security rules before then.

## Step 4: Register Web App

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to **"Your apps"** section
3. Click the web icon (`</>`) to add a web app
4. Enter app nickname: `saha-care-web`
5. **Do NOT** check "Also set up Firebase Hosting" (we'll do this separately)
6. Click **"Register app"**
7. You'll see a `firebaseConfig` object - **copy these values**:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",       // VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...",        // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc..."           // VITE_FIREBASE_APP_ID
};
```

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in the values from Step 4:
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=saha-care-12345.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=saha-care-12345
   VITE_FIREBASE_STORAGE_BUCKET=saha-care-12345.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
   ```

3. **Important:** `.env.local` is gitignored and should never be committed!

## Step 6: Initialize Firebase CLI

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize the project (if not already done):
   ```bash
   firebase init
   ```
   
   Select:
   - **Firestore** (rules and indexes)
   - **Hosting** (for deployment)
   - **Emulators** (for local development)
   - **Functions** (for Cloud Functions)

3. When prompted, select your newly created project

## Step 7: Deploy Security Rules

The project includes Firestore security rules in `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

## Step 8: Deploy Firestore Indexes

Deploy composite indexes for efficient queries:

```bash
firebase deploy --only firestore:indexes
```

## Step 9: Start Development

### Option A: Use Firebase Emulators (Recommended for Development)

```bash
# Start emulators
firebase emulators:start

# In another terminal, start the dev server
npm run dev
```

The app will automatically connect to emulators when running on localhost.

### Option B: Use Live Firebase (for Integration Testing)

```bash
npm run dev
```

The app will connect to your live Firebase project.

## Troubleshooting

### "Firebase: No Firebase App has been created"
- Ensure `.env.local` exists and has valid values
- Restart the dev server after creating/modifying `.env.local`

### "Permission denied" errors
- Check that Firestore is in test mode, or
- Deploy security rules: `firebase deploy --only firestore:rules`

### "Invalid API key"
- Double-check the API key in `.env.local`
- Ensure there are no extra spaces or quotes around the values

### Emulator connection issues
- Ensure emulators are running: `firebase emulators:start`
- Check that ports 8080 (Firestore) and 9099 (Auth) are not in use

## Next Steps

After setup:

1. **Seed test data:** `npm run seed` (if available)
2. **Run tests:** `npm test`
3. **Deploy:** `firebase deploy`

## Security Checklist

Before going to production:

- [ ] Replace test mode rules with `firestore.rules`
- [ ] Enable App Check for additional security
- [ ] Set up Firebase Authentication email templates
- [ ] Configure authorized domains in Authentication settings
- [ ] Review and restrict API key permissions in Google Cloud Console
