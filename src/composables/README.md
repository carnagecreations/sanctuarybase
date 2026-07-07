# Composables Module

Reusable Vue 3 composables for common patterns across the application.

## Quick Reference

### useAsync
Manages async operations with loading, error, and data states.

```javascript
const { loading, error, data, execute } = useAsync(fetchUsers)
await execute()
```

**API:**
- `loading` - Boolean ref, true while async operation running
- `error` - String ref, contains error message if failed
- `data` - Ref with async result
- `execute(...args)` - Run the async function with optional args

**Options:**
- `initialData` - Set initial data value
- `onSuccess(data)` - Callback when completed
- `onError(err)` - Callback on error

---

### useTableFilters
Implements search, filter, and sort logic for lists.

```javascript
const { searchQuery, sorted } = useTableFilters(items)
// In template: <input v-model="searchQuery"> <div v-for="item in sorted">
```

**API:**
- `searchQuery` - Ref, searches all object properties
- `sortBy` - Ref, column to sort by
- `filterBy` - Object ref, { fieldName: value } filters
- `filtered` - Computed, results after search/filter (before sort)
- `sorted` - Computed, results after search/filter/sort
- `clearFilters()` - Reset all filters and search

**Options:**
- `defaultSort` - Default sort column (default: 'name')

---

### useConfirmDelete
Manages delete confirmation modal state.

```javascript
const { showConfirm, itemToDelete, openConfirm, confirmDelete } = useConfirmDelete()
```

**API:**
- `showConfirm` - Boolean ref, show/hide modal
- `itemToDelete` - Ref, item pending deletion
- `isDeleting` - Boolean ref, true while deleting
- `openConfirm(item)` - Show modal and set item
- `closeConfirm()` - Hide modal and clear item
- `confirmDelete(deleteFunction)` - Execute delete and close modal

**Usage:**
```javascript
const onDelete = async () => {
  await confirmDelete(async () => {
    await store.delete(itemToDelete.value.id)
  })
}
```

---

### useFormModal
Manages form modal state for create/edit operations.

```javascript
const { showModal, formData, editingItem, openAdd, openEdit, submitForm } = useFormModal()
```

**API:**
- `showModal` - Boolean ref, show/hide modal
- `formData` - Ref, form data object
- `editingItem` - Ref, item being edited (null if creating)
- `isSubmitting` - Boolean ref, true while submitting
- `openAdd(template)` - Open modal for creating with optional template
- `openEdit(item, template)` - Open modal for editing
- `closeModal()` - Close modal and clear state
- `submitForm(submitFunction)` - Execute submit and close modal

**Usage:**
```javascript
const onSubmit = async () => {
  await submitForm(async () => {
    if (editingItem.value) {
      await store.update(formData.value)
    } else {
      await store.create(formData.value)
    }
  })
}
```

---

## Files

- `useAsync.js` - Async operation handler
- `useTableFilters.js` - List filtering and sorting
- `useConfirmDelete.js` - Delete confirmation modal
- `useFormModal.js` - Form modal lifecycle
- `index.js` - Central export
- `USAGE.md` - Detailed usage examples
- `INTEGRATION_CHECKLIST.md` - Phase 3 integration plan
- `README.md` - This file

---

## Imports

```javascript
// Named imports
import { useAsync, useTableFilters, useConfirmDelete, useFormModal } from '@/composables'

// Or from index
import { useAsync } from '@/composables/useAsync'
```

---

## Benefits

1. **Eliminates 1000+ lines** of duplicated logic
2. **Consistent patterns** across 20+ components
3. **Single source of truth** for common operations
4. **Easy testing** - composables tested, components simplified
5. **Fast development** - copy-paste usage instead of rewriting

---

## Component Compatibility

These composables work with:
- Vue 3 Composition API
- All UI components (AppButton, AppInput, AppCard, etc.)
- Pinia stores
- Async/await operations

---

## See Also

- `USAGE.md` - Detailed examples for each composable
- `INTEGRATION_CHECKLIST.md` - Phase 3 integration plan
