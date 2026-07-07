# Rounds History Seed Data Summary

## Overview
Created a complete seed data script for the `roundsHistory` Firestore collection with 5 realistic rounds history records spanning June 24-27, 2026.

## Files Created/Modified

### 1. Seed Script
**Location:** `scripts/seedRoundsHistory.js`
- Node.js script using Firebase Admin SDK
- Adds 5 sample rounds history records to Firestore
- Converts JavaScript dates to Firestore Timestamps
- Provides console feedback during execution

### 2. NPM Script
**File:** `package.json`
**Command:** `npm run seed:rounds-history`
```json
"seed:rounds-history": "node scripts/seedRoundsHistory.js"
```

### 3. Documentation
**Location:** `SEED_DATA_GUIDE.md`
- Complete guide for using the seed script
- Firestore security rules examples
- Data schema documentation
- Troubleshooting guide

## Sample Data Details

### Record 1: Sarah Johnson - Morning Round
```javascript
{
  volunteerId: 'volunteer_001',
  volunteerName: 'Sarah Johnson',
  shiftId: 'shift_morning_001',
  shiftType: 'morning',
  startTime: '07:00',
  endTime: '09:45',
  duration: '2h 45m',
  date: '2026-06-27',
  totalAnimalsChecked: 14,
  issuesCount: 0,
  sections: 4 (North, Quarantine, Central, South)
  notes: 'Smooth morning round. All systems operational.'
}
```

### Record 2: Michael Chen - Afternoon Round
```javascript
{
  volunteerId: 'volunteer_002',
  volunteerName: 'Michael Chen',
  shiftId: 'shift_afternoon_001',
  shiftType: 'afternoon',
  startTime: '14:00',
  endTime: '16:30',
  duration: '2h 30m',
  date: '2026-06-26',
  totalAnimalsChecked: 14,
  issuesCount: 1,
  issuesReported: [
    {
      animalId: 'animal_042',
      type: 'feeding_issue',
      description: 'One ball python showing reduced appetite',
      severity: 'moderate'
    }
  ],
  notes: 'Afternoon round completed. One snake not eating - monitor closely.'
}
```

### Record 3: Emma Rodriguez - Morning Round
```javascript
{
  volunteerId: 'volunteer_003',
  volunteerName: 'Emma Rodriguez',
  shiftId: 'shift_morning_002',
  shiftType: 'morning',
  startTime: '06:30',
  endTime: '09:15',
  duration: '2h 45m',
  date: '2026-06-25',
  totalAnimalsChecked: 14,
  issuesCount: 0,
  notes: 'Excellent round. All animals healthy and responsive.'
}
```

### Record 4: Sarah Johnson - Evening Round
```javascript
{
  volunteerId: 'volunteer_001',
  volunteerName: 'Sarah Johnson',
  shiftId: 'shift_evening_001',
  shiftType: 'evening',
  startTime: '17:00',
  endTime: '19:00',
  duration: '2h',
  date: '2026-06-25',
  totalAnimalsChecked: 14,
  issuesCount: 0,
  notes: 'Evening round successful. All systems stable.'
}
```

### Record 5: David Thompson - Morning Round
```javascript
{
  volunteerId: 'volunteer_004',
  volunteerName: 'David Thompson',
  shiftId: 'shift_morning_003',
  shiftType: 'morning',
  startTime: '07:00',
  endTime: '09:45',
  duration: '2h 45m',
  date: '2026-06-24',
  totalAnimalsChecked: 14,
  issuesCount: 1,
  issuesReported: [
    {
      animalId: 'animal_089',
      type: 'temperature_issue',
      description: 'Heating lamp malfunction in Central Habitat',
      severity: 'high',
      resolution: 'Lamp replaced, temperature restored to normal'
    }
  ],
  notes: 'Morning round with one equipment issue - resolved quickly.'
}
```

## Data Characteristics

### Coverage
- **Volunteers:** 4 different volunteers (Sarah Johnson, Michael Chen, Emma Rodriguez, David Thompson)
- **Shift Types:** 3 different shift types (morning, afternoon, evening)
- **Date Range:** 4 days (June 24-27, 2026)
- **Total Records:** 5

### Realistic Scenarios
- **Successful Rounds:** 3 records with no issues
- **Problematic Rounds:** 2 records with documented issues
  - Feeding issue (moderate severity)
  - Equipment malfunction (high severity) with resolution
- **Section Coverage:** Each round covers 4 facility sections
- **Animal Tracking:** Consistent 14 animals checked per round

### Data Completeness
Each record includes:
- Volunteer identification (ID and name)
- Shift information (type, ID, start/end times)
- Duration calculation
- Section-by-section completion tracking
- Animal count
- Issues documentation with severity levels
- Timestamp tracking (createdAt, updatedAt)
- Detailed notes for context

## Usage Instructions

### Run the Seed Script
```bash
npm run seed:rounds-history
```

### Expected Output
```
Starting to seed roundsHistory collection...
Added round history record 1/5 - Sarah Johnson (2026-06-27)
Added round history record 2/5 - Michael Chen (2026-06-26)
Added round history record 3/5 - Emma Rodriguez (2026-06-25)
Added round history record 4/5 - Sarah Johnson (2026-06-25)
Added round history record 5/5 - David Thompson (2026-06-24)

Successfully seeded 5 rounds history records!
```

### Query the Data
```javascript
import { useRoundsHistoryStore } from '@/stores/roundsHistory'

const store = useRoundsHistoryStore()
await store.fetchRounds() // Get all rounds

// Filter by volunteer
await store.fetchRounds({ volunteerId: 'volunteer_001' })

// Filter by shift
await store.fetchRounds({ shiftId: 'shift_morning_001' })
```

## Firestore Collection Structure

The `roundsHistory` collection will contain documents with this structure:

```
roundsHistory/
├── [doc_id_1]
│   ├── volunteerId: string
│   ├── volunteerName: string
│   ├── shiftId: string
│   ├── shiftType: string
│   ├── startTime: string
│   ├── endTime: string
│   ├── duration: string
│   ├── date: string
│   ├── sections: array
│   ├── totalAnimalsChecked: number
│   ├── issuesCount: number
│   ├── issuesReported: array
│   ├── notes: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
├── [doc_id_2]
│   └── ... (similar structure)
└── ... (more documents)
```

## Notes

- All timestamps are converted to Firestore Timestamp format
- The script uses the Firebase Firestore SDK (not Admin SDK) for client-side compatibility
- Dates are realistic and span multiple days to show usage patterns
- Issues demonstrate both animal health concerns and equipment problems
- The data is designed to work with the existing RoundsHistoryPage component
