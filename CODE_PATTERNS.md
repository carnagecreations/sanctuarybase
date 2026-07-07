# SanctuaryBase v2 - Code Patterns

Common patterns and templates for writing code in this project.

---

## Table of Contents

1. [Vue 3 Composition API](#vue-3-composition-api)
2. [Using Pinia Stores](#using-pinia-stores)
3. [Component Structure Template](#component-structure-template)
4. [Form Handling](#form-handling)
5. [Modal/Dialog Pattern](#modaldialog-pattern)
6. [Table/List Pattern](#tablelist-pattern)
7. [Firestore Operations](#firestore-operations)
8. [Error Handling](#error-handling)
9. [Async/Await Patterns](#asyncawait-patterns)
10. [Styling Patterns](#styling-patterns)

---

## Vue 3 Composition API

Vue 3 uses the **Composition API** with `<script setup>` syntax. Here are common patterns:

### Reactive State

```vue
<script setup>
import { ref, reactive } from 'vue'

// Simple reactive value
const count = ref(0)
const increment = () => count.value++

// Reactive object
const user = reactive({
  name: 'Sarah',
  email: 'sarah@example.com',
  role: 'admin'
})

// Update properties
user.name = 'John'
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <p>User: {{ user.name }} ({{ user.role }})</p>
  </div>
</template>
```

### Computed Values

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// Computed read-only
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// Computed with setter
const count = ref(0)
const double = computed({
  get: () => count.value * 2,
  set: (val) => { count.value = val / 2 }
})
</script>

<template>
  <div>
    <p>{{ fullName }}</p>
    <p>Double: {{ double }}</p>
  </div>
</template>
```

### Watchers

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const query = ref('')
const results = ref([])

// Watch a single property
watch(query, async (newQuery) => {
  if (newQuery.length > 2) {
    results.value = await searchAPI(newQuery)
  }
})

// Watch multiple properties
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`Name changed: ${newFirst} ${newLast}`)
})

// watchEffect - automatically tracks dependencies
watchEffect(() => {
  console.log(`Count is now: ${count.value}`)
})

// Watch with options
watch(
  () => user.name,
  (newName) => {
    console.log(`User renamed to: ${newName}`)
  },
  { immediate: true } // run immediately on mount
)
</script>
```

### Lifecycle Hooks

```vue
<script setup>
import { onMounted, onUnmounted, onUpdated } from 'vue'

// Component mounted (similar to Vue 2 created/mounted)
onMounted(() => {
  console.log('Component mounted')
  fetchData()
  setupEventListeners()
})

// Component updated
onUpdated(() => {
  console.log('Component re-rendered')
})

// Component unmounted
onUnmounted(() => {
  console.log('Component unmounted')
  cleanupEventListeners()
})
</script>
```

---

## Using Pinia Stores

### Basic Store Usage

```vue
<script setup>
import { useAnimalsStore } from '../stores/animals'

// Get store instance
const store = useAnimalsStore()

// Access state
console.log(store.animals)      // array
console.log(store.loading)      // boolean

// Call actions
await store.fetchAnimals()
await store.addAnimal(newAnimal)

// Computed getters
console.log(store.animalCount())
</script>

<template>
  <div>
    <div v-if="store.loading">Loading...</div>
    <div v-for="animal in store.animals">
      {{ animal.name }}
    </div>
  </div>
</template>
```

### Accessing Store State in Computed

```vue
<script setup>
import { computed } from 'vue'
import { useAnimalsStore } from '../stores/animals'

const store = useAnimalsStore()

// Computed based on store state
const adoptedCount = computed(() => {
  return store.animals.filter(a => a.status === 'adopted').length
})

// Computed with reactive list
const sortedAnimals = computed(() => {
  return [...store.animals].sort((a, b) => a.name.localeCompare(b.name))
})
</script>
```

### Creating a New Store

```javascript
// src/stores/newFeature.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useNewFeatureStore = defineStore('newFeature', () => {
  // STATE
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filter = ref('')

  // GETTERS
  const filteredItems = computed(() => {
    if (!filter.value) return items.value
    return items.value.filter(item => 
      item.name.toLowerCase().includes(filter.value.toLowerCase())
    )
  })

  const itemCount = computed(() => items.value.length)

  // ACTIONS
  const fetchItems = async () => {
    loading.value = true
    error.value = null
    try {
      const snapshot = await getDocs(collection(db, 'newFeature'))
      items.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addItem = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'newFeature'), {
        ...data,
        createdAt: new Date()
      })
      items.value.push({ id: docRef.id, ...data })
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateItem = async (id, data) => {
    try {
      await updateDoc(doc(db, 'newFeature', id), data)
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], ...data }
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'newFeature', id))
      items.value = items.value.filter(i => i.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const setFilter = (value) => {
    filter.value = value
  }

  // RETURN PUBLIC API
  return {
    // State
    items,
    loading,
    error,
    filter,
    
    // Getters
    filteredItems,
    itemCount,
    
    // Actions
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    setFilter
  }
})
```

---

## Component Structure Template

### Basic Feature Component

```vue
<!-- src/components/features/ExampleFeature.vue -->
<template>
  <PageContainer>
    <!-- Header -->
    <div class="page-header">
      <button v-if="showBack" class="back-btn" @click="goBack">← Back</button>
      <h1>{{ title }}</h1>
      <AppButton v-if="canCreate" variant="primary" @click="showForm = true">
        + New Item
      </AppButton>
    </div>

    <!-- Form -->
    <ItemForm
      v-if="showForm"
      @save="handleSave"
      @cancel="showForm = false"
      :initial="editingItem"
    />

    <!-- Filters -->
    <div v-if="items.length > 0" class="filters">
      <AppInput
        v-model="searchQuery"
        placeholder="Search..."
        @update:model-value="handleSearch"
      />
      <AppSelect
        v-model="selectedStatus"
        :options="statusOptions"
        @update:model-value="handleFilterChange"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <SkeletonLoader :count="3" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <EmptyState
        icon="📭"
        title="No items found"
        description="Get started by creating one"
      />
    </div>

    <!-- List/Table -->
    <div v-else class="items-list">
      <AppCard
        v-for="item in filteredItems"
        :key="item.id"
        class="item-card"
      >
        <div class="item-row">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
          <div class="item-status">
            <AppBadge :variant="getStatusVariant(item.status)">
              {{ item.status }}
            </AppBadge>
          </div>
        </div>
        <div class="item-actions">
          <AppButton size="sm" @click="selectEdit(item)">Edit</AppButton>
          <AppButton size="sm" variant="danger" @click="handleDelete(item.id)">
            Delete
          </AppButton>
        </div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '../stores/feature'
import { useUIStore } from '../stores/ui'
import {
  PageContainer, AppButton, AppInput, AppSelect, AppCard,
  AppBadge, EmptyState, SkeletonLoader
} from '../ui'
import ItemForm from '../modals/ItemForm.vue'

// ===== STATE =====
const store = useStore()
const ui = useUIStore()

const showForm = ref(false)
const showBack = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('')
const editingItem = ref(null)
const title = 'Items'

// ===== COMPUTED =====
const loading = computed(() => store.loading)
const items = computed(() => store.items)
const canCreate = computed(() => ui.user?.role === 'admin')

const filteredItems = computed(() => {
  let result = items.value

  if (searchQuery.value) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    result = result.filter(item => item.status === selectedStatus.value)
  }

  return result
})

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' }
]

// ===== LIFECYCLE =====
onMounted(async () => {
  await store.fetchItems()
})

// ===== HANDLERS =====
const goBack = () => {
  ui.setCurrentTab('admin-hub')
}

const handleSearch = (value) => {
  searchQuery.value = value
}

const handleFilterChange = (value) => {
  selectedStatus.value = value
}

const handleSave = async (itemData) => {
  try {
    if (editingItem.value) {
      await store.updateItem(editingItem.value.id, itemData)
      ui.showToast('Item updated', 'success')
    } else {
      await store.addItem(itemData)
      ui.showToast('Item created', 'success')
    }
    showForm.value = false
    editingItem.value = null
  } catch (error) {
    ui.showToast(`Error: ${error.message}`, 'error')
  }
}

const selectEdit = (item) => {
  editingItem.value = item
  showForm.value = true
}

const handleDelete = async (id) => {
  const confirmed = await ui.confirm({
    title: 'Delete item?',
    message: 'This action cannot be undone.',
    danger: true,
    confirmText: 'Delete',
    cancelText: 'Cancel'
  })

  if (confirmed) {
    try {
      await store.deleteItem(id)
      ui.showToast('Item deleted', 'success')
    } catch (error) {
      ui.showToast(`Error: ${error.message}`, 'error')
    }
  }
}

const getStatusVariant = (status) => {
  const variants = {
    active: 'success',
    inactive: 'default',
    pending: 'warning'
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
  flex-wrap: wrap;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0.5rem;
}

.back-btn:hover {
  opacity: 0.8;
}

.page-header h1 {
  margin: 0;
  flex: 1;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters > * {
  flex: 1;
  min-width: 200px;
}

.loading-state {
  margin-top: 2rem;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
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
  margin-bottom: 1rem;
  gap: 1rem;
}

.item-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.item-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.item-status {
  flex-shrink: 0;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters {
    flex-direction: column;
  }

  .filters > * {
    min-width: unset;
  }

  .item-row {
    flex-direction: column;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
```

---

## Form Handling

### Simple Form Pattern

```vue
<template>
  <AppCard class="form-card">
    <form @submit.prevent="handleSubmit">
      <!-- Text input -->
      <div class="form-group">
        <label for="name">Name *</label>
        <AppInput
          id="name"
          v-model="form.name"
          placeholder="Enter name"
          required
        />
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <!-- Text area -->
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter description..."
          rows="4"
        ></textarea>
      </div>

      <!-- Select dropdown -->
      <div class="form-group">
        <label for="status">Status *</label>
        <AppSelect
          id="status"
          v-model="form.status"
          :options="statusOptions"
          required
        />
      </div>

      <!-- Checkbox -->
      <div class="form-group">
        <label>
          <input
            v-model="form.isActive"
            type="checkbox"
          />
          Active
        </label>
      </div>

      <!-- Radio buttons -->
      <div class="form-group">
        <label>Priority</label>
        <div class="radio-group">
          <label>
            <input
              v-model="form.priority"
              type="radio"
              value="low"
            />
            Low
          </label>
          <label>
            <input
              v-model="form.priority"
              type="radio"
              value="medium"
            />
            Medium
          </label>
          <label>
            <input
              v-model="form.priority"
              type="radio"
              value="high"
            />
            High
          </label>
        </div>
      </div>

      <!-- Form actions -->
      <div class="form-actions">
        <AppButton
          variant="primary"
          type="submit"
          :disabled="!isFormValid || submitting"
        >
          {{ submitting ? 'Saving...' : 'Save' }}
        </AppButton>
        <AppButton
          type="button"
          @click="resetForm"
        >
          Cancel
        </AppButton>
      </div>
    </form>
  </AppCard>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { AppCard, AppButton, AppInput, AppSelect } from '../ui'

// Props
const props = defineProps({
  initial: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// State
const form = reactive({
  name: props.initial?.name || '',
  description: props.initial?.description || '',
  status: props.initial?.status || 'active',
  isActive: props.initial?.isActive !== false,
  priority: props.initial?.priority || 'medium'
})

const errors = reactive({
  name: ''
})

const submitting = ref(false)

// Options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' }
]

// Computed
const isFormValid = computed(() => {
  return form.name.trim().length > 0
})

// Methods
const validateForm = () => {
  errors.name = ''

  if (!form.name.trim()) {
    errors.name = 'Name is required'
    return false
  }

  if (form.name.length < 3) {
    errors.name = 'Name must be at least 3 characters'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    emit('save', { ...form })
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.name = props.initial?.name || ''
  form.description = props.initial?.description || ''
  form.status = props.initial?.status || 'active'
  form.isActive = props.initial?.isActive !== false
  form.priority = props.initial?.priority || 'medium'
  errors.name = ''
  emit('cancel')
}
</script>

<style scoped>
.form-card {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background: var(--color-surface-0);
  color: var(--color-text-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group input[type="checkbox"],
.form-group input[type="radio"] {
  margin-right: 0.5rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.form-group .error {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
  justify-content: flex-end;
}
</style>
```

---

## Modal/Dialog Pattern

```vue
<!-- src/components/features/modals/ItemModal.vue -->
<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2>{{ title }}</h2>
            <button class="close-btn" @click="closeModal" aria-label="Close">✕</button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <slot name="footer">
              <AppButton @click="closeModal">Cancel</AppButton>
              <AppButton variant="primary" @click="confirm">Confirm</AppButton>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { AppButton } from '../ui'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Modal'
  }
})

const emit = defineEmits(['close', 'confirm'])

const closeModal = () => emit('close')
const confirm = () => emit('confirm')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-surface-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-content {
    max-height: 70vh;
  }
}
</style>
```

---

## Table/List Pattern

```vue
<template>
  <div class="table-container">
    <!-- Table header with search -->
    <div class="table-header">
      <AppInput v-model="searchQuery" placeholder="Search..." />
      <AppSelect v-model="sortBy" :options="sortOptions" />
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table v-if="filteredAndSorted.length > 0" class="table">
        <thead>
          <tr>
            <th @click="toggleSort('name')">
              Name
              <span class="sort-indicator" v-if="sortBy === 'name'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="toggleSort('date')">
              Date
              <span class="sort-indicator" v-if="sortBy === 'date'">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAndSorted" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ formatDate(item.date) }}</td>
            <td>
              <AppBadge :variant="getStatusVariant(item.status)">
                {{ item.status }}
              </AppBadge>
            </td>
            <td class="actions-cell">
              <AppButton size="sm" @click="editItem(item)">Edit</AppButton>
              <AppButton size="sm" variant="danger" @click="deleteItem(item.id)">Delete</AppButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="filteredAndSorted.length === 0" class="empty-state">
      <EmptyState
        title="No items"
        description="No items match your search"
      />
    </div>

    <!-- Pagination (optional) -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AppInput, AppSelect, AppButton, AppBadge, EmptyState } from '../ui'

const props = defineProps({
  items: Array,
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['edit', 'delete'])

// State
const searchQuery = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'status', label: 'Status' }
]

// Computed
const filteredAndSorted = computed(() => {
  let result = props.items

  // Filter by search
  if (searchQuery.value) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Sort
  result.sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]

    if (typeof aVal === 'string') {
      return sortOrder.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortOrder.value === 'asc'
      ? aVal - bVal
      : bVal - aVal
  })

  // Pagination
  const start = (currentPage.value - 1) * props.itemsPerPage
  return result.slice(start, start + props.itemsPerPage)
})

const totalPages = computed(() => {
  const filtered = props.items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  return Math.ceil(filtered.length / props.itemsPerPage)
})

// Methods
const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const editItem = (item) => emit('edit', item)
const deleteItem = (id) => emit('delete', id)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusVariant = (status) => {
  const variants = {
    active: 'success',
    inactive: 'default',
    pending: 'warning'
  }
  return variants[status] || 'default'
}
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.table-header > * {
  flex: 1;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--color-surface-2);
  border-bottom: 2px solid var(--color-border);
}

.table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.table th:hover {
  background: var(--color-surface-3);
}

.sort-indicator {
  margin-left: 0.5rem;
  opacity: 0.7;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.table tbody tr:hover {
  background: var(--color-surface-2);
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  padding: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: var(--color-surface-2);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

---

## Firestore Operations

### Read Operations

```javascript
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../services/firebase'

// Get all documents
const fetchAll = async () => {
  const snapshot = await getDocs(collection(db, 'animals'))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Get single document
const fetchOne = async (id) => {
  const docSnap = await getDoc(doc(db, 'animals', id))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

// Query with conditions
const fetchByStatus = async (status) => {
  const q = query(collection(db, 'animals'), where('status', '==', status))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Query with ordering and limit
const fetchRecent = async (limit = 10) => {
  const q = query(
    collection(db, 'animals'),
    orderBy('createdAt', 'desc'),
    limit(limit)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Multiple conditions
const fetchFiltered = async (filters) => {
  const conditions = [
    where('status', '==', filters.status),
    where('species', '==', filters.species),
    orderBy('name', 'asc')
  ]
  const q = query(collection(db, 'animals'), ...conditions)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

### Write Operations

```javascript
import { addDoc, updateDoc, deleteDoc, doc, collection, writeBatch } from 'firebase/firestore'
import { db } from '../services/firebase'

// Create
const create = async (data) => {
  const docRef = await addDoc(collection(db, 'animals'), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return docRef.id
}

// Update
const update = async (id, data) => {
  await updateDoc(doc(db, 'animals', id), {
    ...data,
    updatedAt: new Date()
  })
}

// Delete
const delete_ = async (id) => {
  await deleteDoc(doc(db, 'animals', id))
}

// Batch operations (multiple writes in one operation)
const batchUpdate = async (updates) => {
  const batch = writeBatch(db)

  updates.forEach(({ id, data }) => {
    batch.update(doc(db, 'animals', id), {
      ...data,
      updatedAt: new Date()
    })
  })

  await batch.commit()
}

// Batch create
const batchCreate = async (items) => {
  const batch = writeBatch(db)
  const ids = []

  items.forEach(item => {
    const docRef = doc(collection(db, 'animals'))
    batch.set(docRef, {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    ids.push(docRef.id)
  })

  await batch.commit()
  return ids
}
```

---

## Error Handling

### Try/Catch Pattern

```javascript
// In store or component
try {
  const result = await someAsyncOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  // Show user-friendly message
  const message = error.code === 'permission-denied'
    ? 'You do not have permission to do this'
    : 'An error occurred. Please try again.'
  ui.showToast(message, 'error')
  throw error
}
```

### With Finally

```javascript
const loading = ref(false)

try {
  loading.value = true
  const data = await fetchData()
  // process data
} catch (error) {
  ui.showToast('Error: ' + error.message, 'error')
} finally {
  loading.value = false
}
```

### In Components

```vue
<script setup>
const store = useStore()
const error = ref(null)

const handleAction = async () => {
  error.value = null
  try {
    await store.doSomething()
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div v-if="error" class="alert alert-error">{{ error }}</div>
</template>
```

---

## Async/Await Patterns

### Sequential Operations

```javascript
// Operations one after another
const process = async () => {
  const animal = await fetchAnimal()
  const health = await fetchHealth(animal.id)
  const records = await fetchRecords(animal.id)
  return { animal, health, records }
}
```

### Parallel Operations

```javascript
// Operations simultaneously
const process = async () => {
  const [animal, health, records] = await Promise.all([
    fetchAnimal(),
    fetchHealth(animalId),
    fetchRecords(animalId)
  ])
  return { animal, health, records }
}
```

### With Timeout

```javascript
const fetchWithTimeout = (promise, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ])
}

// Usage
try {
  const data = await fetchWithTimeout(fetchData(), 3000)
} catch (error) {
  console.error('Timeout or error:', error)
}
```

---

## Styling Patterns

### Using Design Tokens

```vue
<template>
  <div class="card">
    <h2>Title</h2>
    <p>Content</p>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
}

.card h2 {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-4) 0;
}

.card p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}
</style>
```

### Responsive Design

```vue
<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }

  .card {
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .container {
    gap: var(--space-2);
  }
}
</style>
```

### Dark/Light Mode

```vue
<style scoped>
.card {
  background: var(--color-surface-1);
  color: var(--color-text-primary);
}

/* Dark mode (data-theme="dark" on html) */
:root[data-theme="dark"] .card {
  background: #1f2937;
}

/* Light mode (data-theme="light" on html) */
:root[data-theme="light"] .card {
  background: #ffffff;
}
</style>
```

---

**Last Updated:** June 28, 2026
**Maintained by:** Development Team
