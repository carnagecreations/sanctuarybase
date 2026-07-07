# Seeding Applications Collection

This document explains how to add sample adoption applications data to Firestore.

## Sample Data Overview

The seed data includes 5 realistic adoption applications with varying statuses and characteristics:

1. **Sarah Mitchell** - Intermediate experience, apartment, pending approval
   - Applying for: Blaze the Bearded Dragon
   - Status: Pending
   - Type: Permanent adoption
   - Notes: Very enthusiastic family

2. **Marcus Johnson** - Advanced experience, professional breeder, approved
   - Applying for: Stripe the Ball Python
   - Status: Approved (2025-11-22)
   - Type: Permanent adoption
   - Notes: Excellent candidate with herpetology background

3. **Emily Rodriguez** - Beginner, first-time owner, pending
   - Applying for: Sunny the Leopard Gecko
   - Status: Pending
   - Type: Foster-to-adopt
   - Notes: Good fit for fostering program

4. **David and Lisa Chen** - Intermediate experience, house, under review
   - Applying for: King the Boa Constrictor
   - Status: Under Review
   - Type: Permanent adoption
   - Notes: Awaiting vet reference verification

5. **Rebecca Thompson** - No experience, rejected
   - Applying for: Scout the Corn Snake
   - Status: Rejected (2025-11-26)
   - Type: Permanent adoption
   - Notes: Inadequate setup, no follow-up

## How to Seed Data

### Option 1: Using the Application UI (Recommended)

1. **Log in to the admin panel**
   - Navigate to the admin login
   - Use your admin credentials (admin@yumareptiles.com)

2. **Open Browser Console**
   - Press F12 or Ctrl+Shift+I to open Developer Tools
   - Go to the Console tab

3. **Run the Seed Function**
   ```javascript
   import { seedApplicationsCollection } from '/src/utils/seedData.js'
   seedApplicationsCollection()
   ```

4. **Alternative - Check Firestore Directly**
   - Open Firebase Console
   - Navigate to Firestore Database
   - Go to the "applications" collection
   - You should see the 5 new documents

### Option 2: Using Node Script (Requires Auth)

If you have service account credentials:

```bash
npm run seed:applications
```

This requires your Firebase credentials to be properly configured in `src/services/firebase.js`.

### Option 3: Manual Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (sanctuarybasev2)
3. Navigate to Firestore Database
4. Create or open the "applications" collection
5. Add documents manually with the data from `src/utils/seedData.js`

## Application Schema

Each application document contains:

```javascript
{
  applicantName: string,           // Full name of applicant
  applicantEmail: string,          // Contact email
  applicantPhone: string,          // Contact phone number
  animalName: string,              // Name of animal being adopted
  animalSpecies: string,           // Species of animal
  applicationDate: Date,           // When application was submitted
  status: string,                  // 'pending', 'approved', 'rejected', 'under-review'
  adoptionType: string,            // 'permanent' or 'foster'
  experience: string,              // 'beginner', 'intermediate', 'advanced'
  experienceDetails: string,       // Detailed experience description
  homeSetup: string,               // 'apartment', 'house', 'other'
  homeSetupDetails: string,        // Description of home setup
  otherPets: [string],             // List of other animals in home
  familyMembers: number,           // Number of household members
  childrenAges: [number],          // Ages of children in household
  motivationForAdoption: string,   // Why they want to adopt
  vetReferences: string,           // Vet contact and details
  financialCapability: boolean,    // Can afford proper care
  agreeToFollowUp: boolean,        // Willing to stay in contact
  notes: string,                   // Internal notes
  createdAt: Date,                 // Timestamp (auto-added)
  
  // Optional fields for approved/rejected applications
  approvalDate?: Date,             // When approved
  approvedBy?: string,             // Admin email who approved
  rejectionReason?: string,        // Why rejected
  rejectionDate?: Date,            // When rejected
  rejectedBy?: string,             // Admin email who rejected
  
  // Optional fields for under-review
  reviewNotes?: string,            // Review status notes
  reviewStartDate?: Date,          // When review started
}
```

## Firestore Rules

Make sure your Firestore security rules allow authenticated admins to write to the applications collection. Example rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /applications/{document=**} {
      allow read, write: if request.auth.uid != null && 
                           request.auth.token.admin == true;
      allow read: if request.auth.uid != null;
    }
  }
}
```

## Accessing Sample Data Programmatically

The seed data is exported for use in your application:

```javascript
import { getSampleApplicationsData, seedApplicationsCollection } from '@/utils/seedData'

// Get sample data without writing to database
const samples = getSampleApplicationsData()

// Or seed the database (requires authentication)
await seedApplicationsCollection()
```

## Clearing Test Data

To remove all applications from Firestore:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Select the "applications" collection
4. Delete documents individually or the entire collection

## Troubleshooting

### "Permission Denied" Error

- Make sure you're logged in as an admin user
- Check Firestore security rules allow your user to write
- Verify your Firebase config is correct in `src/services/firebase.js`

### Data Not Appearing

- Refresh the page after seeding
- Check browser console for error messages
- Verify collection name is "applications" (lowercase)
- Make sure Firestore database is enabled in Firebase

### Script Not Found

- Ensure `src/utils/seedData.js` exists
- Check that the path is correct in imports
- Verify `src/services/firebase.js` has valid credentials

## Next Steps

After seeding data:

1. Verify data appears in Applications page
2. Test filtering by status (pending, approved, rejected, under-review)
3. Test approval/rejection workflows
4. Verify email notifications are sent (if configured)
5. Test foster-to-adoption transitions

## Related Files

- `/src/utils/seedData.js` - Seed data and functions
- `/src/stores/applications.js` - Applications store
- `/src/components/features/admin/ApplicationsPage.vue` - Admin applications UI
- `/src/services/firebase.js` - Firebase configuration
- `FIREBASE_SETUP.md` - Firebase setup instructions
