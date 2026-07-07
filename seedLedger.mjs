import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

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

// Seed data: 5 realistic ledger entries for a reptile sanctuary
const sampleLedgerData = [
  {
    description: 'Heating lamp supplies and equipment',
    category: 'Supplies & Equipment',
    type: 'expense',
    amount: 245.50,
    createdAt: new Date('2026-06-20'),
    notes: 'UVB bulbs, heat tape, thermostats for enclosures'
  },
  {
    description: 'Monthly food donation from community',
    category: 'Donations',
    type: 'income',
    amount: 500.00,
    createdAt: new Date('2026-06-18'),
    notes: 'Insects, frozen prey, fresh vegetables'
  },
  {
    description: 'Veterinary care - health checkups',
    category: 'Medical & Veterinary',
    type: 'expense',
    amount: 1200.00,
    createdAt: new Date('2026-06-15'),
    notes: 'Annual checkups for 8 animals, vaccination records updated'
  },
  {
    description: 'Grant received - Wildlife Conservation Fund',
    category: 'Grants & Funding',
    type: 'income',
    amount: 2500.00,
    createdAt: new Date('2026-06-10'),
    notes: 'Q2 wildlife rehabilitation grant'
  },
  {
    description: 'Enclosure renovation and maintenance',
    category: 'Facility Maintenance',
    type: 'expense',
    amount: 875.25,
    createdAt: new Date('2026-06-05'),
    notes: 'Glass cleaning, substrate replacement, structural repairs'
  }
]

async function seedLedger() {
  try {
    console.log('Starting ledger seeding...')
    const ledgersCollection = collection(db, 'ledgers')

    for (const entry of sampleLedgerData) {
      const docRef = await addDoc(ledgersCollection, entry)
      console.log(`Added ledger entry: ${entry.description} (ID: ${docRef.id})`)
    }

    console.log('Successfully seeded 5 ledger entries!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding ledger data:', error)
    process.exit(1)
  }
}

seedLedger()
