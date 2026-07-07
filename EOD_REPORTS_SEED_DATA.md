# EOD Reports Seed Data - Complete Guide

## Overview

5 realistic sample EOD (End of Day) reports have been created and seeded into the Firestore `eodReports` collection. These reports contain realistic data for sanctuary operations from June 23-27, 2026.

## Files Created

1. **seed-eod-reports-rest.js** - Seed script using Firebase REST API
2. **scripts/seedEODReports.js** - Seed script using Firebase SDK
3. **eodReports-seed-data.json** - Raw JSON data for manual import
4. **docs/archive/SEED_DATA_INSTRUCTIONS.md** - Detailed implementation instructions
5. **package.json** - Updated with `seed:eod-reports` npm script

## Seed Data Summary

### Record 1: June 27, 2026 - 6:30 PM
```
Animals Fed: 24/24 (all animals)
Medications: 8 doses administered
Volunteers: 5 on shift
Status: Submitted
Issues: 2
  - Bernard (Ball Python): Reduced appetite (MEDIUM priority)
  - Corn Snake - Red: Shedding observed (LOW priority)
Notes: All animals fed and hydrated successfully. Bernard was particularly active.
```

### Record 2: June 26, 2026 - 7:00 PM
```
Animals Fed: 23/24 (1 skipped)
Medications: 10 doses administered
Volunteers: 6 on shift
Status: Submitted
Issues: 3
  - Green Iguana - Raja: Refusing food, lethargy (HIGH priority)
  - Bearded Dragon - Spike: Scale discoloration (MEDIUM priority)
  - Garter Snake - Ziggy: Water bowl maintenance (LOW priority)
Notes: Meds administered on schedule. One reptile skipped due to stress.
```

### Record 3: June 25, 2026 - 5:45 PM
```
Animals Fed: 24/24 (all animals)
Medications: 7 doses administered
Volunteers: 4 on shift
Status: Submitted
Issues: 0
Notes: Successful feeding day with no issues. All tasks completed efficiently.
```

### Record 4: June 24, 2026 - 6:15 PM
```
Animals Fed: 22/24 (2 skipped)
Medications: 9 doses administered
Volunteers: 5 on shift
Status: Submitted
Issues: 3
  - King Cobra - Kasha: Aggressive behavior (HIGH priority)
  - Reticulated Python - Rey: Striking behavior (HIGH priority)
  - Corn Snake - Orange: Normal shedding cycle (LOW priority)
Notes: Two animals skipped due to aggressive behavior. Plan AM retry.
```

### Record 5: June 23, 2026 - 6:00 PM
```
Animals Fed: 24/24 (all animals)
Medications: 6 doses administered
Volunteers: 3 on shift
Status: Submitted
Issues: 1
  - Blue Tongue Skink - Bluey: Due for scale soak (LOW priority)
Notes: Smooth operations. New volunteer completed first full shift successfully.
```

## Data Structure

Each EOD Report document contains:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `animalsFed` | String | Format "X/Y" showing animals fed | "24/24" |
| `medsGiven` | Number | Total medication doses administered | 8 |
| `volunteersCount` | Number | Number of volunteers on shift | 5 |
| `status` | String | Report submission status | "submitted" |
| `notes` | String | General observations and notes | "All animals fed..." |
| `issues` | Array | Array of reported issues | See structure below |
| `createdAt` | Timestamp | When the report was submitted | 2026-06-27T18:30:00Z |

### Issue Object Structure

```javascript
{
  id: String,              // Unique identifier within report
  animal: String,          // Animal name/identifier
  issue: String,           // Description of the issue
  priority: String         // "high", "med", or "low"
}
```

## How to Seed the Data

### Method 1: Using REST API (Requires Firestore Rule Update)

**Important**: This method requires temporarily allowing unauthenticated writes to the eodReports collection.

1. **Update Firestore Rules** in Firebase Console:
   - Go to: Firestore Database > Rules
   - Add this rule to allow unauthenticated writes to eodReports:
   ```firestore
   match /eodReports/{document=**} {
     allow read, write: if true;
   }
   ```
   - Publish the rules

2. **Run the seed script**:
   ```bash
   node seed-eod-reports-rest.js
   ```

3. **Restore Firestore Rules** to secure state:
   ```firestore
   match /eodReports/{document=**} {
     allow read, write: if request.auth.uid != null;
   }
   ```

### Method 2: Using NPM Script (After Admin SDK Setup)

1. **Install Firebase Admin SDK**:
   ```bash
   npm install firebase-admin
   ```

2. **Get Service Account Key**:
   - Firebase Console > Settings > Service Accounts
   - Generate private key
   - Save as `serviceAccountKey.json` in project root
   - Add to `.gitignore`

3. **Run the seed command**:
   ```bash
   npm run seed:eod-reports
   ```

### Method 3: Manual Import via Firebase Console

1. Use the data in `eodReports-seed-data.json`
2. In Firebase Console > Firestore > Start collection
3. Collection ID: `eodReports`
4. Manually add documents with the JSON data

## Verifying the Data

After seeding:

1. **In Firebase Console**:
   - Navigate to Firestore Database
   - Look for `eodReports` collection
   - Verify 5 documents are present with correct timestamps

2. **In the Application**:
   - Navigate to Admin Hub > EOD Report page
   - Refresh the page
   - Verify summary cards show aggregated data
   - Check that reports appear in the report list

3. **Data Validation**:
   - All 5 reports should have status "submitted"
   - Timestamps should range from 2026-06-23 to 2026-06-27
   - Each report should have 3-6 fields with appropriate data types

## Usage in Application

The seeded data will be used by:

**Store**: `/src/stores/eodReports.js`
- `fetchReports()` - Retrieves all reports sorted by date (newest first)
- `createReport()` - Creates new reports
- `updateReport()` - Updates existing reports
- `deleteReport()` - Deletes reports

**Component**: `/src/components/features/admin/EODReportPage.vue`
- Displays today's summary statistics
- Shows daily totals and trends
- Lists reported issues by priority

## Sample Queries You Can Run

With the seeded data, you can test these queries:

```javascript
// Get all submitted reports
const reports = await eodReports.fetchReports({ status: 'submitted' })

// Get reports from specific date
const today = new Date().toDateString()
const todayReports = reports.filter(r => new Date(r.createdAt).toDateString() === today)

// Get high-priority issues
const highPriority = reports
  .flatMap(r => r.issues || [])
  .filter(i => i.priority === 'high')

// Calculate total animals fed
const totalFed = reports.reduce((sum, r) => {
  const [fed] = r.animalsFed.split('/').map(Number)
  return sum + fed
}, 0)
```

## Cleaning Up Seed Data

To delete all seeded reports:

**Via Firebase Console**:
1. Firestore Database > eodReports collection
2. Select all 5 documents
3. Click Delete
4. Confirm

**Via Code**:
```javascript
const reports = await eodReports.fetchReports()
for (const report of reports) {
  await eodReports.deleteReport(report.id)
}
```

## Notes and Considerations

1. **Realistic Data**: The sample data reflects real sanctuary operations including:
   - Varying numbers of animals successfully fed
   - Realistic medication counts
   - Common issues like appetite changes and shedding
   - Behavioral concerns (aggression) during feeding
   - Maintenance tasks

2. **Date Range**: Data is from June 23-27, 2026 (5 consecutive days) to show a week of operations

3. **Priority Levels**: Issues are classified as:
   - **HIGH**: Requires immediate attention (health, aggression, refusal to eat)
   - **MEDIUM**: Should be monitored (appetite changes, scale issues)
   - **LOW**: Routine maintenance (water bowl changes, preparation for treatments)

4. **Testing**: This data is suitable for:
   - UI/UX testing
   - Report filtering and sorting
   - Date range queries
   - Aggregation calculations
   - Performance testing with multiple documents

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission Denied | Verify Firestore rules allow writes. Check rules were published. |
| Collection not appearing | Try refreshing browser. Check write was successful. |
| Script errors | Ensure Node 16+. Check Firebase config in script. |
| Data not showing in app | Clear browser cache. Verify collection exists in Firestore. |

## Next Steps

1. Run seed script using preferred method
2. Verify data in Firebase Console
3. Test EOD Report page functionality
4. Adjust sample data as needed for specific test scenarios
5. Create additional seed scripts for other collections as needed

---

For detailed implementation instructions, see: **docs/archive/SEED_DATA_INSTRUCTIONS.md**
