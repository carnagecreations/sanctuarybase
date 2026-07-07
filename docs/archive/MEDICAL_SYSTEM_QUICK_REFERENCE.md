# Medical System - Quick Reference

## Import & Usage

### In a Vue Component
```javascript
import { useMedicalRecordsStore } from '@/stores/medicalRecords'
import { useVaccinationsStore } from '@/stores/vaccinations'

const medicalStore = useMedicalRecordsStore()
const vaccStore = useVaccinationsStore()
```

## Common Operations

### Fetch Records for an Animal
```javascript
// Medical records
const records = await medicalStore.fetchByAnimalId('animalId123')

// Vaccinations
const vaccines = await vaccStore.fetchByAnimalId('animalId123')
```

### Add a Medical Record
```javascript
await medicalStore.addRecord({
  animalId: 'animalId123',
  description: 'Annual checkup',
  type: 'examination',
  veterinarian: 'Dr. Smith',
  date: new Date(),
  notes: 'All healthy',
  cost: 150
})
```

### Add a Vaccination
```javascript
await vaccStore.addVaccine({
  animalId: 'animalId123',
  vaccineName: 'FVRCP',
  dueDate: new Date('2024-03-05'),
  completedDate: new Date('2024-03-05'),
  nextDueDate: new Date('2025-03-05'),
  veterinarian: 'Dr. Chen',
  batchNumber: 'FVRCP-2024-001'
})
```

### Get Overdue Vaccines
```javascript
const overdue = await vaccStore.getOverdue('animalId123')
// Returns: array of vaccines with nextDueDate < today
```

### Get Vaccines Due Soon
```javascript
const dueSoon = await vaccStore.getDueSoon('animalId123', 30)
// Returns: array of vaccines due within 30 days
```

### Mark Vaccine Complete
```javascript
await vaccStore.markComplete(
  'vaccineDocId',
  new Date(),  // completedDate
  new Date('2025-06-05')  // nextDueDate
)
```

### Update a Record
```javascript
await medicalStore.updateRecord('recordId', {
  notes: 'Updated notes',
  cost: 200
})
```

### Delete a Record
```javascript
await medicalStore.deleteRecord('recordId')
await vaccStore.deleteVaccine('vaccineId')
```

## Record Types

For `type` field in medical records:
- `'vet visit'` 🏥
- `'diagnosis'` 📋
- `'treatment'` 💊
- `'examination'` 👀
- `'procedure'` 🔧
- `'vaccination'` 💉
- `'lab work'` 🔬

## Status Calculation

```javascript
// For vaccines
const getStatus = (vaccine) => {
  const nextDue = vaccine.nextDueDate || vaccine.dueDate
  const now = new Date()
  const dueDate = new Date(nextDue)
  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilDue = Math.floor((dueDate - now) / msPerDay)
  
  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= 30) return 'due-soon'
  return 'current'
}
```

## Firestore Collections

**animalMedical** - Medical records
- Fields: animalId, date, type, description, veterinarian, notes, cost, prescriptions, createdAt, updatedAt
- Indexed on: animalId, date (descending)

**vaccinations** - Vaccination records
- Fields: animalId, vaccineName, dueDate, completedDate, nextDueDate, veterinarian, batchNumber, createdAt, updatedAt
- Indexed on: animalId, dueDate (descending)

## Security Rules

```
match /animalMedical/{docId} {
  allow read: if isAuth();
  allow write: if isPrivileged();
}

match /vaccinations/{docId} {
  allow read: if isAuth();
  allow write: if isPrivileged();
}
```

- **isAuth()**: Any authenticated user
- **isPrivileged()**: Staff or Admin role

## Component Props

### MedsTab
```javascript
defineProps({
  animal: { type: Object, required: true }  // Must have 'id' property
})
```

### VaccinesTab
```javascript
defineProps({
  animal: { type: Object, required: true }  // Must have 'id' property
})
```

### ProfileTab
```javascript
defineProps({
  animal: { type: Object, required: true }  // Must have 'id' property
})
```

## Date Handling

### Convert to Firestore Timestamp
```javascript
// Automatic in store methods, but explicitly:
const date = new Date('2024-03-05')
// Store automatically converts to Timestamp

// Or use Firestore serverTimestamp()
import { serverTimestamp } from 'firebase/firestore'
serverTimestamp()
```

### Convert from Firestore Timestamp
```javascript
// Automatic in store methods, returns as Date object
const records = await medicalStore.fetchByAnimalId('animalId')
records[0].date  // Already a Date object

// Manual conversion if needed:
const date = firestoreTimestamp.toDate()
```

### Format for Display
```javascript
const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

formatDate(new Date('2024-03-05'))  // "Mar 05, 2024"
```

## Error Handling

```javascript
try {
  await medicalStore.addRecord({ ... })
} catch (error) {
  console.error('Failed to add record:', error.message)
  // Handle error
}
```

Common errors:
- "PERMISSION_DENIED" - User lacks write permission
- "NOT_FOUND" - Document doesn't exist
- "ALREADY_EXISTS" - Document already created
- "INVALID_ARGUMENT" - Bad data format
- "UNAUTHENTICATED" - User not logged in

## Computed Properties Example

```javascript
import { computed } from 'vue'

const overdueVaccines = computed(() => {
  return vaccines.value.filter(v => {
    const nextDue = v.nextDueDate || v.dueDate
    return new Date(nextDue) < new Date()
  })
})

const overdueCount = computed(() => overdueVaccines.value.length)
```

## Form Validation Example

```javascript
const addRecord = async () => {
  // Validate required fields
  if (!newRecord.value.description?.trim()) {
    console.error('Description required')
    return
  }
  
  if (!props.animal?.id) {
    console.error('Animal ID required')
    return
  }
  
  // Proceed with save
  await medicalStore.addRecord(newRecord.value)
}
```

## Reactive Data Pattern

```javascript
const records = ref([])
const loading = ref(false)

const loadRecords = async () => {
  loading.value = true
  try {
    records.value = await medicalStore.fetchByAnimalId(animalId)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadRecords)
```

## Common Patterns

### Render List with Status
```javascript
<div v-for="v in vaccines" :key="v.id" :class="{ overdue: getStatus(v) === 'overdue' }">
  <AppBadge :type="getStatus(v) === 'overdue' ? 'danger' : 'success'">
    {{ getStatus(v) === 'overdue' ? 'Overdue' : 'Current' }}
  </AppBadge>
</div>
```

### Conditional Rendering
```javascript
<div v-if="records.length > 0">
  <!-- Show records -->
</div>
<EmptyState v-else icon="📋" title="No records" message="Add a record..." />
```

### Loading State
```javascript
<AppButton :disabled="loading">
  {{ loading ? 'Saving…' : 'Save' }}
</AppButton>
```

## Debugging

### Log Store State
```javascript
console.log('Medical Records:', medicalStore.medicalRecords)
console.log('Vaccinations:', vaccinationsStore.vaccinations)
```

### Log Query Results
```javascript
const records = await medicalStore.fetchByAnimalId('animalId')
console.log('Fetched records:', records)
```

### Check Firestore Data
1. Open Firebase Console
2. Navigate to Firestore Database
3. Check `animalMedical` and `vaccinations` collections
4. Click documents to view fields and timestamps

## File Locations

- Stores: `src/stores/medicalRecords.js` and `src/stores/vaccinations.js`
- Components: `src/components/features/animal-detail/MedsTab.vue` and `VaccinesTab.vue`
- Docs: `MEDICAL_SYSTEM_*.md` files in project root
- Rules: `firestore.rules` (deploy with `firebase deploy --only firestore:rules`)

