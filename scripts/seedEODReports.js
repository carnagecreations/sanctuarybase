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

const eodReportsSampleData = [
  {
    animalsFed: '24/24',
    medsGiven: 8,
    volunteersCount: 5,
    status: 'submitted',
    notes: 'All animals fed and hydrated successfully. Bernard the snake was particularly active. Two volunteers helped with cleaning after feeding.',
    issues: [
      {
        id: '1',
        animal: 'Bernard (Ball Python)',
        issue: 'Slightly reduced appetite, ate 3/4 of usual portion',
        priority: 'med'
      },
      {
        id: '2',
        animal: 'Corn Snake - Red',
        issue: 'Shed skin observed, monitor for completion',
        priority: 'low'
      }
    ],
    createdAt: Timestamp.fromDate(new Date('2026-06-27T18:30:00Z'))
  },
  {
    animalsFed: '23/24',
    medsGiven: 10,
    volunteersCount: 6,
    status: 'submitted',
    notes: 'Good day overall. All meds administered on schedule. One reptile was skipped due to recent stress - will monitor tomorrow.',
    issues: [
      {
        id: '1',
        animal: 'Green Iguana - Raja',
        issue: 'Refusing food, displaying lethargy',
        priority: 'high'
      },
      {
        id: '2',
        animal: 'Bearded Dragon - Spike',
        issue: 'Minor scale discoloration on tail',
        priority: 'med'
      },
      {
        id: '3',
        animal: 'Garter Snake - Ziggy',
        issue: 'Water bowl soiled earlier, replaced',
        priority: 'low'
      }
    ],
    createdAt: Timestamp.fromDate(new Date('2026-06-26T19:00:00Z'))
  },
  {
    animalsFed: '24/24',
    medsGiven: 7,
    volunteersCount: 4,
    status: 'submitted',
    notes: 'Successful feeding day with no issues. Volunteers completed all daily tasks efficiently. Enclosure temperatures checked and verified.',
    issues: [],
    createdAt: Timestamp.fromDate(new Date('2026-06-25T17:45:00Z'))
  },
  {
    animalsFed: '22/24',
    medsGiven: 9,
    volunteersCount: 5,
    status: 'submitted',
    notes: 'Two animals had to be skipped due to aggressive behavior. Will attempt feeding again in AM. All meds given to remaining animals.',
    issues: [
      {
        id: '1',
        animal: 'King Cobra - Kasha',
        issue: 'Aggressive strike posture, skipped feeding',
        priority: 'high'
      },
      {
        id: '2',
        animal: 'Reticulated Python - Rey',
        issue: 'Striking at feeder, moved to separate enclosure',
        priority: 'high'
      },
      {
        id: '3',
        animal: 'Corn Snake - Orange',
        issue: 'Shedding cycle ongoing, minimal food intake expected',
        priority: 'low'
      }
    ],
    createdAt: Timestamp.fromDate(new Date('2026-06-24T18:15:00Z'))
  },
  {
    animalsFed: '24/24',
    medsGiven: 6,
    volunteersCount: 3,
    status: 'submitted',
    notes: 'Smooth operations. New volunteer completed first full shift successfully. All animals healthy and feeding normally.',
    issues: [
      {
        id: '1',
        animal: 'Blue Tongue Skink - Bluey',
        issue: 'Due for scale soak tomorrow',
        priority: 'low'
      }
    ],
    createdAt: Timestamp.fromDate(new Date('2026-06-23T18:00:00Z'))
  }
]

async function seedEODReports() {
  try {
    console.log('Starting to seed EOD Reports...')

    const collectionRef = collection(db, 'eodReports')

    for (const reportData of eodReportsSampleData) {
      const docRef = await addDoc(collectionRef, reportData)
      console.log(`Created EOD Report: ${docRef.id}`)
    }

    console.log(`Successfully seeded ${eodReportsSampleData.length} EOD Reports!`)
    process.exit(0)
  } catch (error) {
    console.error('Error seeding EOD Reports:', error)
    process.exit(1)
  }
}

seedEODReports()
