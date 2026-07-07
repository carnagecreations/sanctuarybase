import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

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

const sampleRoundsHistory = [
  {
    volunteerId: 'volunteer_001',
    volunteerName: 'Sarah Johnson',
    shiftId: 'shift_morning_001',
    shiftType: 'morning',
    startTime: '07:00',
    endTime: '09:45',
    duration: '2h 45m',
    date: '2026-06-27',
    sections: [
      {
        id: 'section_1',
        name: 'North Enclosure',
        completedAt: '07:15',
        notes: 'All animals active and healthy',
        animalsChecked: 4,
        feedingCompleted: true
      },
      {
        id: 'section_2',
        name: 'Quarantine Area',
        completedAt: '07:45',
        notes: 'New arrival stable, eating well',
        animalsChecked: 1,
        feedingCompleted: true
      },
      {
        id: 'section_3',
        name: 'Central Habitat',
        completedAt: '08:30',
        notes: 'Water systems checked and refilled',
        animalsChecked: 6,
        feedingCompleted: true
      },
      {
        id: 'section_4',
        name: 'South Enclosure',
        completedAt: '09:15',
        notes: 'Substrate replaced, enrichment items checked',
        animalsChecked: 3,
        feedingCompleted: true
      }
    ],
    totalAnimalsChecked: 14,
    issuesCount: 0,
    issuesReported: [],
    notes: 'Smooth morning round. All systems operational.',
    createdAt: new Date('2026-06-27T07:00:00'),
    updatedAt: new Date('2026-06-27T09:45:00')
  },
  {
    volunteerId: 'volunteer_002',
    volunteerName: 'Michael Chen',
    shiftId: 'shift_afternoon_001',
    shiftType: 'afternoon',
    startTime: '14:00',
    endTime: '16:30',
    duration: '2h 30m',
    date: '2026-06-26',
    sections: [
      {
        id: 'section_1',
        name: 'North Enclosure',
        completedAt: '14:20',
        notes: 'Visual inspection complete',
        animalsChecked: 4,
        feedingCompleted: false
      },
      {
        id: 'section_2',
        name: 'Quarantine Area',
        completedAt: '14:50',
        notes: 'Minor issue: one snake not eating',
        animalsChecked: 1,
        feedingCompleted: false
      },
      {
        id: 'section_3',
        name: 'Central Habitat',
        completedAt: '15:40',
        notes: 'All animals accounted for',
        animalsChecked: 6,
        feedingCompleted: false
      },
      {
        id: 'section_4',
        name: 'South Enclosure',
        completedAt: '16:10',
        notes: 'Temperature regulation checked',
        animalsChecked: 3,
        feedingCompleted: false
      }
    ],
    totalAnimalsChecked: 14,
    issuesCount: 1,
    issuesReported: [
      {
        animalId: 'animal_042',
        type: 'feeding_issue',
        description: 'One ball python showing reduced appetite',
        severity: 'moderate',
        reportedAt: new Date('2026-06-26T14:50:00')
      }
    ],
    notes: 'Afternoon round completed. One snake not eating - monitor closely.',
    createdAt: new Date('2026-06-26T14:00:00'),
    updatedAt: new Date('2026-06-26T16:30:00')
  },
  {
    volunteerId: 'volunteer_003',
    volunteerName: 'Emma Rodriguez',
    shiftId: 'shift_morning_002',
    shiftType: 'morning',
    startTime: '06:30',
    endTime: '09:15',
    duration: '2h 45m',
    date: '2026-06-25',
    sections: [
      {
        id: 'section_1',
        name: 'North Enclosure',
        completedAt: '06:50',
        notes: 'Feed intake normal',
        animalsChecked: 4,
        feedingCompleted: true
      },
      {
        id: 'section_2',
        name: 'Quarantine Area',
        completedAt: '07:20',
        notes: 'Recovery progressing well',
        animalsChecked: 1,
        feedingCompleted: true
      },
      {
        id: 'section_3',
        name: 'Central Habitat',
        completedAt: '08:10',
        notes: 'Humidity levels optimal',
        animalsChecked: 6,
        feedingCompleted: true
      },
      {
        id: 'section_4',
        name: 'South Enclosure',
        completedAt: '08:50',
        notes: 'Cleaning completed, decorations rearranged',
        animalsChecked: 3,
        feedingCompleted: true
      }
    ],
    totalAnimalsChecked: 14,
    issuesCount: 0,
    issuesReported: [],
    notes: 'Excellent round. All animals healthy and responsive.',
    createdAt: new Date('2026-06-25T06:30:00'),
    updatedAt: new Date('2026-06-25T09:15:00')
  },
  {
    volunteerId: 'volunteer_001',
    volunteerName: 'Sarah Johnson',
    shiftId: 'shift_evening_001',
    shiftType: 'evening',
    startTime: '17:00',
    endTime: '19:00',
    duration: '2h',
    date: '2026-06-25',
    sections: [
      {
        id: 'section_1',
        name: 'North Enclosure',
        completedAt: '17:15',
        notes: 'Evening visual check',
        animalsChecked: 4,
        feedingCompleted: false
      },
      {
        id: 'section_2',
        name: 'Quarantine Area',
        completedAt: '17:40',
        notes: 'Isolated animal stable',
        animalsChecked: 1,
        feedingCompleted: false
      },
      {
        id: 'section_3',
        name: 'Central Habitat',
        completedAt: '18:20',
        notes: 'Water top-ups completed',
        animalsChecked: 6,
        feedingCompleted: false
      },
      {
        id: 'section_4',
        name: 'South Enclosure',
        completedAt: '18:50',
        notes: 'Temperature monitoring complete',
        animalsChecked: 3,
        feedingCompleted: false
      }
    ],
    totalAnimalsChecked: 14,
    issuesCount: 0,
    issuesReported: [],
    notes: 'Evening round successful. All systems stable.',
    createdAt: new Date('2026-06-25T17:00:00'),
    updatedAt: new Date('2026-06-25T19:00:00')
  },
  {
    volunteerId: 'volunteer_004',
    volunteerName: 'David Thompson',
    shiftId: 'shift_morning_003',
    shiftType: 'morning',
    startTime: '07:00',
    endTime: '09:45',
    duration: '2h 45m',
    date: '2026-06-24',
    sections: [
      {
        id: 'section_1',
        name: 'North Enclosure',
        completedAt: '07:20',
        notes: 'Morning feeding routine started',
        animalsChecked: 4,
        feedingCompleted: true
      },
      {
        id: 'section_2',
        name: 'Quarantine Area',
        completedAt: '07:55',
        notes: 'Pre-release health checks good',
        animalsChecked: 1,
        feedingCompleted: true
      },
      {
        id: 'section_3',
        name: 'Central Habitat',
        completedAt: '08:45',
        notes: 'Two animals needed temperature adjustment',
        animalsChecked: 6,
        feedingCompleted: true
      },
      {
        id: 'section_4',
        name: 'South Enclosure',
        completedAt: '09:20',
        notes: 'Light cycles adjusted',
        animalsChecked: 3,
        feedingCompleted: true
      }
    ],
    totalAnimalsChecked: 14,
    issuesCount: 1,
    issuesReported: [
      {
        animalId: 'animal_089',
        type: 'temperature_issue',
        description: 'Heating lamp malfunction in Central Habitat',
        severity: 'high',
        reportedAt: new Date('2026-06-24T08:45:00'),
        resolution: 'Lamp replaced, temperature restored to normal'
      }
    ],
    notes: 'Morning round with one equipment issue - resolved quickly.',
    createdAt: new Date('2026-06-24T07:00:00'),
    updatedAt: new Date('2026-06-24T09:45:00')
  }
]

async function seedDatabase() {
  try {
    console.log('Starting to seed roundsHistory collection...')

    let count = 0

    for (const roundData of sampleRoundsHistory) {
      await addDoc(collection(db, 'roundsHistory'), {
        ...roundData,
        createdAt: Timestamp.fromDate(roundData.createdAt),
        updatedAt: Timestamp.fromDate(roundData.updatedAt),
      })
      count++
      console.log(`Added round history record ${count}/${sampleRoundsHistory.length} - ${roundData.volunteerName} (${roundData.date})`)
    }

    console.log(`\nSuccessfully seeded ${count} rounds history records!`)
    process.exit(0)
  } catch (error) {
    console.error('Error seeding rounds history:', error)
    process.exit(1)
  }
}

seedDatabase()
