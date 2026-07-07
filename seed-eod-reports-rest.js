/**
 * Seed script for EOD Reports using Firebase REST API
 * Run with: node seed-eod-reports-rest.js
 *
 * This method uses the Firebase REST API and doesn't require Admin SDK
 */

import https from 'https';
import { URL } from 'url';

const FIREBASE_PROJECT_ID = 'sanctuarybasev2';
const FIRESTORE_API_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Sample EOD report data
const eodReports = [
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
    createdAt: new Date('2026-06-27T18:30:00Z')
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
    createdAt: new Date('2026-06-26T19:00:00Z')
  },
  {
    animalsFed: '24/24',
    medsGiven: 7,
    volunteersCount: 4,
    status: 'submitted',
    notes: 'Successful feeding day with no issues. Volunteers completed all daily tasks efficiently. Enclosure temperatures checked and verified.',
    issues: [],
    createdAt: new Date('2026-06-25T17:45:00Z')
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
    createdAt: new Date('2026-06-24T18:15:00Z')
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
    createdAt: new Date('2026-06-23T18:00:00Z')
  }
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

async function seedEODReports() {
  try {
    console.log('Starting to seed EOD Reports using REST API...');
    console.log('Note: This requires Firestore security rules to allow unauthenticated writes.\n');

    for (const report of eodReports) {
      const document = {
        fields: {},
      };

      for (const [key, value] of Object.entries(report)) {
        document.fields[key] = toFirestoreValue(value);
      }

      try {
        const result = await makeRequest('/eodReports', { fields: document.fields });
        console.log(`Created EOD Report: ${report.animalsFed} animals fed on ${new Date(report.createdAt).toDateString()}`);
      } catch (error) {
        console.error(
          `Failed to create EOD Report:`,
          error.message,
        );
      }
    }

    console.log(`\nFinished seeding ${eodReports.length} EOD Reports!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding EOD Reports:', error);
    process.exit(1);
  }
}

seedEODReports();
