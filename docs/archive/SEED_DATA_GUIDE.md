# Seed Data Guide - Rounds History

This guide explains how to add seed data to the `roundsHistory` collection in Firestore.

## Quick Start

Run the seed script using npm:

```bash
npm run seed:rounds-history
```

This will add 5 realistic rounds history records to your Firestore database.

## Seed Data Overview

The script creates 5 sample rounds history records with the following characteristics:

### Record 1: Sarah Johnson - Morning Round (June 27, 2026)
- **Volunteer:** Sarah Johnson (volunteer_001)
- **Shift Type:** Morning (07:00 - 09:45)
- **Duration:** 2h 45m
- **Animals Checked:** 14
- **Issues:** None
- **Sections Completed:** 4 (North, Quarantine, Central, South Enclosures)
- **Status:** Successful, all systems operational

### Record 2: Michael Chen - Afternoon Round (June 26, 2026)
- **Volunteer:** Michael Chen (volunteer_002)
- **Shift Type:** Afternoon (14:00 - 16:30)
- **Duration:** 2h 30m
- **Animals Checked:** 14
- **Issues:** 1 (Ball python with reduced appetite)
- **Sections Completed:** 4
- **Status:** Completed with minor feeding issue noted for monitoring

### Record 3: Emma Rodriguez - Morning Round (June 25, 2026)
- **Volunteer:** Emma Rodriguez (volunteer_003)
- **Shift Type:** Morning (06:30 - 09:15)
- **Duration:** 2h 45m
- **Animals Checked:** 14
- **Issues:** None
- **Sections Completed:** 4
- **Status:** Excellent round, all animals healthy

### Record 4: Sarah Johnson - Evening Round (June 25, 2026)
- **Volunteer:** Sarah Johnson (volunteer_001)
- **Shift Type:** Evening (17:00 - 19:00)
- **Duration:** 2h
- **Animals Checked:** 14
- **Issues:** None
- **Sections Completed:** 4
- **Status:** All systems stable

### Record 5: David Thompson - Morning Round (June 24, 2026)
- **Volunteer:** David Thompson (volunteer_004)
- **Shift Type:** Morning (07:00 - 09:45)
- **Duration:** 2h 45m
- **Animals Checked:** 14
- **Issues:** 1 (Equipment - heating lamp malfunction)
- **Sections Completed:** 4
- **Status:** Equipment issue identified and resolved

## Data Schema

Each roundsHistory record contains:

```javascript
{
  volunteerId: string,
  volunteerName: string,
  shiftId: string,
  shiftType: 'morning' | 'afternoon' | 'evening',
  startTime: string (HH:MM format),
  endTime: string (HH:MM format),
  duration: string (e.g., "2h 45m"),
  date: string (YYYY-MM-DD format),
  sections: [
    {
      id: string,
      name: string,
      completedAt: string (HH:MM format),
      notes: string,
      animalsChecked: number,
      feedingCompleted: boolean
    }
  ],
  totalAnimalsChecked: number,
  issuesCount: number,
  issuesReported: [
    {
      animalId: string,
      type: string ('feeding_issue' | 'temperature_issue' | etc),
      description: string,
      severity: 'low' | 'moderate' | 'high',
      reportedAt: Date,
      resolution?: string
    }
  ],
  notes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Security Rules

To enable the seed script to work, ensure your Firestore security rules allow writes to the roundsHistory collection during development:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow writes for seeding/testing
    match /roundsHistory/{document=**} {
      allow write: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

For production, restrict these rules to authenticated users with appropriate roles:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roundsHistory/{document=**} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'staff']);
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'staff']);
    }
  }
}
```

## Manual Entry via Console

If you prefer to add records manually or the seed script encounters permission issues, you can:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Firestore Database > roundsHistory collection
3. Click "Add document"
4. Copy one of the sample records from the seed script and paste the data

## Querying the Seeded Data

After running the seed script, you can query the data:

```javascript
import { useRoundsHistoryStore } from '@/stores/roundsHistory'

const store = useRoundsHistoryStore()
await store.fetchRounds() // Fetches all rounds, ordered by createdAt descending

// Filter by volunteer
await store.fetchRounds({ volunteerId: 'volunteer_001' })

// Filter by shift
await store.fetchRounds({ shiftId: 'shift_morning_001' })
```

## Deleting Seed Data

To clean up the seeded data, you can:

1. Go to Firebase Console
2. Select records in the roundsHistory collection
3. Delete them individually or in batch

Or use this JavaScript snippet in the browser console:

```javascript
const { getDocs, deleteDoc, collection, doc } = await import('firebase/firestore')
const { db } = await import('@/services/firebase')
const snap = await getDocs(collection(db, 'roundsHistory'))
snap.docs.forEach(d => deleteDoc(doc(db, 'roundsHistory', d.id)))
```

## Troubleshooting

### Permission Denied Error

If you get a "PERMISSION_DENIED" error:

1. Ensure your Firestore security rules allow writes
2. Verify you're authenticated with a Firebase account that has permissions
3. Check that the roundsHistory collection exists in Firestore (it will be created automatically on first write)

### Script Not Found

If `npm run seed:rounds-history` doesn't work:

1. Verify you're in the project root directory
2. Run `npm install` to ensure dependencies are installed
3. Check that package.json has the "seed:rounds-history" script defined

## Related Documentation

- [RoundsHistoryPage Component](./src/components/features/admin/RoundsHistoryPage.vue)
- [Rounds History Store](./src/stores/roundsHistory.js)
- [Firebase Firestore Setup](./src/services/firebase.js)
