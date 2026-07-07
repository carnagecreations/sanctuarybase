/**
 * Utility to seed bite report data to Firestore
 * This can be called from the browser console or integrated into a component
 *
 * Usage in browser console:
 * import { seedBiteReports } from '@/utils/seedBiteReports'
 * seedBiteReports()
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const biteReportSeedData = [
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

/**
 * Seed the biteReports collection with sample data
 */
export async function seedBiteReports() {
  try {
    const results = [];

    for (const report of biteReportSeedData) {
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
 * Clear all bite reports from the collection
 * Use with caution!
 */
export async function clearBiteReports() {
  try {
    console.warn('Clearing all bite reports...');
    // This would require additional implementation to batch delete
    // For now, recommend manual deletion through Firebase Console
    console.warn('Please delete documents manually through Firebase Console');
  } catch (error) {
    console.error('Error clearing bite reports:', error.message);
    throw error;
  }
}
