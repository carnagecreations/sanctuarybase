# Seeding Ledger Data

This guide explains how to add sample ledger data to Firestore.

## Option 1: Web UI (Recommended)

1. Start your dev server: `npm run dev`
2. Log in to the application
3. Navigate to: `http://localhost:5173/seed-ledger.html`
4. Click "Seed Ledger Data" button
5. The 5 sample entries will be added to your Firestore database

This method respects your Firestore security rules since the request is authenticated.

## Option 2: Vue Component

A Vue component is available at: `src/components/admin/SeedLedgerData.vue`

You can import and use it in any admin page:

```vue
<template>
  <SeedLedgerData />
</template>

<script setup>
import SeedLedgerData from '@/components/admin/SeedLedgerData.vue'
</script>
```

## Sample Data Overview

Five realistic ledger entries are seeded:

1. **Heating lamp supplies and equipment** - $245.50 (Expense)
   - Category: Supplies & Equipment
   - Notes: UVB bulbs, heat tape, thermostats for enclosures

2. **Monthly food donation from community** - $500.00 (Income)
   - Category: Donations
   - Notes: Insects, frozen prey, fresh vegetables

3. **Veterinary care - health checkups** - $1,200.00 (Expense)
   - Category: Medical & Veterinary
   - Notes: Annual checkups for 8 animals, vaccination records updated

4. **Grant received - Wildlife Conservation Fund** - $2,500.00 (Income)
   - Category: Grants & Funding
   - Notes: Q2 wildlife rehabilitation grant

5. **Enclosure renovation and maintenance** - $875.25 (Expense)
   - Category: Facility Maintenance
   - Notes: Glass cleaning, substrate replacement, structural repairs

**Summary:**
- Total Income: $3,000.00
- Total Expenses: $2,320.75
- Net Balance: $679.25

## Ledger Data Structure

Each ledger entry has the following fields:

```javascript
{
  description: string,      // Brief description of the transaction
  category: string,         // Category (e.g., "Supplies & Equipment", "Donations")
  type: string,            // "income" or "expense"
  amount: number,          // Dollar amount
  notes: string,           // Optional detailed notes
  createdAt: timestamp     // Automatically set
}
```

## Modifying Sample Data

To customize the sample data:

1. **In HTML file** (`public/seed-ledger.html`): Edit the `sampleLedgerData` array
2. **In Vue component** (`src/components/admin/SeedLedgerData.vue`): Edit the `sampleLedgerData` array

Both files contain identical sample data for consistency.

## Firestore Collection Structure

Data is stored in the `ledgers` collection:

```
firestore/
  └── ledgers/
       ├── {doc1} → { description, category, type, amount, notes, createdAt }
       ├── {doc2} → { ... }
       └── ...
```

## Firebase Security Rules

The seed operation respects your existing Firestore rules. Ensure your rules allow authenticated users to write to the `ledgers` collection:

```javascript
match /ledgers/{document=**} {
  allow read, write: if request.auth != null;
}
```

---

For questions or issues, refer to the `ledger` store at `src/stores/ledger.js` and the LedgerPage component at `src/components/features/admin/LedgerPage.vue`.
