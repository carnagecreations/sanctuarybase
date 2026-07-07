/**
 * Admin data seeding utility for Firestore
 * Exports functions to seed biteReports and rounds collections
 *
 * Usage:
 * import { seedBiteReports, seedRounds } from '@/utils/seedAdminCollections'
 * await seedBiteReports()
 * await seedRounds()
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Bite Reports seed data
const biteReportsSeedData = [
  {
    animalId: 'animal-001',
    animalName: 'Venom',
    emoji: '🐍',
    personId: 'person-001',
    victim: 'Sarah Johnson',
    victimRole: 'Volunteer',
    date: '2026-06-25',
    description:
      'Ball python struck when hand was placed too quickly in enclosure during feeding.',
    severity: 'Minor',
    location: 'Front left leg',
    status: 'Pending',
    injuryDetails: 'Two small puncture marks, minimal bleeding',
    reportedAt: new Date('2026-06-25T14:30:00Z'),
    createdAt: new Date('2026-06-25T14:30:00Z'),
    witnesses: ['Michael Chen'],
    firstAidProvided: 'Cleaned with soap and water, applied bandage',
    medicalTreatmentRequired: false,
  },
  {
    animalId: 'animal-002',
    animalName: 'Spike',
    emoji: '🦎',
    personId: 'person-002',
    victim: 'James Wilson',
    victimRole: 'Staff',
    date: '2026-06-26',
    description: 'Bearded dragon bit finger during aggressive feeding response. Animal was stressed.',
    severity: 'Minor',
    location: 'Right index finger',
    status: 'Pending',
    injuryDetails: 'Shallow bite with slight bleeding, no infection signs',
    reportedAt: new Date('2026-06-26T10:15:00Z'),
    createdAt: new Date('2026-06-26T10:15:00Z'),
    witnesses: [],
    firstAidProvided: 'Antiseptic applied, bandaged',
    medicalTreatmentRequired: false,
  },
  {
    animalId: 'animal-003',
    animalName: 'Ruby',
    emoji: '🐢',
    personId: 'person-003',
    victim: 'Emily Rodriguez',
    victimRole: 'Volunteer',
    date: '2026-06-27',
    description:
      'Snapping turtle bit thumb while being transferred to new enclosure. Turtle was defensive.',
    severity: 'Moderate',
    location: 'Left thumb',
    status: 'Pending',
    injuryDetails: 'Deep puncture wound requiring 3 stitches at urgent care',
    reportedAt: new Date('2026-06-27T09:45:00Z'),
    createdAt: new Date('2026-06-27T09:45:00Z'),
    witnesses: ['Sarah Johnson', 'David Park'],
    firstAidProvided: 'Direct pressure applied for 10 minutes, wound cleaned, referred to urgent care',
    medicalTreatmentRequired: true,
    medicalFollowUp: 'Stitches removed 2026-07-04',
  },
  {
    animalId: 'animal-001',
    animalName: 'Venom',
    emoji: '🐍',
    personId: 'person-004',
    victim: 'Alexandra Torres',
    victimRole: 'Volunteer',
    date: '2026-05-15',
    description: 'Ball python defensive strike during handling. Handler moved too quickly past head.',
    severity: 'Minor',
    location: 'Right palm',
    status: 'Reviewed',
    injuryDetails: 'Two small puncture marks, no complications',
    reportedAt: new Date('2026-05-15T16:20:00Z'),
    createdAt: new Date('2026-05-15T16:20:00Z'),
    witnesses: ['Michael Chen'],
    firstAidProvided: 'Cleaned with soap and water, applied antibiotic ointment',
    medicalTreatmentRequired: false,
    reviewedAt: new Date('2026-05-16T10:00:00Z'),
    reviewedBy: 'admin@yumareptiles.com',
    reviewNotes: 'Preventable incident. Handler training recommended before future handling.',
  },
  {
    animalId: 'animal-004',
    animalName: 'Siam',
    emoji: '🐍',
    personId: 'person-005',
    victim: 'Christopher Lee',
    victimRole: 'Staff',
    date: '2026-04-10',
    description: 'King cobra struck during routine tank cleaning. Animal was provoked by movement.',
    severity: 'High',
    location: 'Left forearm',
    status: 'Reviewed',
    injuryDetails: 'Severe puncture wounds, swelling and bruising. Treated with antivenin at hospital.',
    reportedAt: new Date('2026-04-10T13:00:00Z'),
    createdAt: new Date('2026-04-10T13:00:00Z'),
    witnesses: ['Sarah Johnson', 'Michael Chen', 'David Park'],
    firstAidProvided: 'Immobilized limb, ice applied, emergency transport to hospital',
    medicalTreatmentRequired: true,
    medicalFollowUp: 'Hospitalized for 3 days, antivenin administered, full recovery',
    reviewedAt: new Date('2026-04-15T14:30:00Z'),
    reviewedBy: 'admin@yumareptiles.com',
    reviewNotes: 'Serious incident. Protocol breach identified. Enhanced safety procedures implemented.',
  },
];

// Rounds seed data (4 morning rounds)
const roundsSeedData = [
  {
    type: 'morning',
    date: '2026-06-28',
    startTime: '08:00',
    endTime: '10:30',
    assignedTo: 'Sarah Johnson',
    status: 'Completed',
    notes: 'All feeding stations restocked. Water changed in 12 enclosures.',
    animals: [
      { id: 'animal-001', name: 'Venom', type: 'Ball Python', feedingStatus: 'Fed' },
      { id: 'animal-002', name: 'Spike', type: 'Bearded Dragon', feedingStatus: 'Fed' },
      { id: 'animal-003', name: 'Ruby', type: 'Snapping Turtle', feedingStatus: 'Offered' },
    ],
    createdAt: new Date('2026-06-28T08:00:00Z'),
    completedAt: new Date('2026-06-28T10:30:00Z'),
  },
  {
    type: 'morning',
    date: '2026-06-27',
    startTime: '08:00',
    endTime: '10:15',
    assignedTo: 'Michael Chen',
    status: 'Completed',
    notes: 'Emergency feeding for two animals. One animal showed stress response.',
    animals: [
      { id: 'animal-004', name: 'Siam', type: 'King Cobra', feedingStatus: 'Fed' },
      { id: 'animal-005', name: 'Scout', type: 'Corn Snake', feedingStatus: 'Fed' },
    ],
    createdAt: new Date('2026-06-27T08:00:00Z'),
    completedAt: new Date('2026-06-27T10:15:00Z'),
  },
  {
    type: 'morning',
    date: '2026-06-26',
    startTime: '08:00',
    endTime: '10:45',
    assignedTo: 'David Park',
    status: 'Completed',
    notes: 'Regular morning round. All animals healthy and responsive.',
    animals: [
      { id: 'animal-001', name: 'Venom', type: 'Ball Python', feedingStatus: 'Fed' },
      { id: 'animal-006', name: 'Luna', type: 'Boa Constrictor', feedingStatus: 'Fed' },
      { id: 'animal-007', name: 'Ziggy', type: 'Leopard Gecko', feedingStatus: 'Fed' },
      { id: 'animal-002', name: 'Spike', type: 'Bearded Dragon', feedingStatus: 'Offered' },
    ],
    createdAt: new Date('2026-06-26T08:00:00Z'),
    completedAt: new Date('2026-06-26T10:45:00Z'),
  },
  {
    type: 'morning',
    date: '2026-06-25',
    startTime: '08:00',
    endTime: '10:20',
    assignedTo: 'Emily Rodriguez',
    status: 'Completed',
    notes: 'Morning round completed. Noted abnormal behavior in enclosure 7.',
    animals: [
      { id: 'animal-003', name: 'Ruby', type: 'Snapping Turtle', feedingStatus: 'Fed' },
      { id: 'animal-008', name: 'Hunter', type: 'Reticulated Python', feedingStatus: 'Skipped' },
    ],
    createdAt: new Date('2026-06-25T08:00:00Z'),
    completedAt: new Date('2026-06-25T10:20:00Z'),
  },
];

/**
 * Seed the biteReports collection with 5 realistic bite reports
 * @returns {Promise<Array>} Array of created document IDs
 */
export async function seedBiteReports() {
  try {
    const results = [];

    for (const report of biteReportsSeedData) {
      const docRef = await addDoc(collection(db, 'biteReports'), report);
      results.push({
        id: docRef.id,
        animalName: report.animalName,
        status: report.status,
      });
    }

    return results;
  } catch (error) {
    console.error('Error seeding bite reports:', error.message);
    throw error;
  }
}

/**
 * Seed the rounds collection with 4 morning rounds
 * @returns {Promise<Array>} Array of created document IDs
 */
export async function seedRounds() {
  try {
    const results = [];

    for (const round of roundsSeedData) {
      const docRef = await addDoc(collection(db, 'rounds'), round);
      results.push({
        id: docRef.id,
        date: round.date,
        assignedTo: round.assignedTo,
        status: round.status,
      });
    }

    return results;
  } catch (error) {
    console.error('Error seeding rounds:', error.message);
    throw error;
  }
}

/**
 * Seed both collections in sequence
 * @returns {Promise<Object>} Object with biteReports and rounds results
 */
export async function seedAllAdminCollections() {
  try {
    const biteReportsResults = await seedBiteReports();
    const roundsResults = await seedRounds();

    return {
      biteReports: biteReportsResults,
      rounds: roundsResults,
    };
  } catch (error) {
    console.error('Error during admin collection seeding:', error.message);
    throw error;
  }
}
