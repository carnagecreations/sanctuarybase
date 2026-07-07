# Finance Stats Collection Setup

This document describes how to add the `financeStats` collection to your Firestore database with seed data.

## Files Created

### 1. Firestore Security Rules
- **Location**: `firestore.rules` (in project root)
- **Status**: Created but not yet deployed
- **Action Required**: Deploy to production

### 2. Seed Scripts (ready to run)
- **Location**: `scripts/seedFinanceStats.js` (web SDK version)
- **Location**: `functions/seed-finance-stats.js` (admin SDK version)

## Step 1: Deploy Firestore Security Rules

The `financeStats` collection requires a security rule to allow reads/writes by authenticated users.

### Option A: Using Firebase CLI (Recommended)

```bash
# Navigate to project directory
cd "C:\Users\lawye\Projects\SB- v2"

# Login with a valid Firebase account (with admin access)
firebase login --reauth

# Deploy only firestore rules
firebase deploy --only firestore:rules --project sanctuarybasev2
```

The rule that will be deployed:
```
match /financeStats/{docId} { 
  allow read: if isAuth(); 
  allow write: if isPrivileged(); 
}
```

### Option B: Manual Deployment via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com) 
2. Select project: **sanctuarybasev2**
3. Navigate to **Firestore Database** > **Rules** tab
4. Add this rule to your existing rules file:

```
// ─── FINANCE STATS ─────────────────────────────────────────────────────────
match /financeStats/{docId} { 
  allow read: if isAuth(); 
  allow write: if isPrivileged(); 
}
```

Place it after the donations rule and before the eodreports rule.

5. Click **Publish**

## Step 2: Run the Seed Script

Once the Firestore rules are deployed, run the seed script to populate sample data:

```bash
cd "C:\Users\lawye\Projects\SB- v2"
node scripts/seedFinanceStats.js
```

### Expected Output
```
Starting to seed finance stats to Firestore...
Project ID: sanctuarybasev2

✓ Added finance stats for April 2026
  ID: [document-id]
  Revenue: $24,580
  Expenses: $8,920
  Net Balance: $15,660

✓ Added finance stats for March 2026
  ID: [document-id]
  Revenue: $18,400
  Expenses: $7,100
  Net Balance: $11,300

✓ Added finance stats for February 2026
  ID: [document-id]
  Revenue: $29,600
  Expenses: $10,700
  Net Balance: $18,900

✓ Added finance stats for January 2026
  ID: [document-id]
  Revenue: $21,600
  Expenses: $8,100
  Net Balance: $13,500

✓ Added finance stats for December 2025
  ID: [document-id]
  Revenue: $35,900
  Expenses: $11,900
  Net Balance: $24,000

-------------------------------------------
✓ Successfully added all finance stats!
Total records added: 5
-------------------------------------------
```

## Seed Data Overview

Five realistic financial records have been created for the period December 2025 - April 2026:

### Record 1: April 2026
- **Revenue**: $24,580 (Donations: $12,400, Adoptions: $7,200, Grants: $4,980)
- **Expenses**: $8,920 (Medical: $5,200, Food/Supplies: $2,400, Operations: $1,320)
- **Net Balance**: $15,660
- **Metrics**: 142 active donors, 8 animals adopted
- **Notes**: Strong month with significant donation spike. Vet costs increased due to preventive care.

### Record 2: March 2026
- **Revenue**: $18,400 (Donations: $9,800, Adoptions: $5,400, Grants: $3,200)
- **Expenses**: $7,100 (Medical: $4,100, Food/Supplies: $1,900, Operations: $1,100)
- **Net Balance**: $11,300
- **Metrics**: 128 active donors, 5 animals adopted
- **Notes**: Regular month. All systems operating smoothly.

### Record 3: February 2026 (Strong Performance)
- **Revenue**: $29,600 (Donations: $15,600, Adoptions: $8,900, Grants: $5,100)
- **Expenses**: $10,700 (Medical: $6,500, Food/Supplies: $2,800, Operations: $1,400)
- **Net Balance**: $18,900
- **Metrics**: 156 active donors, 12 animals adopted
- **Notes**: Excellent month! Holiday season donations boost. Higher med costs for winter health checks.

### Record 4: January 2026
- **Revenue**: $21,600 (Donations: $11,200, Adoptions: $6,300, Grants: $4,100)
- **Expenses**: $8,100 (Medical: $4,800, Food/Supplies: $2,100, Operations: $1,200)
- **Net Balance**: $13,500
- **Metrics**: 135 active donors, 7 animals adopted
- **Notes**: New Year start. Planning for spring rehabilitation season.

### Record 5: December 2025 (Highest Revenue)
- **Revenue**: $35,900 (Donations: $18,900, Adoptions: $10,200, Grants: $6,800)
- **Expenses**: $11,900 (Medical: $7,200, Food/Supplies: $3,100, Operations: $1,600)
- **Net Balance**: $24,000
- **Metrics**: 178 active donors, 15 animals adopted
- **Notes**: Year-end surge with holiday donations and tax-deductible giving. Highest revenue month of year.

## Data Schema

Each `financeStats` document contains:

```javascript
{
  month: number (1-12),
  year: number,
  revenue: {
    donations: number,
    adoptions: number,
    grants: number,
    total: number
  },
  expenses: {
    medicalVetCare: number,
    foodSupplies: number,
    operations: number,
    total: number
  },
  netBalance: number,
  activeDonors: number,
  animalsAdopted: number,
  notes: string,
  createdAt: timestamp (server)
}
```

## Querying Finance Stats

In your Vue components, you can query finance stats like this:

```javascript
// Fetch all finance stats
const stats = await store.fetchFinanceStats()

// Fetch by month/year
const marchStats = await store.fetchStatsByMonth(3, 2026)

// Query in Firestore
const q = query(
  collection(db, 'financeStats'),
  where('year', '==', 2026),
  orderBy('month', 'desc')
)
```

## Troubleshooting

### "PERMISSION_DENIED: Missing or insufficient permissions"
This error occurs when the `financeStats` collection rule is not deployed. Follow Step 1 above to deploy the security rules.

### "Cannot find module 'firebase-admin'"
Run `npm install firebase-admin` in the project root.

### "Service account key not found" (when using admin SDK)
This is expected. The script falls back to Application Default Credentials. Make sure you have proper Firebase authentication configured.

## Next Steps

1. Deploy the Firestore security rules (Step 1)
2. Run the seed script (Step 2)
3. Verify data appears in Firestore Console
4. Test the Finance Stats Page component loads the data correctly
5. Add more records as needed using the store methods

## Related Files

- Store: `src/stores/financeStats.js`
- Component: `src/components/features/admin/FinanceStatsPage.vue`
- Config: `src/services/firebase.js`
