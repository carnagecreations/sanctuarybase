# SanctuaryBase v2 - Developer Guide

A comprehensive guide for developers working on the SanctuaryBase admin dashboard.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Key Concepts](#key-concepts)
4. [Common Tasks](#common-tasks)
5. [File Naming Conventions](#file-naming-conventions)
6. [Where to Find Things](#where-to-find-things)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:5173`

### Building for Production

```bash
# Create optimized build
npm run build
```

Output is in `dist/` folder.

### Deploying to Cloudflare Pages

```bash
# Build first
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=sanctuarybase-v2
```

---

## Project Structure

### Directory Overview

```
SB- v2/
├── src/
│   ├── components/          # All Vue components
│   │   ├── features/        # Page-level components (Animals, Dashboard, etc.)
│   │   ├── features/admin/  # Admin page components
│   │   ├── features/animal-detail/ # Tabs for animal detail page
│   │   ├── features/modals/ # Modal components
│   │   ├── layout/          # Header, BottomNav, etc.
│   │   ├── auth/            # LoginScreen, VolunteerSignup, WelcomeScreen
│   │   ├── shared/          # Shared utilities (Toast, ConfirmDialog)
│   │   └── ui/              # Reusable UI components (AppButton, AppCard, etc.)
│   ├── stores/              # Pinia state management
│   │   ├── auth.js          # Authentication state
│   │   ├── animals.js       # Animals data and operations
│   │   ├── ui.js            # UI state (current tab, theme, etc.)
│   │   └── [feature].js     # One store per major feature
│   ├── services/            # Backend services
│   │   └── firebase.js      # Firebase configuration
│   ├── utils/               # Utility functions
│   │   ├── seedData.js      # Development data generation
│   │   └── csv.js           # CSV export utilities
│   ├── assets/              # Images, icons, etc.
│   ├── scripts/             # Node.js scripts (seed data)
│   ├── App.vue              # Root component (tab routing)
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles & design tokens
├── public/                  # Static files (index.html, images)
├── functions/               # Cloudflare Worker functions
│   └── api/                 # Backend API endpoints
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # Project overview
```

---

## Key Concepts

### 1. Component Types

#### **Feature/Page Components**
- Location: `src/components/features/`
- Purpose: Top-level pages that display full content
- Example: `Animals.vue`, `Dashboard.vue`, `AdminHub.vue`
- Pattern: Import UI components, fetch data from stores, render content

```vue
<template>
  <PageContainer>
    <!-- Content -->
  </PageContainer>
</template>

<script setup>
import { useStore } from '../stores/animals'
const store = useStore()
</script>
```

#### **UI Components**
- Location: `src/components/ui/`
- Purpose: Reusable building blocks (buttons, cards, inputs)
- Example: `AppButton.vue`, `AppCard.vue`, `AppInput.vue`
- Pattern: Accept props, emit events, no data fetching

```vue
<!-- Usage in feature components -->
<AppButton variant="primary" @click="handleClick">Click me</AppButton>
<AppCard>Content here</AppCard>
```

#### **Shared Components**
- Location: `src/components/shared/`
- Purpose: Global utilities (Toast, ConfirmDialog, SkeletonLoader)
- Usage: Used in `App.vue`, available to all pages

#### **Layout Components**
- Location: `src/components/layout/`
- Purpose: Header, navigation, structure
- Files: `Header.vue`, `BottomNav.vue`, `MoreDrawer.vue`

### 2. Pinia Stores (State Management)

Each major feature has a Pinia store that handles:
- Data fetching from Firestore
- State updates
- Business logic

**Example Store Structure:**

```javascript
// src/stores/animals.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useAnimalsStore = defineStore('animals', () => {
  // State
  const animals = ref([])
  const loading = ref(false)

  // Actions
  const fetchAnimals = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'animals'))
      animals.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } finally {
      loading.value = false
    }
  }

  const updateAnimal = async (id, data) => {
    await updateDoc(doc(db, 'animals', id), data)
    // Update local state
  }

  return {
    animals, loading,
    fetchAnimals, updateAnimal
  }
})
```

**Using a Store in Components:**

```vue
<script setup>
import { useAnimalsStore } from '../stores/animals'

const store = useAnimalsStore()

// Fetch data when component mounts
onMounted(() => {
  store.fetchAnimals()
})
</script>

<template>
  <div v-for="animal in store.animals" :key="animal.id">
    {{ animal.name }}
  </div>
</template>
```

### 3. Tab-Based Navigation

Instead of traditional routing, the app uses tab-based navigation:
- `App.vue` shows/hides components based on `ui.currentTab`
- Switching tabs: `ui.setCurrentTab('admin-announcements')`
- Available tabs listed in `src/stores/ui.js`

**Tab List (in `App.vue`):**
```javascript
// Primary tabs shown in BottomNav
primaryTabs: ['dashboard', 'animals', 'shifts', 'people', 'vet-hub', 'admin-hub', 'inbox']

// Secondary tabs (shown when admin clicks feature in AdminHub)
'admin-announcements', 'admin-rounds', 'admin-ledger', 'admin-grants', etc.
```

### 4. Firestore Collections

Data is stored in Firestore with these main collections:

| Collection | Contains | Example Fields |
|-----------|----------|-----------------|
| `animals` | Animal records | name, species, weight, status, createdAt |
| `users` | Staff/volunteer profiles | name, email, role, phone, avatar |
| `announcements` | Team announcements | title, body, createdAt, isActive |
| `shifts` | Volunteer shifts | startTime, endTime, volunteer, date |
| `applications` | Foster/adoption applications | applicantName, status, createdAt |
| `finance` | Transaction records | amount, category, date, description |
| `messages` | Team messages | sender, body, timestamp, recipient |
| `rounds` | Morning/evening rounds | date, notes, animals, status |

See `ARCHITECTURE.md` for detailed collection schema.

### 5. Design System & Styling

The app uses **Tailwind CSS** and custom CSS variables for theming:

```css
/* Global color variables (light/dark modes) */
--color-primary: #2563eb;
--color-text-primary: #ffffff;
--color-surface-1: #1f2937;
--color-border-strong: #374151;
```

**Using Design Tokens:**
```vue
<div class="text-primary font-bold text-lg">Styled text</div>
<div style="color: var(--color-primary);">Using CSS variables</div>
```

---

## Common Tasks

### Adding a New Page/Feature

**Step 1: Create the store** (`src/stores/newFeature.js`)
```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useNewFeatureStore = defineStore('newFeature', () => {
  const items = ref([])
  const loading = ref(false)

  const fetchItems = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'newFeatureCollection'))
      items.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } finally {
      loading.value = false
    }
  }

  return { items, loading, fetchItems }
})
```

**Step 2: Create the page component** (`src/components/features/NewFeaturePage.vue`)
```vue
<template>
  <PageContainer>
    <h1>New Feature</h1>
    <div v-if="store.loading">Loading...</div>
    <div v-else v-for="item in store.items" :key="item.id">
      {{ item.name }}
    </div>
  </PageContainer>
</template>

<script setup>
import { onMounted } from 'vue'
import { PageContainer } from '../ui'
import { useNewFeatureStore } from '../../stores/newFeature'

const store = useNewFeatureStore()

onMounted(() => {
  store.fetchItems()
})
</script>
```

**Step 3: Add route in `App.vue`**
```vue
<!-- In <main> section -->
<NewFeaturePage v-else-if="ui.currentTab === 'new-feature'" />
```

**Step 4: Add import in `App.vue`**
```javascript
import NewFeaturePage from './components/features/NewFeaturePage.vue'
```

**Step 5: Add menu item to `AdminHub.vue`** (if admin feature)
```javascript
// In sections object
operations: [
  // ...existing items...
  { id: 'new-feature', icon: '✨', label: 'New Feature' },
]

// In featureRoutes object
'new-feature': 'new-feature', // maps feature ID to tab ID
```

**Step 6: Create Firestore collection rules** (if needed)
- Go to Firestore Console
- Set read/write rules for the collection
- Test with sample data

### Adding a Form

**Pattern:**
```vue
<template>
  <AppCard class="form-card">
    <div class="form-group">
      <label>Name</label>
      <AppInput v-model="form.name" placeholder="Enter name" />
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea v-model="form.description"></textarea>
    </div>

    <div class="form-actions">
      <AppButton variant="primary" @click="handleSubmit" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save' }}
      </AppButton>
      <AppButton @click="resetForm">Cancel</AppButton>
    </div>
  </AppCard>
</template>

<script setup>
import { ref } from 'vue'
import { AppCard, AppButton, AppInput } from '../ui'
import { useUIStore } from '../../stores/ui'
import { useFeatureStore } from '../../stores/feature'

const ui = useUIStore()
const store = useFeatureStore()
const saving = ref(false)
const form = ref({
  name: '',
  description: ''
})

const handleSubmit = async () => {
  saving.value = true
  try {
    await store.addItem(form.value)
    ui.showToast('Item created successfully!', 'success')
    resetForm()
  } catch (error) {
    ui.showToast('Error: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  form.value = { name: '', description: '' }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
```

### Adding a Modal/Dialog

**Pattern:**
```vue
<template>
  <!-- Modal backdrop -->
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h2>Modal Title</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-content">
        <!-- Form content -->
      </div>

      <div class="modal-footer">
        <AppButton variant="primary" @click="handleConfirm">Confirm</AppButton>
        <AppButton @click="closeModal">Cancel</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AppButton } from './ui'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'confirm'])

const closeModal = () => emit('close')
const handleConfirm = () => emit('confirm')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface-1);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
```

### Adding a Data Table/List

**Pattern:**
```vue
<template>
  <div class="list-container">
    <div class="list-header">
      <h2>Items</h2>
      <AppButton @click="showForm = true">+ Add Item</AppButton>
    </div>

    <div v-if="store.items.length === 0" class="empty-state">
      No items yet
    </div>

    <AppCard v-for="item in store.items" :key="item.id" class="list-item">
      <div class="item-row">
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">{{ item.description }}</div>
        </div>
        <div class="item-actions">
          <AppButton size="sm" @click="selectItem(item)">Edit</AppButton>
          <AppButton size="sm" variant="danger" @click="deleteItem(item.id)">Delete</AppButton>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AppCard, AppButton } from '../ui'
import { useFeatureStore } from '../../stores/feature'
import { useUIStore } from '../../stores/ui'

const store = useFeatureStore()
const ui = useUIStore()
const showForm = ref(false)

onMounted(() => {
  store.fetchItems()
})

const deleteItem = async (id) => {
  const confirmed = await ui.confirm({
    title: 'Delete item?',
    message: 'This cannot be undone.',
    danger: true,
    confirmText: 'Delete'
  })
  if (confirmed) {
    await store.deleteItem(id)
    ui.showToast('Item deleted', 'success')
  }
}

const selectItem = (item) => {
  // Handle edit
}
</script>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.item-meta {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
```

---

## File Naming Conventions

### Components

- **PascalCase** for Vue components: `AnimalDetail.vue`, `AdminHub.vue`
- **Suffix with scope**: 
  - Page components: `FeatureName.vue` or `FeatureNamePage.vue`
  - UI components: `App*` prefix (e.g., `AppButton.vue`, `AppCard.vue`)
  - Tab components: `FeatureTab.vue` (e.g., `ProfileTab.vue`, `HealthTab.vue`)

### Stores

- **camelCase** with `.js` extension: `animals.js`, `announcements.js`
- Import as `useFeatureStore` (prefix with `use`)

### Utils & Services

- **camelCase**: `seedData.js`, `firebase.js`, `csv.js`

### Directories

- **lowercase with hyphens**: `animal-detail/`, `safe-houses/`, `admin/`

---

## Where to Find Things

### "I need to edit the animal list page"
- **Component**: `src/components/features/Animals.vue`
- **Store**: `src/stores/animals.js`
- **Related**: `src/components/features/AnimalDetail.vue` for detail page

### "I need to add fields to the animal form"
- **Page**: `src/components/features/AnimalDetail.vue`
- **Store**: `src/stores/animals.js` (add updateAnimal logic)
- **Firestore**: Update animal collection schema

### "I need to add a new announcement feature"
- **Component**: `src/components/features/admin/AnnouncementsPage.vue`
- **Store**: `src/stores/announcements.js`
- **Menu**: Add to `AdminHub.vue` sections

### "I need to change the header/navigation"
- **Header**: `src/components/layout/Header.vue`
- **Navigation**: `src/components/layout/BottomNav.vue`
- **Menu drawer**: `src/components/layout/MoreDrawer.vue`

### "I need to add a reusable button/card component"
- **Location**: `src/components/ui/`
- **Export in**: `src/components/ui/index.js`
- **Usage**: Import from `../ui` in feature components

### "I need to show a toast/notification"
```javascript
import { useUIStore } from '../stores/ui'

const ui = useUIStore()
ui.showToast('Success!', 'success')
// or
ui.showToast('Error occurred', 'error')
```

### "I need to show a confirm dialog"
```javascript
const confirmed = await ui.confirm({
  title: 'Delete this?',
  message: 'Are you sure?',
  danger: true,
  confirmText: 'Delete',
  cancelText: 'Cancel'
})
if (confirmed) {
  // Handle deletion
}
```

### "I need to authenticate a user"
- **Store**: `src/stores/auth.js`
- **Components**: `src/components/auth/`
- **Check login**: `auth.isLoggedIn`, `auth.user`

### "I need to fetch data from Firestore"
- **Service setup**: `src/services/firebase.js`
- **Use in stores**: `import { db } from '../services/firebase'`
- **Example**: `const querySnapshot = await getDocs(collection(db, 'animals'))`

### "I need to seed development data"
- **Files**: `src/utils/seedData.js`, `src/scripts/seedApplications.js`
- **Run**: `npm run seed:applications`, `npm run seed:eod-reports`, etc.

### "I need to export to CSV"
- **Utility**: `src/utils/csv.js`
- **Usage**: `exportToCSV(data, filename)`

---

## Troubleshooting

### **"Component not showing up"**

1. Check the tab name is correct in `App.vue`
2. Verify the component is imported
3. Check that `ui.currentTab` matches the condition
4. Check browser console for errors

### **"Store data not updating"**

1. Check that you're awaiting async functions: `await store.fetchItems()`
2. Verify Firestore permissions allow reads
3. Check that data path is correct: `collection(db, 'correctName')`
4. Look at browser DevTools Network tab for Firestore errors

### **"Styling looks wrong"**

1. Check that component has correct CSS classes
2. Verify Tailwind CSS is included in `style.css`
3. Check theme variables are applied: `var(--color-primary)`
4. Clear browser cache: Ctrl+Shift+Delete

### **"Authentication not working"**

1. Check Firebase config in `src/services/firebase.js`
2. Verify Firestore Auth is enabled in Firebase Console
3. Check user permissions in Firestore security rules
4. Look for CORS errors in browser console

### **"Build failing"**

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### **"Changes not visible in dev server"**

1. Save the file (Ctrl+S)
2. Check for console errors (F12)
3. Refresh browser (Ctrl+R)
4. Restart dev server: Kill process and `npm run dev` again

### **"Firestore quota exceeded"**

1. Reduce number of reads/writes
2. Batch operations together
3. Cache data in component state
4. Check Firestore console for high-usage collections

---

## Getting Help

- **Code examples**: See `ARCHITECTURE.md` and `CODE_PATTERNS.md`
- **Firestore schema**: See `ARCHITECTURE.md` - Firestore Collections
- **Component patterns**: See `CODE_PATTERNS.md` - Common Patterns
- **Project layout**: See `CODEBASE_MAP.md` - File Structure
- **Adding features**: See `NEW_FEATURE_CHECKLIST.md`

---

**Last Updated:** June 28, 2026
**Maintained by:** Development Team
