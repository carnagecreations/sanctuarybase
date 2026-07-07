<template>
  <div class="crm-layout">

    <!-- Side Search Panel -->
    <transition name="panel-slide">
      <PeopleFilterPanel
        v-if="showPanel"
        v-model:search-query="searchQuery"
        v-model:selected-types="selectedTypes"
        v-model:selected-statuses="selectedStatuses"
        v-model:sort-by="sortBy"
        @close="showPanel = false"
        @clear="clearFilters"
      />
    </transition>

    <!-- Overlay -->
    <div v-if="showPanel" class="panel-overlay" @click="showPanel = false" />

    <!-- Main content -->
    <div class="crm-main">

      <!-- Back button -->
      <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

      <!-- Page header -->
      <div class="page-header">
        <h1>👥 People & CRM</h1>
        <AppButton variant="primary" @click="openAddForm(null)">+ Add Person</AppButton>
      </div>

      <!-- Top bar -->
      <div class="top-bar">
        <div class="top-left">
          <button class="icon-btn" @click="showPanel = !showPanel" title="Search & Filter">
            <span>🔍</span>
            <span v-if="activeFilterCount" class="filter-badge">{{ activeFilterCount }}</span>
          </button>
          <div class="result-count">{{ filteredPeople.length }} people</div>
        </div>
        <div class="top-right">
          <select v-model="sortBy" class="mini-select">
            <option value="name">A–Z</option>
            <option value="name-desc">Z–A</option>
            <option value="type">By Type</option>
            <option value="newest">Newest</option>
          </select>
          <button class="icon-btn" title="Export CSV" @click="exportCSV">⬇️</button>
        </div>
      </div>

      <!-- Type quick filter pills -->
      <div class="pill-row">
        <button class="pill" :class="{ active: selectedTypes.length === personTypes.length }" @click="selectAllTypes">All</button>
        <button
          v-for="type in personTypes"
          :key="type"
          class="pill"
          :class="{ active: selectedTypes.length !== personTypes.length && selectedTypes.includes(type) }"
          @click="soloType(type)"
        >
          {{ typeIcons[type] }} {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          <span class="pill-count">{{ getPeopleByType(type).length }}</span>
        </button>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-chip" v-for="(val, key) in stats" :key="key">
          <div class="stat-num">{{ val }}</div>
          <div class="stat-lbl">{{ key }}</div>
        </div>
      </div>

      <!-- Add / Edit Form -->
      <PersonForm
        v-if="showModal"
        :form="formData"
        :editing="editingItem"
        @save="savePerson"
        @cancel="cancelForm"
      />

      <!-- People list -->
      <PeopleList
        :people="sortedPeople"
        :loading="loading"
        @select="person => selectedPerson = person"
        @edit="openAddForm"
        @remove="person => removePerson(person.id, person.name)"
      />

    </div>

    <!-- Detail drawer -->
    <transition name="drawer-slide">
      <PersonDetailDrawer
        v-if="selectedPerson && !showModal"
        :person="selectedPerson"
        @close="selectedPerson = null"
        @edit="person => { openAddForm(person); selectedPerson = null }"
        @update:person="person => selectedPerson = person"
      />
    </transition>

    <!-- Delete confirmation dialog -->
    <ConfirmDeleteDialog
      v-if="showConfirm && itemToDelete"
      :person="itemToDelete"
      @cancel="closeConfirm"
      @confirm="confirmRemovePerson"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AppButton } from '../../ui'
import { usePeopleStore } from '../../../stores/people'
import { useUIStore } from '../../../stores/ui'
import { exportPeopleCSV } from '../../../utils/csv'
import { useTableFilters } from '../../../composables/useTableFilters'
import { useFormModal } from '../../../composables/useFormModal'
import { useConfirmDelete } from '../../../composables/useConfirmDelete'
import { personTypes, statusOptions, typeIcons } from './people/personDisplay'
import PeopleFilterPanel from './people/PeopleFilterPanel.vue'
import PersonForm from './people/PersonForm.vue'
import PeopleList from './people/PeopleList.vue'
import PersonDetailDrawer from './people/PersonDetailDrawer.vue'
import ConfirmDeleteDialog from './people/ConfirmDeleteDialog.vue'

const peopleStore = usePeopleStore()
const ui = useUIStore()

// Initialize composables
const tableFilters = useTableFilters(computed(() => Array.isArray(peopleStore.people) ? peopleStore.people : []))
const formModal = useFormModal()
const deleteConfirm = useConfirmDelete()

// Destructure composable states
const { searchQuery, sortBy, filterBy, clearFilters: clearTableFilters } = tableFilters
const { showModal, formData, editingItem, openAdd, openEdit, closeModal, submitForm } = formModal
const { showConfirm, itemToDelete, openConfirm, closeConfirm, confirmDelete } = deleteConfirm

// UI state
const showPanel = ref(false)
const selectedPerson = ref(null)
const selectedTypes = ref(['volunteer', 'foster', 'donor', 'adopter'])
const selectedStatuses = ref(['active', 'inactive', 'pending'])

// Initialize sort with custom default
sortBy.value = 'name'

const defaultForm = () => ({
  name: '', types: ['volunteer'], email: '', phone: '', location: '',
  status: 'active', notes: '', tags: [],
})

const loading = computed(() => peopleStore.loading)

const filteredPeople = computed(() => {
  let results = Array.isArray(peopleStore.people) ? peopleStore.people : []

  // Custom search across specific fields
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q)
    )
  }

  // Type filter with multi-select support
  if (selectedTypes.value.length < personTypes.length) {
    results = results.filter(p => {
      const pTypes = Array.isArray(p.types) ? p.types : (p.type ? [p.type] : [])
      return pTypes.some(t => selectedTypes.value.includes(t))
    })
  }

  // Status filter with multi-select support
  if (selectedStatuses.value.length < statusOptions.length) {
    results = results.filter(p => selectedStatuses.value.includes(p.status || 'active'))
  }

  return results
})

const sortedPeople = computed(() => {
  const list = [...filteredPeople.value]
  if (sortBy.value === 'name') return list.sort((a, b) => a.name?.localeCompare(b.name))
  if (sortBy.value === 'name-desc') return list.sort((a, b) => b.name?.localeCompare(a.name))
  if (sortBy.value === 'type') {
    return list.sort((a, b) => {
      const aTypes = Array.isArray(a.types) ? a.types[0] : a.type || ''
      const bTypes = Array.isArray(b.types) ? b.types[0] : b.type || ''
      return aTypes.localeCompare(bTypes)
    })
  }
  if (sortBy.value === 'status') return list.sort((a, b) => (a.status || '').localeCompare(b.status || ''))
  if (sortBy.value === 'newest') return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  return list
})

const stats = computed(() => ({
  Total: peopleStore.people.length,
  Volunteers: getPeopleByType('volunteer').length,
  Fosters: getPeopleByType('foster').length,
  Donors: getPeopleByType('donor').length,
  Adopters: getPeopleByType('adopter').length,
}))

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedTypes.value.length < personTypes.length) count++
  if (selectedStatuses.value.length < statusOptions.length) count++
  if (searchQuery.value.trim()) count++
  return count
})

const getPeopleByType = (type) => (Array.isArray(peopleStore.people) ? peopleStore.people : []).filter(p => {
  const pTypes = Array.isArray(p.types) ? p.types : (p.type ? [p.type] : [])
  return pTypes.includes(type)
})

const selectAllTypes = () => { selectedTypes.value = [...personTypes] }
const soloType = (type) => {
  if (selectedTypes.value.length === 1 && selectedTypes.value[0] === type) {
    selectedTypes.value = [...personTypes]
  } else {
    selectedTypes.value = [type]
  }
}

const clearFilters = () => {
  clearTableFilters()
  selectedTypes.value = [...personTypes]
  selectedStatuses.value = [...statusOptions]
  sortBy.value = 'name'
}

const openAddForm = (person) => {
  if (person) {
    openEdit(person, defaultForm())
  } else {
    openAdd(defaultForm())
  }
  selectedPerson.value = null
}

const cancelForm = () => {
  closeModal()
}

const savePerson = async () => {
  if (!formData.value.name.trim()) { ui.showToast('Name is required', 'error'); return }
  await submitForm(async () => {
    if (editingItem.value) {
      await peopleStore.updatePerson(editingItem.value.id, formData.value)
      ui.showToast('Person updated')
    } else {
      await peopleStore.addPerson(formData.value)
      ui.showToast('Person added')
    }
  }).catch(() => {
    ui.showToast('Error saving person', 'error')
  })
}

const removePerson = async (id, name) => {
  const person = peopleStore.people.find(p => p.id === id)
  if (!person) return

  openConfirm(person)
}

const confirmRemovePerson = async () => {
  await confirmDelete(async (person) => {
    await peopleStore.deletePerson(person.id)
    ui.showToast('Person removed')
  }).catch(() => {
    ui.showToast('Error deleting', 'error')
  })
}

const exportCSV = () => {
  exportPeopleCSV(sortedPeople.value)
  ui.showToast(`Exported ${sortedPeople.value.length} people`)
}

onMounted(() => peopleStore.fetchPeople())
</script>

<style scoped>
/* Layout */
.crm-layout {
  display: flex;
  min-height: 100vh;
  padding-bottom: 90px;
  position: relative;
}

.crm-main {
  flex: 1;
  padding: 14px;
  max-width: 780px;
  margin: 0 auto;
  width: 100%;
}

/* Back button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: 16px;
}
.back-btn:hover { color: var(--ink); border-color: var(--border-2); }

/* Panel overlay */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  z-index: 199;
}

/* Panel + drawer slide transitions (applied to child component root elements) */
.panel-slide-enter-active, .panel-slide-leave-active { transition: transform .25s ease; }
.panel-slide-enter-from, .panel-slide-leave-to { transform: translateX(-100%); }

.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform .25s ease; }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }

/* Page header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  margin: 0;
  letter-spacing: -.01em;
}

/* Top bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
.top-left, .top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all .15s;
}
.icon-btn:hover { border-color: var(--mint); }
.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: var(--coral);
  color: #fff;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.result-count { font-size: 12px; color: var(--ink-3); font-weight: 700; }

.mini-select {
  padding: 6px 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-size: 11px;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
}

/* Pills */
.pill-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.pill {
  padding: 8px 14px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 20px;
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pill:hover { border-color: var(--mint); color: var(--ink); }
.pill.active { background: var(--mint); border-color: var(--mint); color: white; box-shadow: 0 4px 12px rgba(78,255,197,.2); }
.pill-count {
  background: rgba(0,0,0,.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
}

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.stat-chip {
  padding: 16px 12px;
  background: linear-gradient(135deg, rgba(78,255,197,.1), rgba(255,107,157,.05));
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  text-align: center;
  transition: all .15s;
}
.stat-chip:hover {
  border-color: var(--mint);
  background: linear-gradient(135deg, rgba(78,255,197,.15), rgba(255,107,157,.1));
}
.stat-num { font-family: 'Fredoka One', sans-serif; font-size: 28px; color: var(--mint); font-weight: 900; }
.stat-lbl { font-size: 10px; text-transform: uppercase; color: var(--ink-3); font-weight: 700; letter-spacing: .04em; margin-top: 4px; }
</style>
