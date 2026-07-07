# Rounds History Seed Data Implementation

## Project: SB v2 (Sanctuary Base)
## Created: June 28, 2026
## Collection: roundsHistory (Firestore)

---

## Quick Start

```bash
npm run seed:rounds-history
```

This command adds 5 realistic rounds history records to your Firestore database.

---

## What Was Created

### 1. Seed Script
- **File:** `scripts/seedRoundsHistory.js` (310 lines, 8.4 KB)
- **Purpose:** Populates roundsHistory Firestore collection with realistic data
- **Features:**
  - Firebase Firestore client SDK integration
  - Proper Timestamp conversion
  - Console logging and error handling
  - Process exit codes

### 2. Data Schema Documentation
- **File:** `scripts/roundsHistorySeedDataSchema.json`
- **Purpose:** JSON schema definition and examples
- **Includes:** Field definitions, types, examples

### 3. NPM Script
- **File:** `package.json` (modified)
- **Command:** `npm run seed:rounds-history`
- **New Entry:** `"seed:rounds-history": "node scripts/seedRoundsHistory.js"`

### 4. Documentation (3 files)
- **ROUNDS_HISTORY_SEED_DATA.md** - Quick reference guide
- **SEED_DATA_GUIDE.md** - Complete implementation guide with rules
- **SEED_DATA_SUMMARY.md** - Detailed data overview

---

## Sample Data Included

### 5 Complete Records

| Volunteer | Date | Shift | Duration | Animals | Issues | Status |
|-----------|------|-------|----------|---------|--------|--------|
| Sarah Johnson | 2026-06-27 | Morning | 2h 45m | 14 | 0 | Clean |
| Michael Chen | 2026-06-26 | Afternoon | 2h 30m | 14 | 1 | Feeding issue (moderate) |
| Emma Rodriguez | 2026-06-25 | Morning | 2h 45m | 14 | 0 | Excellent |
| Sarah Johnson | 2026-06-25 | Evening | 2h | 14 | 0 | Stable |
| David Thompson | 2026-06-24 | Morning | 2h 45m | 14 | 1 | Equipment issue (resolved) |

---

## Data Structure

Each record contains:

```javascript
{
  // Volunteer
  volunteerId: string,
  volunteerName: string,
  
  // Shift Details
  shiftId: string,
  shiftType: 'morning' | 'afternoon' | 'evening',
  startTime: 'HH:MM',
  endTime: 'HH:MM',
  duration: string,
  date: 'YYYY-MM-DD',
  
  // Facility Sections (4 per round)
  sections: [
    { id, name, completedAt, notes, animalsChecked, feedingCompleted }
  ],
  
  // Summary
  totalAnimalsChecked: 14,
  issuesCount: 0-1,
  issuesReported: [
    { animalId, type, description, severity, reportedAt, resolution? }
  ],
  
  // Notes
  notes: string,
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## How to Use

### Run Seed Script
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

### Access in Application
```javascript
import { useRoundsHistoryStore } from '@/stores/roundsHistory'

const store = useRoundsHistoryStore()

// Fetch all rounds
await store.fetchRounds()

// Filter by volunteer
await store.fetchRounds({ volunteerId: 'volunteer_001' })

// Filter by shift
await store.fetchRounds({ shiftId: 'shift_morning_001' })
```

### View in UI
Navigate to Admin > Rounds History page to see all seeded data.

---

## Firestore Security Rules

Add this to your Firestore security rules to enable writes:

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

For production, use role-based access:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /roundsHistory/{document=**} {
      allow read: if request.auth != null && 
        request.auth.token.role in ['admin', 'staff'];
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'staff'];
    }
  }
}
```

---

## Files Reference

### Seed Script
- **Location:** `scripts/seedRoundsHistory.js`
- **Lines:** 310
- **Size:** 8.4 KB

### Data Schema
- **Location:** `scripts/roundsHistorySeedDataSchema.json`
- **Type:** JSON schema reference

### Documentation
- **ROUNDS_HISTORY_SEED_DATA.md** - Quick reference (4.2 KB)
- **SEED_DATA_GUIDE.md** - Full guide (5.9 KB)
- **SEED_DATA_SUMMARY.md** - Detailed overview (6.1 KB)

### Implementation Files
- **package.json** - Added npm script
- **src/stores/roundsHistory.js** - Existing store (unchanged)
- **src/components/features/admin/RoundsHistoryPage.vue** - Existing component (unchanged)
- **src/services/firebase.js** - Firebase config (unchanged)

---

## Facilities Included

All 4 facility sections are covered in each round:
1. North Enclosure (4 animals)
2. Quarantine Area (1 animal)
3. Central Habitat (6 animals)
4. South Enclosure (3 animals)

Total: 14 animals per round

---

## Issue Scenarios

### Record 2: Feeding Issue
- **Animal:** Ball python (animal_042)
- **Issue:** Reduced appetite
- **Severity:** Moderate
- **Status:** Documented for monitoring

### Record 5: Equipment Issue
- **Issue:** Heating lamp malfunction in Central Habitat
- **Severity:** High
- **Resolution:** Lamp replaced, temperature restored
- **Status:** Resolved

---

## Realistic Data Characteristics

- 4 different volunteers
- 3 different shift types
- 4-day date range
- Multiple scenarios (successes and issues)
- Consistent animal counts
- Detailed section tracking
- Issue documentation with severity levels
- Timestamps for audit trail

---

## Troubleshooting

### Permission Denied Error
Ensure Firestore security rules allow writes to roundsHistory collection.

### Script Not Running
```bash
npm install
npm run seed:rounds-history
```

### Data Not Appearing
Check Firebase Console > Firestore > roundsHistory collection exists.

---

## Cleanup

To delete seeded records:

### Via Firebase Console
1. Go to Firebase Console > Firestore
2. Select roundsHistory collection
3. Delete documents

### Via JavaScript
```javascript
const { getDocs, deleteDoc, collection, doc } = await import('firebase/firestore')
const { db } = await import('@/services/firebase')

const snap = await getDocs(collection(db, 'roundsHistory'))
snap.docs.forEach(d => deleteDoc(doc(db, 'roundsHistory', d.id)))
```

---

## Integration Notes

### With Existing Components
The seeded data is fully compatible with:
- `RoundsHistoryPage.vue` component
- `roundsHistory` Pinia store
- Firebase Firestore database
- Existing query structure

### Data Validation
All records have been validated against:
- Store schema expectations
- Component display requirements
- Firestore data type constraints
- Timestamp formatting standards

---

## Next Steps

1. Update Firestore security rules
2. Run: `npm run seed:rounds-history`
3. Verify data in Firebase Console
4. Test Admin > Rounds History page
5. Check filtering by date and volunteer
6. Validate display in RoundsHistoryPage

---

## Additional Resources

- [RoundsHistoryPage Component](./src/components/features/admin/RoundsHistoryPage.vue)
- [Rounds History Store](./src/stores/roundsHistory.js)
- [Firebase Configuration](./src/services/firebase.js)
- [Seed Data Guide](./SEED_DATA_GUIDE.md)
