import { ref } from 'vue'

/**
 * Reusable async handling composable
 * Manages loading, error, and data state for async operations
 *
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @param {*} options.initialData - Initial data value (default: null)
 * @param {Function} options.onSuccess - Callback on successful completion
 * @param {Function} options.onError - Callback on error
 *
 * @example
 * const { loading, error, data, execute } = useAsync(fetchUsers)
 * await execute()
 *
 * @example
 * const { loading, error, data, execute } = useAsync(deleteItem, {
 *   onSuccess: () => toast.success('Deleted!'),
 *   onError: (err) => toast.error(err.message)
 * })
 */
export const useAsync = (asyncFn, options = {}) => {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(options.initialData || null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null
    try {
      data.value = await asyncFn(...args)
      if (options.onSuccess) {
        options.onSuccess(data.value)
      }
    } catch (err) {
      error.value = err.message || 'An error occurred'
      if (options.onError) {
        options.onError(err)
      }
      console.error('useAsync error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    execute
  }
}
