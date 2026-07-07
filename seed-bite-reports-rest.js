/**
 * Seed script for bite reports using Firebase REST API
 * Run with: node seed-bite-reports-rest.js
 *
 * This method uses the Firebase REST API and doesn't require Admin SDK
 */

const https = require('https');

const FIREBASE_PROJECT_ID = 'sanctuarybasev2';
const FIRESTORE_API_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Sample bite report data
const biteReports = [
  {
    animalId: 'animal-001',
    animalName: 'Venom',
    emoji: '🐍',
    personId: 'person-001',
    victim: 'Sarah Johnson',
    victimRole: 'Volunteer',
    date: '2026-06-25',
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
 * Convert a JavaScript value to Firestore Value format
 */
function toFirestoreValue(value) {
  if (value === null) {
    return { nullValue: null };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return { integerValue: value.toString() };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue),
      },
    };
  }

  if (typeof value === 'object') {
    const fields = {};
    for (const [key, val] of Object.entries(value)) {
      fields[key] = toFirestoreValue(val);
    }
    return { mapValue: { fields } };
  }

  return { stringValue: String(value) };
}

/**
 * Make an HTTPS POST request to Firestore
 */
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(FIRESTORE_API_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data)),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function seedBiteReports() {
  try {
    console.log('Starting to seed bite reports using REST API...');
    console.log('Note: This requires Firestore security rules to allow unauthenticated writes.\n');

    for (const report of biteReports) {
      const document = {
        fields: {},
      };

      for (const [key, value] of Object.entries(report)) {
        document.fields[key] = toFirestoreValue(value);
      }

      try {
        const result = await makeRequest('/biteReports', { fields: document.fields });
        console.log(`Created bite report: ${report.animalName} (${report.status})`);
      } catch (error) {
        console.error(
          `Failed to create bite report for ${report.animalName}:`,
          error.message,
        );
      }
    }

    console.log(`\nFinished seeding bite reports!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bite reports:', error);
    process.exit(1);
  }
}

seedBiteReports();
