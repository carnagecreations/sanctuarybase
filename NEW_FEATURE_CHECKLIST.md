# SanctuaryBase v2 - New Feature Checklist

Step-by-step guide for adding a new feature to SanctuaryBase.

---

## Overview

A typical new feature involves:
1. **Data Layer** - Store (Pinia) + Firestore collection
2. **UI Layer** - Page component + optional modals
3. **Navigation** - Add to menu/routes
4. **Permissions** - Set Firestore security rules
5. **Testing** - Manual testing + data seeding

**Estimated Time:** 2-4 hours per feature

---

## Pre-Planning

Before you start coding, answer these questions:

### 1. Define the Feature
- [ ] What does this feature do?
- [ ] Who uses it? (admin, staff, volunteer, everyone)
- [ ] What data does it manage?
- [ ] How does it integrate with existing features?

### 2. Plan the Data Model

**Example:** If building a "Volunteer Certifications" feature

```javascript
// Firestore collection: "certifications"
{
  id: "docId",
  volunteer_id: "userId",        // Foreign key to users
  volunteer_name: "Sarah Smith",
  certification_type: "CPR",     // e.g., CPR, First Aid, etc.
  issuer: "American Red Cross",
  issue_date: "2023-01-15",
  expiry_date: "2026-01-15",
  document_url: "gs://...",
  verified: false,
  verified_by: "adminUserId",
  verified_at: "2023-01-20",
  notes: "Verified by admin",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. Choose Access Level
- [ ] **Public** - Everyone can read
- [ ] **Volunteer** - Logged-in volunteers can read
- [ ] **Staff** - Staff+ can read/write
- [ ] **Admin Only** - Only admins can access

---

## Step 1: Create the Pinia Store

**File:** `src/stores/featureName.js`

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useFeatureStore = defineStore('featureName', () => {
  // ========== STATE ==========
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedItem = ref(null)

  // ========== FETCH OPERATIONS ==========

  const fetchItems = async () => {
    loading.value = true
    error.value = null
    try {
      const snapshot = await getDocs(collection(db, 'collectionName'))
      items.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return items.value
    } catch (err) {
      error.value = err.message
      console.error('Fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const getItemById = async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'collectionName', id))
      if (docSnap.exists()) {
        selectedItem.value = { id: docSnap.id, ...docSnap.data() }
        return selectedItem.value
      }
      return null
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // ========== CREATE OPERATION ==========

  const addItem = async (itemData) => {
    loading.value = true
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'collectionName'), {
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      const newItem = { id: docRef.id, ...itemData }
      items.value.push(newItem)
      return newItem
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== UPDATE OPERATION ==========

  const updateItem = async (id, itemData) => {
    loading.value = true
    error.value = null
    try {
      await updateDoc(doc(db, 'collectionName', id), {
        ...itemData,
        updatedAt: new Date()
      })
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], ...itemData }
      }
      return items.value[idx]
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== DELETE OPERATION ==========

  const deleteItem = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'collectionName', id))
      items.value = items.value.filter(i => i.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ========== RETURN PUBLIC API ==========

  return {
    // State
    items,
    loading,
    error,
    selectedItem,

    // Actions
    fetchItems,
    getItemById,
    addItem,
    updateItem,
    deleteItem
  }
})
```

**Checklist:**
- [ ] Store file created with all CRUD operations
- [ ] Proper error handling
- [ ] Timestamps (createdAt, updatedAt)
- [ ] Export statement at bottom
- [ ] No Firebase operations outside try/catch

---

## Step 2: Create the Page Component

**File:** `src/components/features/[AdminHub]/FeatureNamePage.vue`

Use the template from `CODE_PATTERNS.md` → "Component Structure Template"

**Minimal Example:**

```vue
<template>
  <PageContainer>
    <!-- Back button (if admin feature) -->
    <button class="back-btn" @click="goBack">← Admin Hub</button>

    <!-- Header -->
    <div class="page-header">
      <h1>Feature Name</h1>
      <AppButton v-if="canCreate" variant="primary" @click="showForm = true">
        + New Item
      </AppButton>
    </div>

    <!-- Form (create/edit) -->
    <FeatureForm
      v-if="showForm"
      :initial="editingItem"
      @save="handleSave"
      @cancel="showForm = false"
    />

    <!-- Loading state -->
    <div v-if="store.loading" class="loading">
      <SkeletonLoader :count="3" />
    </div>

    <!-- Empty state -->
    <div v-else-if="store.items.length === 0" class="empty">
      <EmptyState title="No items" description="Create one to get started" />
    </div>

    <!-- List -->
    <div v-else class="items-list">
      <AppCard v-for="item in store.items" :key="item.id" class="item-card">
        <div class="item-row">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
          <div class="item-actions">
            <AppButton size="sm" @click="editItem(item)">Edit</AppButton>
            <AppButton size="sm" variant="danger" @click="deleteItem(item.id)">Delete</AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppButton, AppCard, EmptyState, SkeletonLoader } from '../ui'
import FeatureForm from '../modals/FeatureForm.vue'
import { useFeatureStore } from '../../stores/featureName'
import { useUIStore } from '../../stores/ui'

const store = useFeatureStore()
const ui = useUIStore()

const showForm = ref(false)
const editingItem = ref(null)

const canCreate = computed(() => auth.user?.role === 'admin')

onMounted(async () => {
  await store.fetchItems()
})

const goBack = () => {
  ui.setCurrentTab('admin-hub')
}

const handleSave = async (formData) => {
  try {
    if (editingItem.value) {
      await store.updateItem(editingItem.value.id, formData)
      ui.showToast('Updated', 'success')
    } else {
      await store.addItem(formData)
      ui.showToast('Created', 'success')
    }
    showForm.value = false
    editingItem.value = null
  } catch (error) {
    ui.showToast('Error: ' + error.message, 'error')
  }
}

const editItem = (item) => {
  editingItem.value = item
  showForm.value = true
}

const deleteItem = async (id) => {
  const confirmed = await ui.confirm({
    title: 'Delete item?',
    message: 'This cannot be undone.',
    danger: true
  })
  if (confirmed) {
    await store.deleteItem(id)
    ui.showToast('Deleted', 'success')
  }
}
</script>

<style scoped>
.back-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  margin-bottom: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  padding: 1.5rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-info h3 {
  margin: 0 0 0.5rem;
}

.item-info p {
  margin: 0;
  color: var(--color-text-secondary);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
```

**Checklist:**
- [ ] Component imports PageContainer and UI components
- [ ] Uses store for data management
- [ ] Loading state shown while fetching
- [ ] Empty state shown when no items
- [ ] Create form available (if allowed)
- [ ] Edit/Delete buttons work
- [ ] Error handling with toast messages
- [ ] Back button returns to previous page
- [ ] Responsive styling

---

## Step 3: Create the Form Component (Optional)

**File:** `src/components/features/modals/FeatureForm.vue`

Use the template from `CODE_PATTERNS.md` → "Form Handling"

**Key Points:**
- [ ] Form validation
- [ ] Error messages
- [ ] Submit loading state
- [ ] Props for initial data (editing)
- [ ] Emit `save` and `cancel` events

---

## Step 4: Add Route to App.vue

**File:** `src/App.vue`

### 4a: Add Import

```javascript
// Around line 100-120, add:
import FeatureNamePage from './components/features/admin/FeatureNamePage.vue'
```

### 4b: Add Conditional Render

```vue
<!-- In <main> section, add: -->
<FeatureNamePage v-else-if="ui.currentTab === 'admin-feature-name'" />
```

**Checklist:**
- [ ] Import added
- [ ] Component added to template
- [ ] Tab ID matches AdminHub.vue
- [ ] Positioned logically in component list

---

## Step 5: Add Menu Item to AdminHub.vue

**File:** `src/components/features/AdminHub.vue`

### 5a: Add to sections object

```javascript
// Around line 96-145, find the appropriate section:

const sections = {
  dailyCare: [
    { id: 'daily-rounds', icon: '🌅', label: 'Morning Rounds' },
    // ... add new feature here if it belongs in this section
    { id: 'feature-name', icon: '✨', label: 'Feature Name' },
  ],
  // OR add to different section:
  operations: [
    // ...
    { id: 'feature-name', icon: '✨', label: 'Feature Name' },
  ],
  // etc.
}
```

### 5b: Add to featureRoutes object

```javascript
// Around line 148-180, add:

const featureRoutes = {
  'daily-rounds': 'admin-rounds',
  'rounds-history': 'admin-rounds-history',
  // ... find the list and add:
  'feature-name': 'admin-feature-name',  // maps feature ID to tab ID
}
```

**Checklist:**
- [ ] Added to appropriate section
- [ ] Icon chosen
- [ ] Label is clear
- [ ] Added to featureRoutes mapping
- [ ] Tab ID matches App.vue

---

## Step 6: Set Firestore Rules

**Location:** Firebase Console → Firestore → Rules

**Default Pattern (Staff Only Write):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Feature collection: public read, staff write
    match /featureName/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'staff' || 
                      request.auth.token.role == 'admin';
    }

  }
}
```

**Other Patterns:**

```javascript
// Admin only (read + write)
match /sensitiveData/{document=**} {
  allow read, write: if request.auth.token.role == 'admin';
}

// Public read, admin write
match /publicData/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.role == 'admin';
}

// Owner only (user can only see their own docs)
match /userData/{uid}/{document=**} {
  allow read, write: if request.auth.uid == uid;
}
```

**Checklist:**
- [ ] Rules set correctly in Firebase Console
- [ ] Read/write permissions match access level
- [ ] Rules tested with sample data
- [ ] No overly permissive rules (never `allow read, write: if true`)

---

## Step 7: Seed Sample Data (Optional but Recommended)

**Create seed script:** `src/utils/seed[FeatureName].js`

```javascript
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const seedFeatureData = async () => {
  const sampleItems = [
    {
      name: 'Sample Item 1',
      description: 'First test item',
      status: 'active',
      createdAt: new Date()
    },
    {
      name: 'Sample Item 2',
      description: 'Second test item',
      status: 'pending',
      createdAt: new Date()
    }
  ]

  try {
    for (const item of sampleItems) {
      await addDoc(collection(db, 'featureName'), item)
    }
    console.log('Feature data seeded!')
  } catch (error) {
    console.error('Seed error:', error)
  }
}
```

**Add to package.json:**

```json
{
  "scripts": {
    "seed:feature": "node -e \"import('./src/utils/seedFeatureName.js').then(m => m.seedFeatureData())\""
  }
}
```

**Checklist:**
- [ ] Sample data created
- [ ] Seed script in utils/
- [ ] Test data includes all field types
- [ ] Can run from command line
- [ ] Seed script tested

---

## Step 8: Manual Testing

### 8a: Test Create Operation
- [ ] Open feature page
- [ ] Click "+ New Item"
- [ ] Fill form with valid data
- [ ] Click Save
- [ ] Item appears in list
- [ ] Success toast shown
- [ ] Data saved to Firestore

### 8b: Test Read Operation
- [ ] Refresh page
- [ ] Items still appear
- [ ] Data loads from Firestore
- [ ] Loading state shown briefly

### 8c: Test Update Operation
- [ ] Click Edit on item
- [ ] Change some fields
- [ ] Click Save
- [ ] Item updates in list
- [ ] Data updated in Firestore

### 8d: Test Delete Operation
- [ ] Click Delete on item
- [ ] Confirm dialog appears
- [ ] Click Confirm
- [ ] Item removed from list
- [ ] Data deleted from Firestore

### 8e: Test Error Handling
- [ ] Try submit form without required fields
- [ ] Error message shown
- [ ] Try malformed data
- [ ] Error displayed gracefully

### 8f: Test Permissions
- [ ] Log in as different roles
- [ ] Admin can create/edit/delete
- [ ] Staff can read (if allowed)
- [ ] Volunteer cannot access (if admin-only)

### 8g: Test Responsive Design
- [ ] Open on desktop (1920px)
- [ ] Open on tablet (768px)
- [ ] Open on mobile (375px)
- [ ] Layout adjusts properly
- [ ] Buttons clickable on mobile

**Checklist:**
- [ ] All CRUD operations work
- [ ] Permissions enforced
- [ ] Error handling works
- [ ] Toast notifications appear
- [ ] Data persists in Firestore
- [ ] UI responsive on all devices

---

## Step 9: Documentation

### 9a: Update CODEBASE_MAP.md

Add your feature to the directory tree and describe its location.

```markdown
#### Feature Name
- `components/features/admin/FeatureNamePage.vue` - Main feature page
- `stores/featureName.js` - State management
- `components/modals/FeatureForm.vue` - Create/edit form
```

### 9b: Update README.md

If it's a major feature, add to the features list.

### 9c: Add Code Comments

Document complex logic in your component:

```javascript
// Fetch feature items on mount
onMounted(async () => {
  // Load all items from Firestore
  await store.fetchItems()
})
```

**Checklist:**
- [ ] CODEBASE_MAP.md updated
- [ ] README.md updated
- [ ] Code has helpful comments
- [ ] Developer guide references new feature

---

## Step 10: Code Review Checklist

Before marking as complete:

- [ ] Code follows Vue 3 Composition API patterns
- [ ] Components use UI component library
- [ ] Pinia store follows naming conventions
- [ ] Error handling for all async operations
- [ ] No console.log statements (use error handling)
- [ ] Responsive design tested
- [ ] Firestore rules secure
- [ ] No hardcoded values (use config/constants)
- [ ] Components properly documented
- [ ] No unused imports/variables

---

## Common Mistakes to Avoid

### ❌ Not awaiting async operations
```javascript
// BAD
const handleSave = () => {
  store.addItem(data)  // No await!
  showForm.value = false
}

// GOOD
const handleSave = async () => {
  await store.addItem(data)
  showForm.value = false
}
```

### ❌ Forgetting error handling
```javascript
// BAD
const handleSave = async () => {
  await store.addItem(data)
}

// GOOD
const handleSave = async () => {
  try {
    await store.addItem(data)
    ui.showToast('Success!', 'success')
  } catch (error) {
    ui.showToast('Error: ' + error.message, 'error')
  }
}
```

### ❌ Missing Firestore security rules
```javascript
// BAD - Anyone can read/write
match /feature/{document=**} {
  allow read, write: if true;
}

// GOOD - Restricted access
match /feature/{document=**} {
  allow read, write: if request.auth.token.role == 'admin';
}
```

### ❌ Not updating both local state and Firestore
```javascript
// BAD - Only updates Firestore
const addItem = async (data) => {
  await addDoc(collection(db, 'feature'), data)
  // Local state not updated, user doesn't see new item
}

// GOOD - Updates both
const addItem = async (data) => {
  const docRef = await addDoc(collection(db, 'feature'), data)
  items.value.push({ id: docRef.id, ...data })  // Update local state
}
```

### ❌ Creating new components outside /ui/
```javascript
// BAD - Creates custom button elsewhere
// src/components/features/CustomButton.vue

// GOOD - Use UI component or add to /ui/
import { AppButton } from '../ui'
```

---

## Feature Addition Template (Quick Reference)

```
1. Create store:              src/stores/featureName.js
2. Create page component:     src/components/features/[admin/]FeatureNamePage.vue
3. Create form (optional):    src/components/features/modals/FeatureForm.vue
4. Add route in App.vue:      Import + conditional render
5. Add menu in AdminHub.vue:  Add to sections + featureRoutes
6. Set Firestore rules:       Firebase Console
7. Seed data (optional):      src/utils/seedFeatureName.js
8. Manual testing:            Test all CRUD operations
9. Update docs:               CODEBASE_MAP.md, README.md
10. Code review:              Verify patterns and best practices
```

---

## Getting Help

- **Code examples:** See `CODE_PATTERNS.md`
- **Component patterns:** See `ARCHITECTURE.md` - Component Patterns
- **Store examples:** See `ARCHITECTURE.md` - Store Patterns
- **Existing features:** Look at similar features in codebase
- **Form handling:** `CODE_PATTERNS.md` - Form Handling Pattern
- **Error handling:** `CODE_PATTERNS.md` - Error Handling

---

**Last Updated:** June 29, 2026
**Maintained by:** Development Team
