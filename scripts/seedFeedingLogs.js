#!/usr/bin/env node

// This script seeds the feedingLogs collection in Firestore with sample data
// Run with: node scripts/seedFeedingLogs.js

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDxOOKDrFfCGBRENNSsFTmau0v7U144vrw',
  authDomain: 'sanctuarybasev2.firebaseapp.com',
  projectId: 'sanctuarybasev2',
  storageBucket: 'sanctuarybasev2.firebasestorage.app',
  messagingSenderId: '701865805759',
  appId: '1:701865805759:web:592f9bd6445520018e830a',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample feeding logs data - 5 realistic records for a reptile sanctuary
const feedingLogsData = [
  {
    animalId: 'animal-001',
    name: 'Saphira',
    emoji: '🐍',
    species: 'Ball Python',
    diet: 'Live mice',
    amount: '2 mice',
    given: true,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    by: 'Sarah Johnson',
    notes: 'Ate both mice immediately. Good appetite.',
    wellbeing: 'healthy',
    feedingDuration: 15,
  },
  {
    animalId: 'animal-002',
    name: 'Rex',
    emoji: '🦎',
    species: 'Bearded Dragon',
    diet: 'Roaches & Greens',
    amount: '10 roaches + salad',
    given: true,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    by: 'Marcus Chen',
    notes: 'Ate all vegetables. Roaches left in enclosure.',
    wellbeing: 'healthy',
    feedingDuration: 20,
  },
  {
    animalId: 'animal-003',
    name: 'Nile',
    emoji: '🐢',
    species: 'Red Eared Slider',
    diet: 'Aquatic pellets & veggies',
    amount: '1/4 cup pellets + greens',
    given: true,
    timestamp: new Date(),
    by: 'Jessica Martinez',
    notes: 'Swimming actively. Fed at 10:00 AM.',
    wellbeing: 'healthy',
    feedingDuration: 10,
  },
  {
    animalId: 'animal-004',
    name: 'Ember',
    emoji: '🐍',
    species: 'Corn Snake',
    diet: 'Frozen-thawed mice',
    amount: '1 adult mouse',
    given: false,
    timestamp: new Date(),
    by: 'Admin',
    notes: 'Scheduled feeding. Will feed at 6:00 PM.',
    wellbeing: 'healthy',
    feedingDuration: null,
  },
  {
    animalId: 'animal-005',
    name: 'Luna',
    emoji: '🦗',
    species: 'Leopard Gecko',
    diet: 'Crickets & dusted insects',
    amount: '15 crickets',
    given: true,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
    by: 'David Park',
    notes: 'Ate roughly 12 of 15 crickets. Removed uneaten ones after 10 mins.',
    wellbeing: 'healthy',
    feedingDuration: 8,
  },
]

const seedFeedingLogs = async () => {
  try {
    console.log('Starting to seed feeding logs to Firestore...')
    console.log(`Project ID: ${firebaseConfig.projectId}\n`)

    const feedingLogsCollection = collection(db, 'feedingLogs')
    let successCount = 0

    for (const logData of feedingLogsData) {
      const docRef = await addDoc(feedingLogsCollection, {
        ...logData,
        createdAt: serverTimestamp(),
      })
      successCount++
      console.log(`✓ Added feeding log for ${logData.name} (${logData.species})`)
      console.log(`  ID: ${docRef.id}`)
      console.log(`  Status: ${logData.given ? 'Completed' : 'Pending'}`)
      console.log()
    }

    console.log('-------------------------------------------')
    console.log('✓ Successfully added all feeding logs!')
    console.log(`Total records added: ${successCount}`)
    console.log('-------------------------------------------')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding feeding logs:', error.message)
    process.exit(1)
  }
}

seedFeedingLogs()
