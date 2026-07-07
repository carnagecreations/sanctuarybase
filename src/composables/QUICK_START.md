# Quick Start - Using Composables

## Copy-Paste Templates

### Template 1: List with Search
```javascript
import { useTableFilters } from '@/composables'

const items = computed(() => store.items)
const { searchQuery, sorted } = useTableFilters(items)

// Template:
// <input v-model="searchQuery" placeholder="Search...">
// <div v-for="item in sorted">{{ item.name }}</div>
```

---

### Template 2: List with Delete
```javascript
import { useTableFilters, useConfirmDelete } from '@/composables'

const items = computed(() => store.items)
const { searchQuery, sorted } = useTableFilters(items)
const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = useConfirmDelete()

const onDelete = async () => {
  await confirmDelete(async () => {
    await store.delete(itemToDelete.value.id)
  })
}

// Template:
// <AppButton @click="openConfirm(item)" size="sm">Delete</AppButton>
// <ConfirmDialog v-if="showConfirm" @confirm="onDelete" @cancel="closeConfirm" />
```

---

### Template 3: Create Form
```javascript
import { useFormModal } from '@/composables'

const { showModal, formData, openAdd, closeModal, submitForm } = useFormModal()

const onCreate = async () => {
  await submitForm(async () => {
    await store.create(formData.value)
  })
}

// Template:
// <AppButton @click="openAdd">+ Add</AppButton>
// <FormModal v-if="showModal" title="Add Item" @submit="onCreate" @cancel="closeModal">
//   <AppInput v-model="formData.name" label="Name" />
// </FormModal>
```

---

### Template 4: Create/Edit Form
```javascript
import { useFormModal } from '@/composables'

const { showModal, formData, editingItem, openAdd, openEdit, submitForm } = useFormModal()

const onSubmit = async () => {
  await submitForm(async () => {
    if (editingItem.value) {
      await store.update(formData.value)
    } else {
      await store.create(formData.value)
    }
  })
}

// Template:
// <AppButton @click="openAdd">+ Add</AppButton>
// <AppButton @click="openEdit(item)">Edit</AppButton>
// <FormModal v-if="showModal" :title="editingItem ? 'Edit' : 'Add'" @submit="onSubmit" @cancel="closeModal">
//   <AppInput v-model="formData.name" />
// </FormModal>
```

---

### Template 5: Async Operation
```javascript
import { useAsync } from '@/composables'

const { loading, error, data, execute } = useAsync(fetchData)

onMounted(() => execute())

// Template:
// <div v-if="loading">Loading...</div>
// <div v-else-if="error" class="error">{{ error }}</div>
// <div v-else>{{ data }}</div>
```

---

### Template 6: Complete List Page (Search + Filter + Delete + Add/Edit)
```javascript
import { useTableFilters, useFormModal, useConfirmDelete } from '@/composables'

const items = computed(() => store.items)
const { searchQuery, sorted } = useTableFilters(items)
const { showModal, formData, editingItem, openAdd, openEdit, submitForm } = useFormModal()
const { showConfirm, itemToDelete, openConfirm, confirmDelete } = useConfirmDelete()

const onSubmit = async () => {
  await submitForm(async () => {
    if (editingItem.value) {
      await store.update(formData.value)
    } else {
      await store.create(formData.value)
    }
  })
}

const onDelete = async () => {
  await confirmDelete(async () => {
    await store.delete(itemToDelete.value.id)
  })
}

// This replaces 100+ lines of state management!
```

---

## Common Patterns

### Inline Search
```vue
<template>
  <input v-model="searchQuery" placeholder="Search...">
  <div v-for="item in sorted">{{ item.name }}</div>
</template>
```

### Dropdown Filter
```vue
<template>
  <select @change="e => filterBy.status = e.target.value">
    <option value="">All</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
  <div v-for="item in sorted">{{ item.name }}</div>
</template>
```

### Modal with Loading
```vue
<template>
  <FormModal v-if="showModal" @submit="onSubmit">
    <AppInput v-model="formData.name" />
    <div slot="actions">
      <AppButton :loading="isSubmitting">Save</AppButton>
      <AppButton @click="closeModal">Cancel</AppButton>
    </div>
  </FormModal>
</template>
```

### Delete with Confirmation
```vue
<template>
  <AppButton @click="openConfirm(item)" size="sm" color="red">Delete</AppButton>
  <ConfirmDialog
    v-if="showConfirm"
    title="Delete item?"
    message="This cannot be undone"
    @confirm="confirmDelete(async () => store.delete(itemToDelete.id))"
    @cancel="closeConfirm"
  />
</template>
```

---

## Migration Path

1. **Identify pattern** - Which composable applies?
2. **Copy template** - Use template above
3. **Replace state** - Remove old refs
4. **Update template** - Bind to composable refs
5. **Test** - Verify functionality

---

## Tips

- **Always use `computed`** for store data passed to composables
- **Chain composables** for complex pages (filter + form + delete)
- **Reuse filterBy** object for multiple filter controls
- **Pass callbacks** to useAsync for success/error handling
- **Use editingItem** to detect if create or edit mode

---

## Troubleshooting

**Search not working?** - Make sure items is a ref/computed
**Delete not closing?** - Call closeConfirm in finally block
**Form clearing?** - closeModal auto-clears formData
**Multiple filters?** - Access as filterBy.field1, filterBy.field2

---

## Next Steps

1. Pick one component (e.g., PeoplePage)
2. Use Template 6 above
3. Replace 100 lines with 20 lines
4. Test thoroughly
5. Roll out to other components
