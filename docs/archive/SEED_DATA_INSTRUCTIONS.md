# EOD Reports Seed Data Instructions

This document explains how to add sample EOD report data to your Firestore database.

## Overview

Two seed scripts have been created:
1. **seed-eod-reports-rest.js** - Uses Firebase REST API (requires Firestore rule changes)
2. **scripts/seedEODReports.js** - Uses Firebase Admin SDK (requires service account key)

## Sample Data Included

The seed data includes 5 realistic EOD (End of Day) reports with the following structure:

```javascript
{
  animalsFed: "24/24",           // Format: "X/Y" animals fed
  medsGiven: 8,                  // Number of medication doses administered
  volunteersCount: 5,            // Number of volunteers on shift
  status: "submitted",           // Report status
  notes: "...",                  // General notes and observations
  issues: [                      // Array of issues encountered
    {
      id: "1",
      animal: "Animal Name",
      issue: "Description of issue",
      priority: "high|med|low"
    }
  ],
  createdAt: Date               // Timestamp when report was created
}
```

## Option 1: Using REST API (Requires Firestore Rule Update)

### Prerequisites
- Node.js installed
- Access to Firebase Console for your project

### Steps

1. **Update Firestore Security Rules** (Temporarily for seeding):

   Go to Firebase Console > Firestore Database > Rules and add the following rule:

   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow unauthenticated reads and writes to eodReports collection
       // This is temporary for seeding - revert after seeding completes
       match /eodReports/{document=**} {
         allow read, write: if true;
       }

       // Your other rules here...
     }
   }
   ```

   Click "Publish" to apply the rules.

2. **Run the seed script**:

   ```bash
   node seed-eod-reports-rest.js
   ```

   You should see output like:
   ```
   Starting to seed EOD Reports using REST API...
   Created EOD Report: 24/24 animals fed on Sat Jun 27 2026
   Created EOD Report: 23/24 animals fed on Fri Jun 26 2026
   ...
   Finished seeding 5 EOD Reports!
   ```

3. **Revert Firestore Rules** to secure state:

   Go back to Firebase Console > Firestore Database > Rules and restore your secure rules (recommended for production):

   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Admin only access for eodReports
       match /eodReports/{document=**} {
         allow read, write: if request.auth.uid != null;
       }

       // Your other rules here...
     }
   }
   ```

   Click "Publish" to apply.

## Option 2: Using Firebase Admin SDK (Recommended)

### Prerequisites
- Node.js installed
- Firebase Admin SDK (`npm install firebase-admin`)
- Service account key from Firebase Console

### Steps

1. **Get your Service Account Key**:
   - Go to Firebase Console
   - Click the gear icon (Settings)
   - Select "Service Accounts"
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the project root (add to .gitignore)

2. **Update seedEODReports.js** to use Admin SDK:

   ```javascript
   import admin from 'firebase-admin'
   import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }

   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   })

   const db = admin.firestore()
   ```

3. **Run the seed script**:

   ```bash
   npm run seed:eod-reports
   ```

## Verifying the Data

After running the seed script:

1. Go to Firebase Console > Firestore Database
2. Look for the `eodReports` collection
3. You should see 5 new documents with timestamps from June 23-27, 2026
4. Each document contains the fields listed in the data structure above

## Sample Data Details

### Report 1 (June 27, 6:30 PM)
- **Status**: Successfully fed 24/24 animals
- **Medications**: 8 doses administered
- **Volunteers**: 5 on shift
- **Issues**: 2 minor/medium priority
  - Bernard (Ball Python): Reduced appetite
  - Corn Snake - Red: Shedding observed

### Report 2 (June 26, 7:00 PM)
- **Status**: Fed 23/24 animals (1 skipped due to stress)
- **Medications**: 10 doses administered
- **Volunteers**: 6 on shift
- **Issues**: 3 issues (1 high priority)
  - Green Iguana - Raja: Refusing food, lethargy (HIGH)
  - Bearded Dragon - Spike: Scale discoloration (MED)
  - Garter Snake - Ziggy: Water bowl maintenance (LOW)

### Report 3 (June 25, 5:45 PM)
- **Status**: Successfully fed 24/24 animals
- **Medications**: 7 doses administered
- **Volunteers**: 4 on shift
- **Issues**: None - Clean day

### Report 4 (June 24, 6:15 PM)
- **Status**: Fed 22/24 animals (2 skipped due to aggression)
- **Medications**: 9 doses administered
- **Volunteers**: 5 on shift
- **Issues**: 3 issues (2 high priority)
  - King Cobra - Kasha: Aggressive behavior (HIGH)
  - Reticulated Python - Rey: Striking behavior (HIGH)
  - Corn Snake - Orange: Normal shedding cycle (LOW)

### Report 5 (June 23, 6:00 PM)
- **Status**: Successfully fed 24/24 animals
- **Medications**: 6 doses administered
- **Volunteers**: 3 on shift
- **Issues**: 1 minor issue
  - Blue Tongue Skink - Bluey: Due for scale soak (LOW)

## Troubleshooting

### "Permission Denied" Error

If you get a permission denied error with the REST API:
- Make sure you've updated your Firestore rules to allow writes to eodReports
- Wait a few seconds after publishing rules for changes to propagate
- Clear browser cache and restart

### Missing Collection

After running the script:
- If the `eodReports` collection doesn't appear, the Firestore rules may not have been updated correctly
- Double-check that the rules were published successfully
- Firestore collections appear automatically when the first document is created

### Script Execution Issues

- Ensure Node.js version is 16+ for ES module support
- Check that you're running the command from the project root directory
- Verify no other Node processes are holding file locks

## Files Created

- `seed-eod-reports-rest.js` - REST API based seed script (uses unauthenticated writes)
- `scripts/seedEODReports.js` - Firebase SDK seed script (requires authentication)
- `package.json` - Updated with `seed:eod-reports` npm script

## Next Steps

After seeding the data:
1. Verify data appears in Firebase Console
2. Test the EOD Report page in the application
3. Confirm filters and sorting work correctly
4. Review and adjust sample data as needed for your use case

## Reverting Seed Data

To delete all seeded EOD reports:
1. Go to Firebase Console > Firestore Database
2. Select the `eodReports` collection
3. Select all 5 seed documents
4. Click Delete
5. Confirm deletion
