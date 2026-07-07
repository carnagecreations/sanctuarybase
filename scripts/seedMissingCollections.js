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

// Sample animals for reference
const sampleAnimals = [
  { id: 'ball-python-1', name: 'Monty', species: 'Ball Python' },
  { id: 'corn-snake-1', name: 'Saffron', species: 'Corn Snake' },
  { id: 'king-cobra-1', name: 'Raja', species: 'King Cobra' },
  { id: 'bearded-dragon-1', name: 'Spike', species: 'Bearded Dragon' },
  { id: 'boa-constrictor-1', name: 'Kaa', species: 'Boa Constrictor' },
]

// Sample staff/volunteers
const staffMembers = [
  'Sarah Martinez',
  'James Chen',
  'Emma Rodriguez',
  'Marcus Johnson',
  'Lisa Thompson',
  'David Kim',
]

const locations = [
  'Section A - Pythons & Boas',
  'Section B - Lizards',
  'Section C - Herpetology Lab',
  'Quarantine Area',
  'Educational Enclosures',
]

const severities = ['Minor', 'Moderate', 'Severe']

// ===== BITE REPORTS DATA =====
const biteReportsData = [
  {
    animalId: 'king-cobra-1',
    animalName: 'Raja',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
    location: 'Section A - Pythons & Boas',
    severity: 'Moderate',
    biteDescription: 'Raja struck during feeding. Bite occurred on right forearm.',
    reportedBy: 'David Kim',
    injuries: 'Two puncture marks on right forearm, minor bleeding, swelling developing',
    treatment: 'Wound cleaned with antiseptic, bandaged. Tetanus status verified. Observed for infection.',
    followUp: 'Monitor for signs of infection. Seek medical attention if swelling or redness increases.',
    notes: 'Raja has shown defensive behavior during feeding time. Feeding protocol adjusted - will use longer feeding tongs.',
    status: 'Reviewed',
    personId: 'person-david-kim',
  },
  {
    animalId: 'corn-snake-1',
    animalName: 'Saffron',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
    location: 'Educational Enclosures',
    severity: 'Minor',
    biteDescription: 'Saffron bit handler during educational demonstration. Bite on left hand.',
    reportedBy: 'Sarah Martinez',
    injuries: 'Small puncture marks on left hand (pinky and ring finger), minimal bleeding',
    treatment: 'Washed with soap and water, applied antibiotic ointment and band-aid.',
    followUp: 'No follow-up needed. Minor wound.',
    notes: 'Saffron may have mistaken gloved hand for prey. Handler used improper handling technique. Educational session paused to reinforce safe handling protocols.',
    status: 'Reviewed',
    personId: 'person-sarah-martinez',
  },
  {
    animalId: 'ball-python-1',
    animalName: 'Monty',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    location: 'Section A - Pythons & Boas',
    severity: 'Minor',
    biteDescription: 'Monty bit handler during routine enclosure cleaning. Contact on thumb.',
    reportedBy: 'James Chen',
    injuries: 'Single puncture mark on left thumb, minimal bleeding',
    treatment: 'Wound cleaned and covered with adhesive bandage. No further treatment needed.',
    followUp: 'Monitor for infection signs.',
    notes: 'Monty may have been startled during cleaning. Handler working to avoid bites by pre-feeding before enclosure maintenance.',
    status: 'Pending',
    personId: 'person-james-chen',
  },
  {
    animalId: 'bearded-dragon-1',
    animalName: 'Spike',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    location: 'Quarantine Area',
    severity: 'Minor',
    biteDescription: 'Spike nipped handler on index finger during health check.',
    reportedBy: 'Emma Rodriguez',
    injuries: 'Small abrasion on index finger, no bleeding',
    treatment: 'Cleaned with antiseptic wipe, no bandage needed.',
    followUp: 'Continue monitoring Spike for aggressive behavior.',
    notes: 'Spike has been showing signs of stress since transfer to quarantine. May be related to environmental changes. Enrichment items added to enclosure.',
    status: 'Reviewed',
    personId: 'person-emma-rodriguez',
  },
  {
    animalId: 'boa-constrictor-1',
    animalName: 'Kaa',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
    location: 'Section A - Pythons & Boas',
    severity: 'Severe',
    biteDescription: 'Kaa struck and bit handler multiple times during feeding. Severe bite on palm and wrist.',
    reportedBy: 'Marcus Johnson',
    injuries: 'Multiple puncture wounds on right palm and wrist, significant bleeding, swelling developing',
    treatment: 'Immediate wound cleaning with antiseptic solution, multiple bandages applied. Tetanus status updated. Received urgent care evaluation for proper wound closure assessment.',
    followUp: 'Follow up with physician in 24-48 hours. Seek immediate medical attention if increased swelling, redness, warmth, or signs of infection develop. Consider rabies post-exposure prophylaxis consultation.',
    notes: 'Kaa exhibited predatory strike behavior. May have been overly hungry or stressed. Feeding protocol under review. Handler did excellent job minimizing injury by quickly withdrawing hand. Feeding will be suspended for 3 days, then resumed with extreme caution using feeding box method.',
    status: 'Pending',
    personId: 'person-marcus-johnson',
  },
]


// ===== SEEDING FUNCTION =====
async function seedCollections() {
  try {
    console.log('Starting to seed missing collections...\n')

    // Seed biteReports collection
    console.log('Seeding biteReports collection...')
    const biteReportsCollection = collection(db, 'biteReports')
    let biteReportsCount = 0

    for (const report of biteReportsData) {
      const docRef = await addDoc(biteReportsCollection, {
        ...report,
        reportedAt: new Date(report.date),
        createdAt: new Date(),
      })
      biteReportsCount++
      console.log(
        `  [${biteReportsCount}] Added bite report: ${report.animalName} - ${report.severity} (${report.date})`
      )
    }

    console.log(`\nSuccessfully seeded ${biteReportsCount} bite reports!\n`)

    console.log('===== SEEDING COMPLETE =====')
    console.log(`Total bite reports: ${biteReportsCount}`)
    console.log('\nCollections are now populated with realistic sanctuary data.')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding collections:', error)
    process.exit(1)
  }
}

seedCollections()
