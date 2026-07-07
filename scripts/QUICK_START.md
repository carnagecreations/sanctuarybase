# DNA Registry Seed Data - Quick Start

## One-Command Setup

```bash
node scripts/seed-dna-registry-helper.mjs
```

This will add 5 realistic DNA registry records to your Firestore database.

## What Gets Added

| Animal | Sample ID | Type | Lab | Status |
|--------|-----------|------|-----|--------|
| Monty | BP-2024-001-LAB | Blood | Reptile Genetics Lab | Completed |
| Blaze | CS-2024-042-GEN | Saliva | Genome Health Labs | Completed |
| Scarlet | BC-2024-015-POLY | Tissue | Genetic Polymorphism | Completed |
| Shadow | KS-2024-008-REP | Hair | Reptile Genetics Lab | Pending |
| Princess | RP-2024-033-TRAIT | Blood | Herpetological Genetics | Completed |

## Files Included

- `seed-dna-registry-helper.mjs` - Main seed script (Node.js)
- `seed-dna-registry.js` - Alternative seed script
- `dna-registry-sample-data.js` - Module with sample data for imports
- `dna-registry-seed-data.json` - JSON format for manual import
- `DNA_REGISTRY_SEED_DATA.md` - Full documentation
- `QUICK_START.md` - This file

## Using Sample Data in Code

```javascript
// Import in a Vue component
import { dnaRegistrySamples } from '@/scripts/dna-registry-sample-data'
import { useDnaRegistryStore } from '@/stores/dnaRegistry'

const dnaStore = useDnaRegistryStore()

// Add all samples
for (const sample of dnaRegistrySamples) {
  await dnaStore.addDnaRecord(sample)
}

// Or use helper functions
import { getSamplesByStatus, getSampleStatistics } from '@/scripts/dna-registry-sample-data'

// Get completed samples
const completed = getSamplesByStatus('completed')

// Get statistics
const stats = getSampleStatistics()
console.log(`Total: ${stats.total}, Completed: ${stats.completed}, Pending: ${stats.pending}`)
```

## Sample Data Fields

```javascript
{
  animalId: 'ball-python-001',      // Animal reference ID
  animal: 'Monty',                  // Animal name
  sampleId: 'BP-2024-001-LAB',      // Lab tracking number
  sampleType: 'blood',              // blood | saliva | hair | tissue
  lab: 'Reptile Genetics Lab',      // Laboratory name
  collectionDate: '2024-06-15',     // YYYY-MM-DD
  status: 'completed',              // pending | completed
  results: 'Normal - no...',        // null if pending
  notes: 'Optional notes...',       // Additional context
  createdAt: new Date(),            // Auto-set
  updatedAt: new Date()             // Auto-set
}
```

## Manual Import (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "sanctuarybasev2" project
3. Firestore Database → Create Collection → "dnaRegistry"
4. Click "Import Documents"
5. Select `dna-registry-seed-data.json`

## Verify Installation

After running the seed script, check Firestore Console:
- `sanctuarybasev2` → Firestore → Collections → `dnaRegistry`
- Should show 5 documents with sample IDs like "BP-2024-001-LAB"

## Need More Records?

Edit any seed file and add more records following the same structure:

```javascript
{
  animalId: 'species-number',
  animal: 'Animal Name',
  sampleId: 'XX-2024-###-LAB',  // Format: SPECIES-YEAR-NUMBER-LAB
  sampleType: 'blood',
  lab: 'Lab Name',
  collectionDate: '2024-MM-DD',
  status: 'completed',
  results: 'Genetic result description',
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

## Requirements

- Node.js installed
- Firebase SDK (already in project)
- Access to Firestore database (sanctuarybasev2)
- Existing animals in database (referenced by animalId) - optional, script will work either way

## Troubleshooting

**Script won't run:**
```bash
# Make sure you're in the project root
cd C:\Users\lawye\Projects\SB- v2
node scripts/seed-dna-registry-helper.mjs
```

**Duplicate records error:**
- Script automatically skips duplicates based on sampleId
- Safe to run multiple times

**Connection error:**
- Verify Firebase config in `src/services/firebase.js`
- Check internet connection
- Ensure project ID matches: `sanctuarybasev2`

## Support

Refer to `DNA_REGISTRY_SEED_DATA.md` for complete documentation.
