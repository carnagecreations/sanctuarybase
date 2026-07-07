/**
 * Utility to seed message data to Firestore
 * Populates the 'messages' collection with realistic sanctuary team messages
 *
 * Usage in browser console:
 * import { seedMessages } from '@/utils/seedMessages'
 * seedMessages()
 */

import { collection, addDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

// Sample volunteer IDs to randomly select from
const SAMPLE_VOLUNTEER_IDS = [
  'vol-001',
  'vol-002',
  'vol-003',
  'vol-004',
  'vol-005',
  'vol-006',
  'vol-007',
  'vol-008'
]

/**
 * Get a random subset of volunteer IDs
 * @param {number} min - Minimum number of IDs
 * @param {number} max - Maximum number of IDs
 * @returns {Array} Array of random volunteer IDs
 */
function getRandomVolunteers(min = 1, max = 4) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...SAMPLE_VOLUNTEER_IDS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Get a date relative to today
 * @param {number} daysAgo - Number of days ago
 * @returns {Date} Date object
 */
function getDateDaysAgo(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

export const messageSeedData = [
  {
    text: 'Good morning team! Remember morning rounds start at 7:30 AM. Please check water temperatures and feeding schedules for the pythons section.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(0),
    recipientType: 'all',
    recipients: getRandomVolunteers(3, 5),
    read: false
  },
  {
    text: 'URGENT: We need coverage for the afternoon shift today (3 PM - 7 PM). Anyone available? Please let me know ASAP.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(0),
    recipientType: 'online',
    recipients: getRandomVolunteers(2, 4),
    read: false
  },
  {
    text: 'Health Update: Ruby (Corn Snake) is recovering well from her respiratory treatment. Continue monitoring for any breathing changes. Dr. Chen will check in on Thursday.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(1),
    recipientType: 'specific',
    recipients: getRandomVolunteers(1, 3),
    read: false
  },
  {
    text: 'Follow-up: Did everyone get a chance to review the new handling protocols I shared yesterday? Please confirm you\'ve reviewed them by end of day.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(1),
    recipientType: 'all',
    recipients: getRandomVolunteers(4, 6),
    read: false
  },
  {
    text: 'Feeding reminder: The ball pythons in enclosure 3-5 are on a feeding schedule every 5 days. Last fed on June 25. Next feeding due June 30. Do NOT skip.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(2),
    recipientType: 'specific',
    recipients: getRandomVolunteers(2, 3),
    read: false
  },
  {
    text: 'Great work on EOD reports this week, team! The documentation has been excellent. Keep up the attention to detail.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(2),
    recipientType: 'all',
    recipients: getRandomVolunteers(3, 5),
    read: false
  },
  {
    text: 'Announcement: We have a new arrival - a juvenile bearded dragon (Sunny). Please DO NOT handle until full health assessment is complete. Assessment scheduled for tomorrow at 10 AM.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(3),
    recipientType: 'all',
    recipients: getRandomVolunteers(5, 8),
    read: false
  },
  {
    text: 're: Equipment maintenance - The heat lamp in Section 2 needs replacement. Ordered new bulb and should arrive by Friday. Please monitor temperature logs until then.',
    sentBy: 'admin@yumareptiles.com',
    sentAt: getDateDaysAgo(3),
    recipientType: 'specific',
    recipients: getRandomVolunteers(1, 2),
    read: false
  }
]

/**
 * Seed the messages collection with sample data
 * @returns {Promise<Array>} Array of created message IDs and metadata
 */
export async function seedMessages() {
  try {
    const results = []

    for (const message of messageSeedData) {
      const docRef = await addDoc(collection(db, 'messages'), message)
      results.push({
        id: docRef.id,
        preview: message.text.substring(0, 50) + '...',
        recipients: message.recipients.length
      })
    }

    return results
  } catch (error) {
    console.error('Error seeding messages:', error.message)
    throw error
  }
}

/**
 * Get sample messages data without writing to Firestore
 * Useful for testing or preview purposes
 * @returns {Array} Sample messages data
 */
export function getSampleMessagesData() {
  return messageSeedData
}
