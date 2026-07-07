# SanctuaryBase v2 - Architecture Guide

High-level system design, data flow, and architectural patterns used in SanctuaryBase v2.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Flow](#data-flow)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Component Patterns](#component-patterns)
6. [Store Patterns](#store-patterns)
7. [Firestore Collections](#firestore-collections)
8. [Authentication Flow](#authentication-flow)
9. [Tab-Based Navigation](#tab-based-navigation)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

SanctuaryBase v2 is a **single-page application (SPA)** built with Vue 3 and Pinia, running on Cloudflare Pages with Firestore as the database.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue 3 SPA                              │
│                   (Cloudflare Pages)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App.vue (Root Component)                │  │
│  │  - Tab-based routing (ui.currentTab)                 │  │
│  │  - Auth guard (checks login)                         │  │
│  │  - Layout wrapper (Header, BottomNav)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ▲                                 │
│                           │                                 │
│  ┌────────────────────────┴─────────────────────────────┐  │
│  │         Pinia Store Layer (State Management)          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ animals      │  │ announcements │  │ auth      │  │  │
│  │  │ store        │  │ store         │  │ store     │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ shifts       │  │ ledger        │  │ ui        │  │  │
│  │  │ store        │  │ store         │  │ store     │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Firebase Service Layer                    │  │
│  │  - Firebase Auth (email/password)                     │  │
│  │  - Firestore (real-time database)                    │  │
│  │  - Cloud Functions (optional backend)                │  │
│  └────────────────────────────────────────────────────────┘  │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │  Firebase (Google)   │
                  │  - Authentication   │
                  │  - Firestore DB     │
                  │  - Cloud Functions  │
                  └──────────────────────┘
```

---

## Data Flow

### User Action → Store → Firestore → UI Update

```
1. USER INITIATES ACTION
   └─> Click button "Create Announcement"

2. COMPONENT CALLS STORE METHOD
   └─> announcements.createAnnouncement(formData)

3. STORE UPDATES FIRESTORE
   └─> addDoc(collection(db, 'announcements'), formData)

4. STORE UPDATES LOCAL STATE
   └─> announcements.value.push(newAnnouncement)

5. COMPONENT REACTS TO STATE CHANGE
   └─> Template re-renders with new item

6. USER SEES RESULT
   └─> New announcement appears in list
```

### Example: Creating an Announcement

**Component (AnnouncementsPage.vue):**
```javascript
// 1. Get store
const store = useAnnouncementsStore()

// 2. Call store method
const handleCreate = async () => {
  try {
    await store.createAnnouncement({
      title: form.title,
      body: form.body
    })
    ui.showToast('Created!', 'success')
  } catch (error) {
    ui.showToast('Error: ' + error.message, 'error')
  }
}
```

**Store (announcements.js):**
```javascript
// 3. Store fetches from Firestore and updates state
const createAnnouncement = async (data) => {
  const docRef = await addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: new Date(),
    isActive: true
  })
  
  // 4. Update local state immediately
  announcements.value.push({
    id: docRef.id,
    ...data,
    createdAt: new Date()
  })
}
```

**Firestore:**
```
announcements/
  ├── docId1
  │   ├── title: "All hands meeting"
  │   ├── body: "Meeting at 2pm"
  │   ├── createdAt: 2024-01-15
  │   └── isActive: true
  └── docId2
      ├── title: "New volunteer"
      ├── body: "Welcome Sarah!"
      ├── createdAt: 2024-01-16
      └── isActive: true
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Vue 3 | Reactive UI components |
| **State Management** | Pinia | Global state and data fetching |
| **Build Tool** | Vite | Fast builds and hot reload |
| **Styling** | Tailwind CSS + CSS Variables | Responsive design and theming |
| **Database** | Firestore | Real-time NoSQL database |
| **Authentication** | Firebase Auth | User login and access control |
| **Backend** | Cloudflare Functions | Optional serverless API |
| **Hosting** | Cloudflare Pages | Global CDN and automatic deploys |

---

## Folder Structure

### `/src/components/` - UI Components

```
components/
├── features/                    # Page-level components
│   ├── Animals.vue             # Animal list & browse
│   ├── Dashboard.vue           # Main dashboard
│   ├── Shifts.vue              # Volunteer shifts
│   ├── People.vue              # Staff directory
│   ├── VetHub.vue              # Veterinary hub
│   ├── AdminHub.vue            # Admin menu
│   ├── AnimalDetail.vue        # Animal profile page
│   ├── FosterPortal.vue        # Foster portal
│   ├── VolunteerProfile.vue    # Volunteer profile
│   ├── SuppliesPage.vue        # Supplies management
│   ├── animal-detail/          # Sub-tabs for animal detail
│   │   ├── ProfileTab.vue
│   │   ├── HealthTab.vue
│   │   ├── MedsTab.vue
│   │   ├── WeightTab.vue
│   │   └── ... (11 tabs total)
│   ├── admin/                  # Admin-only pages
│   │   ├── AnnouncementsPage.vue
│   │   ├── TasksPage.vue
│   │   ├── FinanceStatsPage.vue
│   │   ├── BiteReportsPage.vue
│   │   └── ... (30+ admin pages)
│   └── modals/
│       └── DietModal.vue       # Modal components
│
├── layout/                      # Layout components
│   ├── Header.vue              # Top header
│   ├── BottomNav.vue           # Bottom navigation
│   └── MoreDrawer.vue          # Sidebar menu
│
├── auth/                        # Authentication
│   ├── LoginScreen.vue
│   ├── WelcomeScreen.vue
│   └── VolunteerSignup.vue
│
├── ui/                          # Reusable UI components
│   ├── AppButton.vue
│   ├── AppCard.vue
│   ├── AppInput.vue
│   ├── AppSelect.vue
│   ├── AppBadge.vue
│   ├── SectionLabel.vue
│   ├── PageContainer.vue
│   ├── EmptyState.vue
│   ├── StatCard.vue
│   ├── UserRow.vue
│   └── index.js                # Export all UI components
│
└── shared/                      # Shared utilities
    ├── Toast.vue               # Toast notifications
    ├── ConfirmDialog.vue       # Confirmation modal
    └── SkeletonLoader.vue      # Loading placeholders
```

### `/src/stores/` - Pinia Stores

One store per major feature, following the Composition API pattern:

```
stores/
├── auth.js                 # Authentication & user
├── ui.js                   # UI state (currentTab, theme, etc.)
├── animals.js              # Animal CRUD & list
├── announcements.js        # Announcements
├── shifts.js               # Shift scheduling
├── people.js               # Staff/volunteer directory
├── messages.js             # Inbox/messages
├── vetHub.js               # Veterinary data
├── ledger.js               # Finance transactions
├── applications.js         # Foster/adoption applications
├── eodReports.js           # End-of-day reports
├── feedingLogs.js          # Feeding records
├── medicalRecords.js       # Medical history
├── rounds.js               # Morning/evening rounds
├── tasks.js                # Team tasks
├── donors.js               # Donor CRM
├── financeStats.js         # Finance analytics
└── ... (20+ stores total)
```

### `/src/services/` - External Services

```
services/
├── firebase.js             # Firebase initialization & config
├── api.js                  # (Optional) API client
└── auth.js                 # (Optional) Auth helper methods
```

### `/src/utils/` - Utility Functions

```
utils/
├── seedData.js             # Generate sample data
├── csv.js                  # CSV export/import
├── date.js                 # Date formatting
└── validators.js           # Form validation
```

### `/functions/` - Cloudflare Workers (Backend)

```
functions/
├── api/
│   ├── delete-document.js  # Delete from Firestore
│   ├── get-documents.js    # Query Firestore
│   ├── upload-document.js  # Upload files
│   ├── send-reminder.js    # Send email reminders
│   ├── vet-chat.js         # AI vet chat integration
│   └── generate-loi.js     # Generate LOI documents
└── scheduled/
    └── daily-digest.js     # (Optional) Scheduled tasks
```

---

## Component Patterns

### 1. Feature/Page Component Pattern

```vue
<!-- src/components/features/AnimalDetail.vue -->
<template>
  <PageContainer>
    <!-- Header section -->
    <div class="page-header">
      <button @click="ui.setCurrentTab('animals')">← Back</button>
      <h1>{{ animal.name }}</h1>
      <button @click="editAnimal">Edit</button>
    </div>

    <!-- Tab navigation -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab" 
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Tab content -->
    <div v-show="activeTab === 'profile'" class="tab-content">
      <ProfileTab :animal="animal" />
    </div>
    <div v-show="activeTab === 'health'" class="tab-content">
      <HealthTab :animal="animal" />
    </div>
    <!-- ... more tabs ... -->
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PageContainer } from '../ui'
import ProfileTab from './animal-detail/ProfileTab.vue'
import HealthTab from './animal-detail/HealthTab.vue'
import { useAnimalsStore } from '../../stores/animals'
import { useUIStore } from '../../stores/ui'

const store = useAnimalsStore()
const ui = useUIStore()
const activeTab = ref('profile')
const animal = ref(null)

const tabs = ['profile', 'health', 'meds', 'weight', 'vaccines']

onMounted(async () => {
  // Get ID from ui.selectedAnimal (set by Animals.vue when clicking animal)
  animal.value = await store.getAnimalById(ui.selectedAnimal?.id)
})

const editAnimal = async () => {
  // Handle edit
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.tabs button {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
```

### 2. List/Table Component Pattern

```vue
<!-- src/components/features/admin/AnimalPipelinePage.vue -->
<template>
  <PageContainer>
    <div class="page-header">
      <h1>Animal Pipeline</h1>
      <AppButton variant="primary" @click="showForm = true">+ Add Animal</AppButton>
    </div>

    <!-- Create form -->
    <AnimalForm v-if="showForm" @save="handleSave" @cancel="showForm = false" />

    <!-- Filter/search -->
    <div class="filters">
      <AppInput v-model="searchQuery" placeholder="Search animals..." />
      <AppSelect v-model="statusFilter" :options="statuses" />
    </div>

    <!-- List -->
    <div v-if="filteredAnimals.length === 0" class="empty-state">
      <EmptyState title="No animals" description="Get started by adding one." />
    </div>

    <AppCard v-for="animal in filteredAnimals" :key="animal.id" class="list-item">
      <div class="item-header">
        <div class="item-info">
          <h3>{{ animal.name }}</h3>
          <p>{{ animal.species }}</p>
        </div>
        <div class="item-status">
          <AppBadge :variant="getStatusVariant(animal.status)">
            {{ animal.status }}
          </AppBadge>
        </div>
      </div>
      <div class="item-actions">
        <AppButton size="sm" @click="editAnimal(animal)">Edit</AppButton>
        <AppButton size="sm" variant="danger" @click="deleteAnimal(animal.id)">Delete</AppButton>
      </div>
    </AppCard>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppCard, AppButton, AppInput, AppSelect, AppBadge, EmptyState } from '../ui'
import AnimalForm from '../modals/AnimalForm.vue'
import { useAnimalsStore } from '../../stores/animals'
import { useUIStore } from '../../stores/ui'

const store = useAnimalsStore()
const ui = useUIStore()

const showForm = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

const statuses = [
  { value: '', label: 'All Statuses' },
  { value: 'intake', label: 'Intake' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'foster', label: 'Foster' },
  { value: 'available', label: 'Available' },
  { value: 'adopted', label: 'Adopted' }
]

const filteredAnimals = computed(() => {
  return store.animals.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || a.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

onMounted(() => {
  store.fetchAnimals()
})

const handleSave = async (animalData) => {
  await store.addAnimal(animalData)
  showForm.value = false
  ui.showToast('Animal added successfully!', 'success')
}

const editAnimal = (animal) => {
  // Handle edit
}

const deleteAnimal = async (id) => {
  const confirmed = await ui.confirm({
    title: 'Delete animal?',
    message: 'This cannot be undone.',
    danger: true,
    confirmText: 'Delete'
  })
  if (confirmed) {
    await store.deleteAnimal(id)
    ui.showToast('Animal deleted', 'success')
  }
}

const getStatusVariant = (status) => {
  const variants = {
    intake: 'info',
    assessment: 'warning',
    foster: 'secondary',
    available: 'success',
    adopted: 'default'
  }
  return variants[status] || 'default'
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filters input,
.filters select {
  flex: 1;
}

.list-item {
  margin-bottom: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.item-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
```

---

## Store Patterns

### Standard Store Structure

```javascript
// src/stores/animals.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useAnimalsStore = defineStore('animals', () => {
  // ========== STATE ==========
  const animals = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedAnimal = ref(null)

  // ========== GETTERS (computed) ==========
  const animalCount = () => animals.value.length
  const adoptedAnimals = () => animals.value.filter(a => a.status === 'adopted')

  // ========== ACTIONS ==========
  
  // Fetch all animals
  const fetchAnimals = async () => {
    loading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'animals'))
      animals.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return animals.value
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch animals:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get single animal
  const getAnimalById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'animals', id))
      if (docSnap.exists()) {
        selectedAnimal.value = { id: docSnap.id, ...docSnap.data() }
        return selectedAnimal.value
      }
      return null
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // Add animal
  const addAnimal = async (animalData) => {
    loading.value = true
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'animals'), {
        ...animalData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      const newAnimal = { id: docRef.id, ...animalData }
      animals.value.push(newAnimal)
      return newAnimal
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update animal
  const updateAnimal = async (id, animalData) => {
    loading.value = true
    error.value = null
    try {
      await updateDoc(doc(db, 'animals', id), {
        ...animalData,
        updatedAt: new Date()
      })
      const idx = animals.value.findIndex(a => a.id === id)
      if (idx !== -1) {
        animals.value[idx] = { ...animals.value[idx], ...animalData }
      }
      return animals.value[idx]
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete animal
  const deleteAnimal = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'animals', id))
      animals.value = animals.value.filter(a => a.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== RETURN (public API) ==========
  return {
    // State
    animals,
    loading,
    error,
    selectedAnimal,
    
    // Getters
    animalCount,
    adoptedAnimals,
    
    // Actions
    fetchAnimals,
    getAnimalById,
    addAnimal,
    updateAnimal,
    deleteAnimal
  }
})
```

---

## Firestore Collections

### Schema Overview

```
firestore/
├── animals/
│   ├── docId1
│   │   ├── name: "Leo"
│   │   ├── species: "Reptile"
│   │   ├── weight: 2.5
│   │   ├── status: "available"
│   │   ├── intake_date: 2023-06-15
│   │   ├── notes: "Friendly, needs heat lamp"
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   └── docId2 ...
│
├── users/
│   ├── userId1
│   │   ├── name: "Sarah Smith"
│   │   ├── email: "sarah@example.com"
│   │   ├── role: "volunteer" | "staff" | "admin"
│   │   ├── phone: "555-1234"
│   │   ├── avatar: "url"
│   │   ├── hours_volunteer: 120
│   │   ├── active: true
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   └── userId2 ...
│
├── announcements/
│   ├── docId1
│   │   ├── title: "Team Meeting"
│   │   ├── body: "All hands meeting at 2pm"
│   │   ├── isActive: true
│   │   ├── createdAt: timestamp
│   │   └── createdBy: "userId"
│   └── docId2 ...
│
├── shifts/
│   ├── docId1
│   │   ├── volunteer_id: "userId"
│   │   ├── volunteer_name: "Sarah Smith"
│   │   ├── date: 2024-01-15
│   │   ├── start_time: "09:00"
│   │   ├── end_time: "17:00"
│   │   ├── hours: 8
│   │   ├── status: "confirmed" | "pending" | "cancelled"
│   │   └── createdAt: timestamp
│   └── docId2 ...
│
├── messages/
│   ├── docId1
│   │   ├── sender: "userId"
│   │   ├── sender_name: "Sarah"
│   │   ├── recipient: "userId"
│   │   ├── body: "Can you help with feeding tomorrow?"
│   │   ├── read: false
│   │   ├── timestamp: timestamp
│   │   └── thread_id: "threadId" (for replies)
│   └── docId2 ...
│
├── finance/
│   ├── docId1
│   │   ├── date: 2024-01-15
│   │   ├── category: "supplies" | "veterinary" | "rent" | "donation"
│   │   ├── amount: 150.00
│   │   ├── description: "Monthly food order"
│   │   ├── reference: "PO-123"
│   │   ├── status: "pending" | "completed"
│   │   ├── createdBy: "userId"
│   │   └── createdAt: timestamp
│   └── docId2 ...
│
├── applications/
│   ├── docId1
│   │   ├── applicant_name: "John Doe"
│   │   ├── applicant_email: "john@example.com"
│   │   ├── applicant_phone: "555-5678"
│   │   ├── application_type: "foster" | "adoption"
│   │   ├── animal_id: "animalId"
│   │   ├── status: "submitted" | "approved" | "rejected"
│   │   ├── notes: "First-time foster"
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   └── docId2 ...
│
└── rounds/
    ├── docId1
    │   ├── date: 2024-01-15
    │   ├── type: "morning" | "evening"
    │   ├── animals: ["animalId1", "animalId2"]
    │   ├── notes: "All animals healthy"
    │   ├── completed_by: "userId"
    │   └── timestamp: timestamp
    └── docId2 ...
```

### Adding a New Collection

1. **Plan the schema** - What fields will each document have?
2. **Create sample data** - Add to seed script
3. **Create a store** - Pattern shown above
4. **Set Firestore rules** - In Firebase Console
5. **Create component** - Feature page to display/manage

---

## Authentication Flow

```
┌──────────────────────────────────────────────────┐
│              User Visits App                     │
└──────────────────────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────┐
    │ Check auth.initializeAuth()     │
    │ (runs in App.vue onMounted)     │
    └─────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌───────────────┐        ┌──────────────────┐
    │ User logged   │        │ User not logged  │
    │ in?           │        │ in?              │
    └───────────────┘        └──────────────────┘
            │                         │
            ▼                         ▼
    ┌────────────────────┐    ┌─────────────────────┐
    │ Show Dashboard     │    │ Show WelcomeScreen  │
    │ auth.isLoggedIn=✓  │    │ & LoginScreen       │
    └────────────────────┘    └─────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
            ┌──────────────┐                  ┌─────────────────┐
            │ Login        │                  │ Volunteer Signup│
            │ (existing)   │                  │ (new user)      │
            └──────────────┘                  └─────────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      │
                                      ▼
                    ┌────────────────────────────┐
                    │ Firebase Auth.signIn()     │
                    │ Create user record         │
                    └────────────────────────────┘
                                      │
                                      ▼
                    ┌────────────────────────────┐
                    │ Dashboard                  │
                    │ User can now access data   │
                    └────────────────────────────┘
```

---

## Tab-Based Navigation

Instead of traditional routing, SanctuaryBase uses a **tab system** managed by the UI store.

### How Navigation Works

```javascript
// In any component, change the current tab:
ui.setCurrentTab('admin-announcements')

// App.vue conditionally renders components based on currentTab:
<AnnouncementsPage v-if="ui.currentTab === 'admin-announcements'" />

// When user clicks Back or navigates to main menu:
ui.setCurrentTab('admin-hub')
```

### Tab Structure

**Primary Tabs** (shown in BottomNav):
- `dashboard`
- `animals`
- `shifts`
- `people`
- `vet-hub`
- `admin-hub`
- `inbox`

**Secondary Tabs** (shown when admin clicks features):
- `admin-announcements`
- `admin-rounds`
- `admin-ledger`
- `admin-grants`
- etc.

### Navigation Example

```vue
<template>
  <!-- Click button to navigate -->
  <button @click="ui.setCurrentTab('admin-announcements')">
    View Announcements
  </button>

  <!-- Or from menu -->
  <div class="menu">
    <button v-for="item in menu" @click="selectFeature(item.id)">
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
import { useUIStore } from '../stores/ui'

const ui = useUIStore()

const selectFeature = (featureId) => {
  // Map feature IDs to tab names
  const tabMap = {
    'announcements': 'admin-announcements',
    'rounds': 'admin-rounds',
    'finance': 'admin-ledger'
  }
  ui.setCurrentTab(tabMap[featureId])
}
</script>
```

---

## Deployment Architecture

### Local Development
```
npm run dev
    ↓
Vite dev server on http://localhost:5173
    ↓
Hot reload on file changes
```

### Production Build
```
npm run build
    ↓
Vite bundles Vue + CSS + JS
    ↓
Output: dist/ folder with optimized files
```

### Cloudflare Pages Deployment
```
git push to GitHub
    ↓
Cloudflare Pages webhook triggered
    ↓
npm install && npm run build
    ↓
Uploads dist/ to global CDN
    ↓
Live at sanctuarybase-v2.pages.dev
```

### API / Cloud Functions
```
Optional Cloudflare Worker functions in /functions/
    ↓
Can handle server-side logic (if needed)
    ↓
Access via fetch() from components
    ↓
Returns data to Vue components
```

---

## Security Considerations

### Firestore Rules

```javascript
// Example: Only admins can write announcements
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Animals: public read, staff write
    match /animals/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'staff' || 
                      request.auth.token.role == 'admin';
    }

    // Announcements: public read, admin write
    match /announcements/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }

    // User profiles: read own, write if admin
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.token.role == 'admin';
    }
  }
}
```

### Best Practices

1. **Never store secrets in frontend code** - use Firestore rules
2. **Validate input** - on both client and server
3. **Check authentication** - all components check `auth.isLoggedIn`
4. **Rate limit sensitive operations** - on backend
5. **Audit logs** - use Firestore `createdBy` fields

---

**Last Updated:** June 28, 2026
**Maintained by:** Development Team
