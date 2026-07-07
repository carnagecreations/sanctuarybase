# Feeding Logs Seed Data

This document describes the structure and sample data for the `feedingLogs` collection in Firestore.

## Collection: `feedingLogs`

### Field Structure

Each feeding log document contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `animalId` | string | Reference to the animal being fed |
| `name` | string | Animal's name |
| `emoji` | string | Animal emoji icon |
| `species` | string | Species of the animal |
| `diet` | string | Type of diet/food |
| `amount` | string | Quantity fed |
| `given` | boolean | Whether feeding was completed (true) or pending (false) |
| `timestamp` | Timestamp | When the feeding occurred or is scheduled |
| `by` | string | Name of person who fed or will feed the animal |
| `notes` | string | Additional observations or notes |
| `wellbeing` | string | Animal's condition (healthy, sluggish, refusing food, etc.) |
| `feedingDuration` | number | Duration in minutes it took the animal to eat |
| `createdAt` | Timestamp | Server timestamp when record was created |

### Sample Data (5 Records)

#### 1. Saphira - Ball Python (Completed - 2 days ago)
```
animalId: animal-001
name: Saphira
emoji: 🐍
species: Ball Python
diet: Live mice
amount: 2 mice
given: true
timestamp: 2026-06-26
by: Sarah Johnson
notes: Ate both mice immediately. Good appetite.
wellbeing: healthy
feedingDuration: 15 minutes
```

#### 2. Rex - Bearded Dragon (Completed - 1 day ago)
```
animalId: animal-002
name: Rex
emoji: 🦎
species: Bearded Dragon
diet: Roaches & Greens
amount: 10 roaches + salad
given: true
timestamp: 2026-06-27
by: Marcus Chen
notes: Ate all vegetables. Roaches left in enclosure.
wellbeing: healthy
feedingDuration: 20 minutes
```

#### 3. Nile - Red Eared Slider (Completed - Today)
```
animalId: animal-003
name: Nile
emoji: 🐢
species: Red Eared Slider
diet: Aquatic pellets & veggies
amount: 1/4 cup pellets + greens
given: true
timestamp: 2026-06-28 (today)
by: Jessica Martinez
notes: Swimming actively. Fed at 10:00 AM.
wellbeing: healthy
feedingDuration: 10 minutes
```

#### 4. Ember - Corn Snake (Pending - Today)
```
animalId: animal-004
name: Ember
emoji: 🐍
species: Corn Snake
diet: Frozen-thawed mice
amount: 1 adult mouse
given: false
timestamp: 2026-06-28 (today)
by: Admin
notes: Scheduled feeding. Will feed at 6:00 PM.
wellbeing: healthy
feedingDuration: null (not yet fed)
```

#### 5. Luna - Leopard Gecko (Completed - 3 days ago)
```
animalId: animal-005
name: Luna
emoji: 🦗
species: Leopard Gecko
diet: Crickets & dusted insects
amount: 15 crickets
given: true
timestamp: 2026-06-25
by: David Park
notes: Ate roughly 12 of 15 crickets. Removed uneaten ones after 10 mins.
wellbeing: healthy
feedingDuration: 8 minutes
```

## Usage

### Run the Seed Script

To add these 5 sample records to Firestore:

```bash
node scripts/seedFeedingLogs.js
```

This script will:
1. Connect to Firestore using the configured Firebase project
2. Add 5 realistic feeding log records
3. Print confirmation messages with document IDs
4. Exit successfully

### Verify Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (sanctuarybasev2)
3. Navigate to **Firestore Database**
4. Find the `feedingLogs` collection
5. You should see 5 documents with the sample data

## Example Query Usage (in Vue/JS)

```javascript
import { useFeedingLogsStore } from '@/stores/feedingLogs'

const feedingLogsStore = useFeedingLogsStore()

// Fetch all feeding logs
await feedingLogsStore.fetchFeedingLogs()

// Get logs for a specific animal
const animalLogs = await feedingLogsStore.fetchLogsByAnimal('animal-001')

// Filter today's feedings
const today = new Date().toDateString()
const todaysLogs = feedingLogsStore.feedingLogs.filter(log => {
  const logDate = new Date(log.timestamp?.toDate?.() || log.timestamp).toDateString()
  return logDate === today
})
```

## Notes

- Timestamps are stored as Firebase Timestamp objects
- The `given` field determines if the feeding is completed (true) or pending (false)
- Pending feedings appear in "Today's feedings" section on the Feeding Log page
- Completed feedings appear in "Recent feedings" section
- The seed script can be run multiple times; it will create duplicate records
- To clear existing data, manually delete documents in Firebase Console or use a cleanup script

## Next Steps

1. Run the seed script to populate sample data
2. Access the Feeding Log page in the admin dashboard
3. Verify that all 5 records appear in the UI
4. Test filtering by date and animal
5. Test marking feedings as complete
