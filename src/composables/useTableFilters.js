import { ref, computed } from 'vue'

/**
 * Reusable table filtering and sorting composable
 * Handles search, filtering, and sorting of arrays
 *
 * @param {Ref<Array>} items - Reactive array of items to filter
 * @param {Object} options - Configuration options
 * @param {string} options.defaultSort - Default sort column (default: 'name')
 *
 * @example
 * const { searchQuery, filtered, sorted } = useTableFilters(volunteers)
 * // In template:
 * <input v-model="searchQuery" placeholder="Search...">
 * <div v-for="item in sorted">{{ item.name }}</div>
 *
 * @example
 * const { searchQuery, sortBy, filterBy, sorted } = useTableFilters(users, {
 *   defaultSort: 'createdAt'
 * })
 * // Add filter:
 * filterBy.value.role = 'admin'
 */
export const useTableFilters = (items, options = {}) => {
  const searchQuery = ref('')
  const sortBy = ref(options.defaultSort || 'name')
  const filterBy = ref({})

  const filtered = computed(() => {
    let results = items.value || []

    // Apply search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      results = results.filter(item => {
        return Object.values(item).some(v =>
          String(v).toLowerCase().includes(q)
        )
      })
    }

    // Apply field filters
    Object.entries(filterBy.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        results = results.filter(item => item[key] === value)
      }
    })

    return results
  })

  const sorted = computed(() => {
    const list = [...filtered.value]
    if (!sortBy.value) return list

    list.sort((a, b) => {
      const aVal = a[sortBy.value]
      const bVal = b[sortBy.value]

      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal)
      }

      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })

    return list
  })

  const clearFilters = () => {
    searchQuery.value = ''
    filterBy.value = {}
    sortBy.value = options.defaultSort || 'name'
  }

  return {
    searchQuery,
    sortBy,
    filterBy,
    filtered,
    sorted,
    clearFilters
  }
}
