# Composables Usage Guide

## Overview
Four reusable composables that eliminate common patterns across 20+ components.

---

## 1. useAsync - Async/Loading/Error Handling

Replaces manual loading/error state and try/catch blocks.

### Basic Usage
```javascript
import { useAsync } from './composables'

const { loading, error, data, execute } = useAsync(fetchUsers)

onMounted(() => execute())
```

### With Callbacks
```javascript
const { loading, data, execute } = useAsync(deleteItem, {
  onSuccess: (result) => toast.success('Deleted!'),
  onError: (err) => toast.error(err.message)
})

// In template:
<AppButton @click="execute(itemId)" :loading="loading">Delete</AppButton>
```

### With Initial Data
```javascript
const { data, execute } = useAsync(fetchConfig, {
  initialData: { theme: 'light', lang: 'en' }
})
```

**Use Cases:** PeoplePage, AnimalDetail, MessageTeamPage, VolunteerHoursPage, etc.

---

## 2. useTableFilters - Search/Filter/Sort

Replaces filter/sort logic in list pages.

### Basic Usage
```javascript
import { useTableFilters } from './composables'

const volunteers = ref([...])
const { searchQuery, sorted } = useTableFilters(volunteers)

// In template:
<input v-model="searchQuery" placeholder="Search...">
<div v-for="item in sorted">{{ item.name }}</div>
```

### With Custom Sort
```javascript
const { searchQuery, sortBy, sorted } = useTableFilters(users, {
  defaultSort: 'createdAt'
})

// Change sort dynamically:
<AppSelect v-model="sortBy" :options="['name', 'createdAt', 'email']" />
```

### With Field Filters
```javascript
const { filterBy, sorted } = useTableFilters(people)

// Filter by role:
<select @change="e => filterBy.role = e.target.value">
  <option value="">All</option>
  <option value="admin">Admin</option>
  <option value="staff">Staff</option>
</select>

// sorted will now only show filtered results
```

### Clear Filters
```javascript
const { clearFilters } = useTableFilters(items)

<AppButton @click="clearFilters">Reset</AppButton>
```

**Use Cases:** VolunteerHoursPage, PeoplePage, SafeHousesPage, AnimalsPage, etc.

---

## 3. useConfirmDelete - Delete Confirmation Modal

Replaces delete modal state and confirmation logic.

### Basic Usage
```javascript
import { useConfirmDelete } from './composables'

const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = useConfirmDelete()

const onDeleteClick = (item) => {
  openConfirm(item)
}

const onConfirmDelete = async () => {
  await confirmDelete(async () => {
    await peopleStore.deletePerson(itemToDelete.value.id)
  })
}
```

### In Template
```vue
<AppButton size="sm" @click="openConfirm(item)">Delete</AppButton>

<ConfirmDialog
  v-if="showConfirm"
  :title="`Delete ${itemToDelete?.name}?`"
  message="This action cannot be undone."
  @confirm="onConfirmDelete"
  @cancel="closeConfirm"
/>
```

### With Loading State
```javascript
const { isDeleting, itemToDelete, confirmDelete } = useConfirmDelete()

// Dialog shows loading state while isDeleting is true
<ConfirmDialog
  :loading="isDeleting"
  @confirm="confirmDelete(deleteFunction)"
/>
```

**Use Cases:** QuarantinePage, SafeHousesPage, PeoplePage, any list with delete action.

---

## 4. useFormModal - Form Lifecycle Management

Replaces form state and modal logic for create/edit operations.

### Basic Usage - Create Only
```javascript
import { useFormModal } from './composables'

const { showModal, formData, openAdd, closeModal, submitForm } = useFormModal()

const onAddClick = () => {
  openAdd({ name: '', email: '' })
}

const onSubmit = async () => {
  await submitForm(async () => {
    await peopleStore.createPerson(formData.value)
  })
}
```

### With Create/Edit
```javascript
const { showModal, formData, editingItem, openAdd, openEdit, submitForm } = useFormModal()

const onAddClick = () => openAdd()
const onEditClick = (item) => openEdit(item)

const onSubmit = async () => {
  await submitForm(async () => {
    if (editingItem.value) {
      await peopleStore.updatePerson(formData.value)
    } else {
      await peopleStore.createPerson(formData.value)
    }
  })
}
```

### In Template
```vue
<AppButton @click="onAddClick">+ Add Person</AppButton>

<FormModal
  v-if="showModal"
  :title="editingItem ? 'Edit Person' : 'Add Person'"
  :loading="isSubmitting"
  @submit="onSubmit"
  @cancel="closeModal"
>
  <AppInput v-model="formData.name" label="Name" required />
  <AppInput v-model="formData.email" label="Email" type="email" required />
</FormModal>
```

**Use Cases:** PeoplePage, SafeHousesPage, QuarantinePage, any create/edit flow.

---

## Migration Examples

### Before (PeoplePage snippet):
```javascript
const search = ref('')
const showCreate = ref(false)
const loading = ref(false)
const error = ref(null)
const newUser = ref({})

const filtered = computed(() => {
  let list = volunteers.value
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(v =>
    v.name?.toLowerCase().includes(q) ||
    v.email?.toLowerCase().includes(q)
  )
})

const handleCreate = async () => {
  loading.value = true
  try {
    await peopleStore.createPerson(newUser.value)
    showCreate.value = false
    newUser.value = {}
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
```

### After (Using composables):
```javascript
const volunteers = computed(() => peopleStore.people)
const { searchQuery, sorted } = useTableFilters(volunteers)
const { showModal, formData, submitForm } = useFormModal()

const handleCreate = () => submitForm(async () => {
  await peopleStore.createPerson(formData.value)
})
```

**Reduction:** 30+ lines → 5 lines

---

## Summary

| Composable | Replaces | Saves |
|-----------|----------|-------|
| useAsync | loading/error/try-catch | 10-15 lines |
| useTableFilters | filter/sort logic | 20-30 lines |
| useConfirmDelete | delete modal state | 20-25 lines |
| useFormModal | form state/modal | 30-40 lines |

**Total impact:** 20+ components * 50-100 lines saved = 1000+ lines eliminated
