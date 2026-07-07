import { collection, addDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

const outcomesData = [
  {
    animalName: 'Luna',
    breed: 'Labrador Retriever',
    species: 'dog',
    type: 'dog',
    intakeDate: '2025-12-15',
    outcomeDate: '2026-01-20',
    outcome: 'adoption',
    destination: 'Smith Family',
    reason: 'Successful training completion',
    notes: 'Luna was brought in as a stray and required behavioral training. After 5 weeks of rehabilitation, she was adopted by a loving family.',
    intakeCondition: 'good',
    outcomeBehavior: 'excellent',
  },
  {
    animalName: 'Whiskers',
    breed: 'Maine Coon Mix',
    species: 'cat',
    type: 'cat',
    intakeDate: '2025-11-08',
    outcomeDate: '2026-01-15',
    outcome: 'transfer',
    destination: 'Feline Rescue Center',
    reason: 'Special needs - requires foster home',
    notes: 'Whiskers required ongoing medical care for chronic respiratory condition. Transferred to specialized feline rescue for appropriate care.',
    intakeCondition: 'fair',
    outcomeBehavior: 'good',
  },
  {
    animalName: 'Max',
    breed: 'German Shepherd',
    species: 'dog',
    type: 'dog',
    intakeDate: '2026-01-05',
    outcomeDate: '2026-01-18',
    outcome: 'return',
    destination: 'Original Owner',
    reason: 'Owner located and contacted',
    notes: 'Max was microchipped and owner was located through database. Returned to original owner who was overjoyed to be reunited.',
    intakeCondition: 'good',
    outcomeBehavior: 'excellent',
  },
  {
    animalName: 'Shadow',
    breed: 'Mixed Domestic Shorthair',
    species: 'cat',
    type: 'cat',
    intakeDate: '2025-10-20',
    outcomeDate: '2025-12-30',
    outcome: 'adoption',
    destination: 'Johnson Household',
    reason: 'Behavioral assessment passed',
    notes: 'Shadow came in as a frightened street cat. Through patient socialization over 10 weeks, developed excellent temperament. Adopted to indoor-only home.',
    intakeCondition: 'fair',
    outcomeBehavior: 'good',
  },
  {
    animalName: 'Buddy',
    breed: 'Beagle Mix',
    species: 'dog',
    type: 'dog',
    intakeDate: '2025-09-10',
    outcomeDate: '2025-11-15',
    outcome: 'deceased',
    destination: 'N/A',
    reason: 'End of life - advanced illness',
    notes: 'Buddy was a senior dog with untreatable cancer. Sanctuary provided comfort care and humane euthanasia to minimize suffering.',
    intakeCondition: 'poor',
    outcomeBehavior: 'excellent',
  },
]

/**
 * Seed the outcomes collection with sample data
 * Call this function from the browser console or a Vue component
 */
export async function seedOutcomes() {
  try {
    for (const outcome of outcomesData) {
      await addDoc(collection(db, 'outcomes'), {
        ...outcome,
        createdAt: new Date().toISOString(),
      })
    }

    return { success: true, count: outcomesData.length }
  } catch (error) {
    console.error('Error seeding outcomes:', error)
    throw error
  }
}

/**
 * Get the sample outcomes data
 */
export function getOutcomesData() {
  return outcomesData
}
