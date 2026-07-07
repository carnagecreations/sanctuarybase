import { ref } from 'vue'

/**
 * Reusable form modal lifecycle composable
 * Manages form state for create/edit operations
 *
 * @example
 * const { showModal, formData, editingItem, openAdd, openEdit, closeModal, submitForm } = useFormModal()
 *
 * // In template:
 * <AppButton @click="openAdd()">+ Add Item</AppButton>
 * <FormModal
 *   v-if="showModal"
 *   :title="editingItem ? 'Edit Item' : 'Add Item'"
 *   :loading="isSubmitting"
 *   @submit="submitForm(async () => {
 *     if (editingItem) {
 *       await store.updateItem(formData)
 *     } else {
 *       await store.createItem(formData)
 *     }
 *   })"
 *   @cancel="closeModal"
 * >
 *   <AppInput v-model="formData.name" label="Name" />
 * </FormModal>
 *
 * @example
 * const { openEdit, formData } = useFormModal()
 * const handleEditClick = (item) => {
 *   openEdit(item, { name: '', email: '' })
 * }
 */
export const useFormModal = () => {
  const showModal = ref(false)
  const isSubmitting = ref(false)
  const editingItem = ref(null)
  const formData = ref({})

  const openAdd = (template = {}) => {
    editingItem.value = null
    formData.value = { ...template }
    showModal.value = true
  }

  const openEdit = (item, template = {}) => {
    editingItem.value = item
    formData.value = { ...item }
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingItem.value = null
    formData.value = {}
  }

  const submitForm = async (submitFunction) => {
    isSubmitting.value = true
    try {
      await submitFunction(formData.value)
      closeModal()
      return true
    } catch (err) {
      console.error('Form submission failed:', err)
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    showModal,
    isSubmitting,
    editingItem,
    formData,
    openAdd,
    openEdit,
    closeModal,
    submitForm
  }
}
