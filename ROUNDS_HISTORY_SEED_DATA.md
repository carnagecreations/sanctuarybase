# Rounds History Seed Data

## Summary

Added comprehensive seed data to the `roundsHistory` Firestore collection. The seed script creates 5 realistic rounds history records representing different volunteers, shift types, and scenarios.

## Quick Start

```bash
npm run seed:rounds-history
```

This single command will add 5 sample rounds history documents to Firestore.

## What Gets Seeded

### 5 Complete Rounds History Records

1. **Sarah Johnson - Morning Round (June 27)**
   - Time: 07:00 - 09:45 (2h 45m)
   - Animals: 14 checked
   - Issues: None
   - Status: All systems operational

2. **Michael Chen - Afternoon Round (June 26)**
   - Time: 14:00 - 16:30 (2h 30m)
   - Animals: 14 checked
   - Issues: 1 (Ball python reduced appetite)
   - Severity: Moderate

3. **Emma Rodriguez - Morning Round (June 25)**
   - Time: 06:30 - 09:15 (2h 45m)
   - Animals: 14 checked
   - Issues: None
   - Status: Excellent round

4. **Sarah Johnson - Evening Round (June 25)**
   - Time: 17:00 - 19:00 (2h)
   - Animals: 14 checked
   - Issues: None
   - Status: All systems stable

5. **David Thompson - Morning Round (June 24)**
   - Time: 07:00 - 09:45 (2h 45m)
   - Animals: 14 checked
   - Issues: 1 (Heating lamp malfunction)
   - Severity: High (but resolved)

## Files Added

### 1. Seed Script
- **Location:** `scripts/seedRoundsHistory.js`
- **Size:** ~8.5 KB
- **Purpose:** Adds 5 realistic rounds history records to Firestore

### 2. NPM Command
- **File:** `package.json` (modified)
- **Command:** `npm run seed:rounds-history`

### 3. Documentation
- `docs/archive/SEED_DATA_GUIDE.md` - Complete usage and Firestore rules
- `docs/archive/SEED_DATA_SUMMARY.md` - Detailed data overview
- `ROUNDS_HISTORY_SEED_DATA.md` - This file

## Running the Seed Script

```bash
npm run seed:rounds-history
```

Expected output:
```
Starting to seed roundsHistory collection...
Added round history record 1/5 - Sarah Johnson (2026-06-27)
Added round history record 2/5 - Michael Chen (2026-06-26)
Added round history record 3/5 - Emma Rodriguez (2026-06-25)
Added round history record 4/5 - Sarah Johnson (2026-06-25)
Added round history record 5/5 - David Thompson (2026-06-24)

Successfully seeded 5 rounds history records!
```

## Data Structure

Each record includes:

- volunteerId, volunteerName
- shiftId, shiftType (morning/afternoon/evening)
- startTime, endTime, duration, date
- sections (4 facility areas per round)
- totalAnimalsChecked (14 per record)
- issuesCount and issuesReported
- notes for context
- createdAt and updatedAt timestamps

## Using the Data

### In Components
```javascript
import { useRoundsHistoryStore } from '@/stores/roundsHistory'

const store = useRoundsHistoryStore()
await store.fetchRounds() // Fetch all rounds

// Filter by volunteer
await store.fetchRounds({ volunteerId: 'volunteer_001' })

// Filter by shift
await store.fetchRounds({ shiftId: 'shift_morning_001' })
```

### View in UI
Navigate to Admin > Rounds History page to see all seeded data.

## Firestore Rules Required

For the script to work, update your Firestore security rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roundsHistory/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Permission Denied Error
- Check Firestore security rules allow writes
- Verify authentication is set up
- Ensure roundsHistory collection can be created

### Script Not Found
- Run `npm install` first
- Verify you're in the project root directory
- Check package.json has the script defined

## Deleting Seed Data

To remove seeded records:

1. Go to Firebase Console > Firestore
2. Select roundsHistory collection
3. Delete documents individually or in batch

Or use JavaScript:
```javascript
const { getDocs, deleteDoc, collection, doc } = await import('firebase/firestore')
const { db } = await import('@/services/firebase')
const snap = await getDocs(collection(db, 'roundsHistory'))
snap.docs.forEach(d => deleteDoc(doc(db, 'roundsHistory', d.id)))
```

## Related Documentation

- Seed Script: `scripts/seedRoundsHistory.js`
- Store: `src/stores/roundsHistory.js`
- Component: `src/components/features/admin/RoundsHistoryPage.vue`
- Firebase Config: `src/services/firebase.js`
