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

// Sample medication run data
const seedMedRuns = [
  {
    date: new Date('2024-06-27'),
    startTime: '08:00 AM',
    endTime: '10:30 AM',
    givenBy: 'Sarah Johnson',
    status: 'completed',
    medications: [
      {
        animalId: 'gecko_001',
        animalName: 'Leonardo',
        emoji: '🦎',
        medications: [
          {
            name: 'Doxycycline',
            dose: '50mg',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Give with food'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-27T08:15:00')
      },
      {
        animalId: 'python_001',
        animalName: 'Monty',
        emoji: '🐍',
        medications: [
          {
            name: 'Meloxicam',
            dose: '0.5ml',
            frequency: 'Once daily',
            route: 'Oral',
            notes: 'For pain management'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-27T08:45:00')
      },
      {
        animalId: 'bearded_dragon_001',
        animalName: 'Spike',
        emoji: '🦎',
        medications: [
          {
            name: 'Calcium supplement',
            dose: '2ml',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Dusted on food'
          },
          {
            name: 'Vitamin A',
            dose: '500 IU',
            frequency: 'Every other day',
            route: 'Topical',
            notes: null
          }
        ],
        given: true,
        givenAt: new Date('2024-06-27T09:30:00')
      }
    ],
    notes: 'All animals treated successfully. Leonardo showed improvement in appetite.'
  },
  {
    date: new Date('2024-06-28'),
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    givenBy: 'Mike Chen',
    status: 'completed',
    medications: [
      {
        animalId: 'gecko_001',
        animalName: 'Leonardo',
        emoji: '🦎',
        medications: [
          {
            name: 'Doxycycline',
            dose: '50mg',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Give with food'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-28T08:20:00')
      },
      {
        animalId: 'python_001',
        animalName: 'Monty',
        emoji: '🐍',
        medications: [
          {
            name: 'Meloxicam',
            dose: '0.5ml',
            frequency: 'Once daily',
            route: 'Oral',
            notes: 'For pain management'
          },
          {
            name: 'Antibiotic injection',
            dose: '2ml',
            frequency: 'Every 48 hours',
            route: 'Injection',
            notes: 'IM injection in upper arm'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-28T08:50:00')
      },
      {
        animalId: 'corn_snake_001',
        animalName: 'Ember',
        emoji: '🐍',
        medications: [
          {
            name: 'Antifungal cream',
            dose: '1ml',
            frequency: 'Once daily',
            route: 'Topical',
            notes: 'Apply to affected scales'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-28T09:10:00')
      },
      {
        animalId: 'bearded_dragon_001',
        animalName: 'Spike',
        emoji: '🦎',
        medications: [
          {
            name: 'Calcium supplement',
            dose: '2ml',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Dusted on food'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-28T10:15:00')
      }
    ],
    notes: 'Routine med run. Monty received additional antibiotic injection. No complications.'
  },
  {
    date: new Date('2024-06-29'),
    startTime: '07:30 AM',
    endTime: '09:45 AM',
    givenBy: 'Dr. Patricia Martinez',
    status: 'completed',
    medications: [
      {
        animalId: 'gecko_001',
        animalName: 'Leonardo',
        emoji: '🦎',
        medications: [
          {
            name: 'Doxycycline',
            dose: '50mg',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Give with food'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-29T07:45:00')
      },
      {
        animalId: 'leopard_gecko_001',
        animalName: 'Blaze',
        emoji: '🦎',
        medications: [
          {
            name: 'Moxidectin',
            dose: '1ml',
            frequency: 'Once',
            route: 'Oral',
            notes: 'Parasite treatment - do not repeat for 14 days'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-29T08:00:00')
      },
      {
        animalId: 'python_001',
        animalName: 'Monty',
        emoji: '🐍',
        medications: [
          {
            name: 'Meloxicam',
            dose: '0.5ml',
            frequency: 'Once daily',
            route: 'Oral',
            notes: 'For pain management'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-29T08:30:00')
      },
      {
        animalId: 'bearded_dragon_001',
        animalName: 'Spike',
        emoji: '🦎',
        medications: [
          {
            name: 'Calcium supplement',
            dose: '2ml',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Dusted on food'
          },
          {
            name: 'B-complex vitamin',
            dose: '0.5ml',
            frequency: 'Once weekly',
            route: 'Oral',
            notes: null
          }
        ],
        given: true,
        givenAt: new Date('2024-06-29T09:00:00')
      }
    ],
    notes: 'Blaze received parasite treatment. All animals responded well. Monitor for any behavioral changes.'
  },
  {
    date: new Date('2024-06-30'),
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    givenBy: 'Sarah Johnson',
    status: 'in-progress',
    medications: [
      {
        animalId: 'gecko_001',
        animalName: 'Leonardo',
        emoji: '🦎',
        medications: [
          {
            name: 'Doxycycline',
            dose: '50mg',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Give with food'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-30T08:10:00')
      },
      {
        animalId: 'ball_python_001',
        animalName: 'Slinky',
        emoji: '🐍',
        medications: [
          {
            name: 'Herpesvirus treatment',
            dose: '3ml',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Recent respiratory infection - critical care'
          }
        ],
        given: true,
        givenAt: new Date('2024-06-30T08:35:00')
      },
      {
        animalId: 'bearded_dragon_001',
        animalName: 'Spike',
        emoji: '🦎',
        medications: [
          {
            name: 'Calcium supplement',
            dose: '2ml',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Dusted on food'
          }
        ],
        given: false,
        givenAt: null
      }
    ],
    notes: 'Slinky received herpesvirus treatment. Still pending medication for Spike.'
  },
  {
    date: new Date('2024-07-01'),
    startTime: '08:00 AM',
    endTime: null,
    givenBy: null,
    status: 'pending',
    medications: [
      {
        animalId: 'gecko_001',
        animalName: 'Leonardo',
        emoji: '🦎',
        medications: [
          {
            name: 'Doxycycline',
            dose: '50mg',
            frequency: 'Twice daily',
            route: 'Oral',
            notes: 'Give with food'
          }
        ],
        given: false,
        givenAt: null
      },
      {
        animalId: 'python_001',
        animalName: 'Monty',
        emoji: '🐍',
        medications: [
          {
            name: 'Meloxicam',
            dose: '0.5ml',
            frequency: 'Once daily',
            route: 'Oral',
            notes: 'For pain management'
          }
        ],
        given: false,
        givenAt: null
      },
      {
        animalId: 'corn_snake_001',
        animalName: 'Ember',
        emoji: '🐍',
        medications: [
          {
            name: 'Antifungal cream',
            dose: '1ml',
            frequency: 'Once daily',
            route: 'Topical',
            notes: 'Apply to affected scales'
          }
        ],
        given: false,
        givenAt: null
      }
    ],
    notes: 'Scheduled for today. Awaiting staff availability.'
  }
];

async function seedDatabase() {
  try {
    console.log('Starting to seed medRuns collection...');

    let count = 0;

    for (const medRun of seedMedRuns) {
      await addDoc(collection(db, 'medRuns'), {
        ...medRun,
        createdAt: Timestamp.fromDate(medRun.date),
        updatedAt: Timestamp.fromDate(new Date()),
      });
      count++;
      console.log(`Added medication run ${count}/${seedMedRuns.length}`);
    }

    console.log(`Successfully seeded ${count} medication run records!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
