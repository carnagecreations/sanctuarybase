/**
 * Seed script for bite reports collection
 * Run with: node functions/seed-bite-reports.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../.firebase/serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'sanctuarybasev2',
  });
} catch (error) {
  console.error('Service account key not found. Using default credentials...');
  admin.initializeApp({
    projectId: 'sanctuarybasev2',
  });
}

const db = admin.firestore();

// Sample bite report data
const biteReports = [
  {
    animalId: 'animal-001',
    animalName: 'Venom',
    emoji: '🐍',
    personId: 'person-001',
    victimName: 'Sarah Johnson',
    victimRole: 'Volunteer',
    description: 'Ball python struck when hand was placed too quickly in enclosure during feeding.',
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
    victimName: 'James Wilson',
    victimRole: 'Staff',
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
    victimName: 'Emily Rodriguez',
    victimRole: 'Volunteer',
    description: 'Snapping turtle bit thumb while being transferred to new enclosure. Turtle was defensive.',
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
    victimName: 'Alexandra Torres',
    victimRole: 'Volunteer',
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
    victimName: 'Christopher Lee',
    victimRole: 'Staff',
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

async function seedBiteReports() {
  try {
    console.log('Starting to seed bite reports...');

    for (const report of biteReports) {
      const docRef = await db.collection('biteReports').add(report);
      console.log(`Created bite report: ${docRef.id} - ${report.animalName} (${report.status})`);
    }

    console.log(`\nSuccessfully seeded ${biteReports.length} bite reports!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bite reports:', error);
    process.exit(1);
  }
}

seedBiteReports();
