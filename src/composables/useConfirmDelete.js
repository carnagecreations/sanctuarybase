import { ref } from 'vue'

/**
 * Reusable delete confirmation composable
 * Manages delete modal state and confirmation flow
 *
 * @example
 * const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = useConfirmDelete()
 *
 * // In template:
 * <AppButton @click="openConfirm(item)" size="sm">Delete</AppButton>
 * <ConfirmDialog
 *   v-if="showConfirm"
 *   :title="`Delete ${itemToDelete?.name}?`"
 *   message="This action cannot be undone."
 *   @confirm="confirmDelete(async () => await deleteItem(itemToDelete.id))"
 *   @cancel="closeConfirm"
 * />
 *
 * @example
 * const { confirmDelete, isDeleting } = useConfirmDelete()
 * const onConfirmDelete = () => {
 *   confirmDelete(async (item) => {
 *     await peopleStore.deletePerson(item.id)
 *   })
 * }
 */
export const useConfirmDelete = () => {
  const showConfirm = ref(false)
  const itemToDelete = ref(null)
  const isDeleting = ref(false)

  const openConfirm = (item) => {
    itemToDelete.value = item
    showConfirm.value = true
  }

  const closeConfirm = () => {
    showConfirm.value = false
    itemToDelete.value = null
  }

  const confirmDelete = async (deleteFunction) => {
    if (!itemToDelete.value) return false

    isDeleting.value = true
    try {
      await deleteFunction(itemToDelete.value)
      closeConfirm()
      return true
    } catch (err) {
      console.error('Delete failed:', err)
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  return {
    showConfirm,
    itemToDelete,
    isDeleting,
    openConfirm,
    closeConfirm,
    confirmDelete
  }
}
