#!/usr/bin/env node
/**
 * DNA Registry Seed Data Helper
 *
 * Usage:
 *   node scripts/seed-dna-registry-helper.mjs
 *
 * This script adds 5 realistic DNA registry sample records to Firestore.
 * Records include various sample types, labs, and completion statuses.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDxOOKDrFfCGBRENNSsFTmau0v7U144vrw',
  authDomain: 'sanctuarybasev2.firebaseapp.com',
  projectId: 'sanctuarybasev2',
  storageBucket: 'sanctuarybasev2.firebasestorage.app',
  messagingSenderId: '701865805759',
  appId: '1:701865805759:web:592f9bd6445520018e830a',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Realistic DNA Registry Sample Records
const sampleRecords = [
  {
    animalId: 'ball-python-001',
    animal: 'Monty',
    sampleId: 'BP-2024-001-LAB',
    sampleType: 'blood',
    lab: 'Reptile Genetics Lab',
    collectionDate: '2024-06-15',
    status: 'completed',
    results: 'Normal - no genetic markers of concern',
    notes: 'Blood sample collected during routine health check. Results indicate healthy genetic profile.',
    createdAt: new Date('2024-06-15T14:30:00Z'),
    updatedAt: new Date('2024-06-20T09:15:00Z'),
  },
  {
    animalId: 'corn-snake-042',
    animal: 'Blaze',
    sampleId: 'CS-2024-042-GEN',
    sampleType: 'saliva',
    lab: 'Genome Health Labs',
    collectionDate: '2024-05-22',
    status: 'completed',
    results: 'Heterozygous for amel trait (orange morph)',
    notes: 'Saliva swab confirmed orange morph genetics. Suitable for breeding programs.',
    createdAt: new Date('2024-05-22T10:00:00Z'),
    updatedAt: new Date('2024-05-28T16:45:00Z'),
  },
  {
    animalId: 'boa-constrictor-015',
    animal: 'Scarlet',
    sampleId: 'BC-2024-015-POLY',
    sampleType: 'tissue',
    lab: 'Genetic Polymorphism Institute',
    collectionDate: '2024-04-10',
    status: 'completed',
    results: 'Heterozygous recessive - possible breeding candidate',
    notes: 'Tissue sample processed. Animal carries recessive alleles of interest for breeding.',
    createdAt: new Date('2024-04-10T11:20:00Z'),
    updatedAt: new Date('2024-04-16T13:50:00Z'),
  },
  {
    animalId: 'king-snake-008',
    animal: 'Shadow',
    sampleId: 'KS-2024-008-REP',
    sampleType: 'hair',
    lab: 'Reptile Genetics Lab',
    collectionDate: '2024-06-28',
    status: 'pending',
    results: null,
    notes: 'Hair sample submitted for non-invasive genetic testing. Currently in processing at lab.',
    createdAt: new Date('2024-06-28T08:00:00Z'),
    updatedAt: new Date('2024-06-28T08:00:00Z'),
  },
  {
    animalId: 'python-royal-033',
    animal: 'Princess',
    sampleId: 'RP-2024-033-TRAIT',
    sampleType: 'blood',
    lab: 'Herpetological Genetics Center',
    collectionDate: '2024-06-01',
    status: 'completed',
    results: 'Homozygous for ball python spider gene (confirmed)',
    notes: 'Blood test confirmed spider gene expression. Important for breeding decisions.',
    createdAt: new Date('2024-06-01T15:30:00Z'),
    updatedAt: new Date('2024-06-08T10:20:00Z'),
  },
]

async function seedDatabase() {
  try {
    console.log('DNA Registry Seed Data Helper')
    console.log('=============================\n')

    // Check existing records
    const existingQuery = query(collection(db, 'dnaRegistry'))
    const existingSnap = await getDocs(existingQuery)
    console.log(`Current DNA Registry records: ${existingSnap.size}`)
    console.log(`Adding: ${sampleRecords.length} new sample records\n`)

    let successCount = 0
    let skipCount = 0

    for (const record of sampleRecords) {
      try {
        // Check if sample already exists by sampleId
        const dupQuery = query(
          collection(db, 'dnaRegistry'),
          where('sampleId', '==', record.sampleId)
        )
        const dupSnap = await getDocs(dupQuery)

        if (dupSnap.size > 0) {
          console.log(`⊘ Skipped: ${record.animal} (${record.sampleId}) - already exists`)
          skipCount++
        } else {
          const docRef = await addDoc(collection(db, 'dnaRegistry'), record)
          console.log(`✓ Added: ${record.animal} (${record.sampleId})`)
          console.log(`  └─ ID: ${docRef.id}`)
          successCount++
        }
      } catch (error) {
        console.error(`✗ Error adding ${record.animal}:`, error.message)
      }
    }

    console.log(`\n=============================`)
    console.log(`Results:`)
    console.log(`  Added: ${successCount}`)
    console.log(`  Skipped: ${skipCount}`)
    console.log(`  Total: ${existingSnap.size + successCount}`)

    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error.message)
    process.exit(1)
  }
}

seedDatabase()
