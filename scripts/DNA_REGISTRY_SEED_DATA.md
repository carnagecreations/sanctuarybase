# DNA Registry Seed Data

This directory contains seed data and scripts for populating the DNA Registry collection in Firestore with realistic sample records.

## Sample Records (5 Total)

### 1. Monty (Ball Python)
- **Animal ID:** ball-python-001
- **Sample ID:** BP-2024-001-LAB
- **Sample Type:** Blood
- **Lab:** Reptile Genetics Lab
- **Collection Date:** 2024-06-15
- **Status:** Completed
- **Results:** Normal - no genetic markers of concern
- **Description:** Blood sample collected during routine health check. Results indicate healthy genetic profile with no concerning genetic markers.

### 2. Blaze (Corn Snake)
- **Animal ID:** corn-snake-042
- **Sample ID:** CS-2024-042-GEN
- **Sample Type:** Saliva
- **Lab:** Genome Health Labs
- **Collection Date:** 2024-05-22
- **Status:** Completed
- **Results:** Heterozygous for amel trait (orange morph)
- **Description:** Saliva swab confirmed orange morph genetics. This specimen is suitable for breeding programs due to its desirable genetic markers.

### 3. Scarlet (Boa Constrictor)
- **Animal ID:** boa-constrictor-015
- **Sample ID:** BC-2024-015-POLY
- **Sample Type:** Tissue
- **Lab:** Genetic Polymorphism Institute
- **Collection Date:** 2024-04-10
- **Status:** Completed
- **Results:** Heterozygous recessive - possible breeding candidate
- **Description:** Tissue sample processed successfully. Animal carries recessive alleles of genetic interest for selective breeding programs.

### 4. Shadow (King Snake)
- **Animal ID:** king-snake-008
- **Sample ID:** KS-2024-008-REP
- **Sample Type:** Hair
- **Lab:** Reptile Genetics Lab
- **Collection Date:** 2024-06-28
- **Status:** Pending
- **Results:** (Awaiting lab results)
- **Description:** Hair sample submitted for non-invasive genetic testing. Currently in processing at the laboratory.

### 5. Princess (Royal Python)
- **Animal ID:** python-royal-033
- **Sample ID:** RP-2024-033-TRAIT
- **Sample Type:** Blood
- **Lab:** Herpetological Genetics Center
- **Collection Date:** 2024-06-01
- **Status:** Completed
- **Results:** Homozygous for ball python spider gene (confirmed)
- **Description:** Blood test confirmed spider gene expression. Important genetic marker for breeding decisions and monitoring.

## Data Structure

Each DNA Registry record contains:

```javascript
{
  animalId: string,          // Reference to animal in animals collection
  animal: string,            // Animal name
  sampleId: string,          // Lab tracking number (unique)
  sampleType: string,        // 'blood' | 'saliva' | 'hair' | 'tissue'
  lab: string,               // Laboratory name
  collectionDate: string,    // Date of collection (YYYY-MM-DD)
  status: string,            // 'pending' | 'completed'
  results: string | null,    // Genetic test results or null if pending
  notes: string,             // Optional notes (in some records)
  createdAt: Date,           // Record creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

## How to Use

### Option 1: Using the Helper Script (Recommended)

```bash
# From project root
node scripts/seed-dna-registry-helper.mjs
```

This will:
- Connect to Firestore
- Check for existing records
- Add 5 new DNA registry samples
- Skip any duplicates (by sampleId)
- Display results summary

### Option 2: Manual Import via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (sanctuarybasev2)
3. Navigate to Firestore Database
4. Create collection: `dnaRegistry`
5. Import data from `dna-registry-seed-data.json`

### Option 3: Direct Code Usage

In your Vue component or store:

```javascript
import { useDnaRegistryStore } from '@/stores/dnaRegistry'

const dnaStore = useDnaRegistryStore()

// Add a sample record
await dnaStore.addDnaRecord({
  animalId: 'ball-python-001',
  animal: 'Monty',
  sampleId: 'BP-2024-001-LAB',
  sampleType: 'blood',
  lab: 'Reptile Genetics Lab',
  collectionDate: '2024-06-15',
  status: 'completed',
  results: 'Normal - no genetic markers of concern',
})
```

## Field Specifications

### sampleType
Valid values: `'blood'`, `'saliva'`, `'hair'`, `'tissue'`

### status
Valid values: `'pending'`, `'completed'`

### sampleId
Format recommendation: `[SPECIES-CODE]-[YEAR]-[NUMBER]-[LAB-CODE]`
Examples:
- BP-2024-001-LAB (Ball Python, 2024, first sample, Reptile Lab)
- CS-2024-042-GEN (Corn Snake, 2024, 42nd sample, Genome Lab)

## Requirements

### Prerequisites
- Firebase project initialized (sanctuarybasev2)
- Animals already in the database (referenced by animalId)
- Node.js with Firebase SDK installed

### Dependencies
- `firebase` package (already in project)

## Notes

- The `createdAt` and `updatedAt` timestamps are set automatically by Firebase in the actual implementation
- The script checks for duplicate sampleIds to prevent re-adding the same record
- Animal references use existing animalIds from the animals collection
- Dates are stored as ISO 8601 formatted strings (YYYY-MM-DD)
- Status should reflect whether lab results have been returned

## Extending the Data

To add more sample records, follow the same structure and add them to the appropriate script or JSON file:

```javascript
{
  animalId: 'species-number',
  animal: 'Animal Name',
  sampleId: '[SPECIES-CODE]-YYYY-###-[LAB]',
  sampleType: 'blood|saliva|hair|tissue',
  lab: 'Lab Name',
  collectionDate: 'YYYY-MM-DD',
  status: 'pending|completed',
  results: 'Description or null',
  createdAt: new Date(),
  updatedAt: new Date(),
}
```
