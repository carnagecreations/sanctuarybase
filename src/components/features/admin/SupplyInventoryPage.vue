<template>
  <PageContainer>
    <!-- Page Header -->
    <button class="back-btn" @click="ui.setCurrentTab('admin-hub')">← Admin Hub</button>

    <div class="page-header">
      <h1>📦 Supply Inventory</h1>
      <AppButton variant="primary" @click="showAddForm ? closeAddForm() : openAdd({ name: '', category: '', quantity: '', unit: 'units', reorderLevel: '', costPerUnit: '', supplier: '', notes: '' })">
        {{ showAddForm ? '✕ Cancel' : '+ Add Supply' }}
      </AppButton>
    </div>

    <!-- Low Stock Alerts -->
    <div v-if="lowStockAlerts.length > 0" class="alerts-section">
      <AlertBox type="warning">
        <div class="alert-header">⚠️ Low Stock Alert</div>
        <div class="alert-items">
          <div v-for="item in lowStockAlerts" :key="item.id" class="alert-item">
            <span class="alert-name">
              {{ item.name }}
              <span v-if="item.restockRequested" class="requested-tag">📢 Requested by {{ item.restockRequestedBy || 'a volunteer' }}</span>
            </span>
            <span class="alert-qty">{{ item.quantity }} {{ item.unit }} (reorder at {{ item.reorderLevel }})</span>
          </div>
        </div>
      </AlertBox>
    </div>

    <!-- Add Supply Form -->
    <AppCard v-if="showAddForm" class="form-card">
      <h2>Add New Supply Item</h2>
      <form @submit.prevent="handleSubmitAdd">
        <div class="form-row">
          <div class="form-group">
            <label>Item Name *</label>
            <input v-model="form.name" type="text" class="input-field" required />
          </div>
          <div class="form-group">
            <label>Category *</label>
            <AppSelect v-model="form.category" :options="categoryOptions" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Quantity *</label>
            <input v-model="form.quantity" type="number" class="input-field" min="0" required />
          </div>
          <div class="form-group">
            <label>Unit *</label>
            <AppSelect v-model="form.unit" :options="unitOptions" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Reorder Level *</label>
            <input v-model="form.reorderLevel" type="number" class="input-field" min="0" required />
          </div>
          <div class="form-group">
            <label>Cost Per Unit</label>
            <input v-model="form.costPerUnit" type="number" class="input-field" min="0" step="0.01" />
          </div>
        </div>

        <div class="form-group">
          <label>Supplier</label>
          <input v-model="form.supplier" type="text" class="input-field" placeholder="e.g., PetSupplyCo" />
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            v-model="form.notes"
            class="textarea-field"
            placeholder="Additional notes..."
            rows="3"
          ></textarea>
        </div>

        <button type="submit" class="btn-primary" :disabled="addLoading">
          {{ addLoading ? 'Adding...' : 'Add Supply' }}
        </button>
      </form>
    </AppCard>

    <!-- Filter and Search -->
    <div class="controls-section">
      <div class="filter-group">
        <label>Filter by Category:</label>
        <AppSelect
          v-model="categoryFilter.category"
          :options="[{ value: '', label: 'All Categories' }, ...categoryOptions]"
        />
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="table-wrapper">
      <table v-if="filteredSupplies.length > 0" class="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Reorder Level</th>
            <th>Status</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supply in filteredSupplies" :key="supply.id" :class="getRowClass(supply)">
            <td class="name-cell">
              {{ supply.name }}
              <span v-if="supply.restockRequested" class="requested-tag" :title="supply.restockRequestedAt">📢 Requested by {{ supply.restockRequestedBy || 'a volunteer' }}</span>
            </td>
            <td class="category-cell">{{ getCategoryLabel(supply.category) }}</td>
            <td class="qty-cell">{{ supply.quantity }} {{ supply.unit }}</td>
            <td class="reorder-cell">{{ supply.reorderLevel }} {{ supply.unit }}</td>
            <td class="status-cell">
              <span :class="['status-badge', getStatusClass(supply)]">
                {{ getStatusLabel(supply) }}
              </span>
            </td>
            <td class="supplier-cell">{{ supply.supplier || '—' }}</td>
            <td class="actions-cell">
              <button class="action-btn" @click="openRestockForm(supply.id)" title="Restock">
                ➕
              </button>
              <button class="action-btn" @click="openUseForm(supply.id)" title="Use/Decrease">
                ➖
              </button>
              <button
                v-if="getStockStatus(supply) === 'low'"
                class="action-btn order-btn"
                @click="openOrderForm(supply)"
                title="Order"
              >
                🛒
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-else icon="📦" title="No supplies yet" message="Click 'Add Supply' to get started." />
    </div>

    <!-- Restock Modal -->
    <AppModal v-if="showRestockForm" :open="true" title="Restock Item" size="sm" @close="showRestockForm = false">
      <p>{{ getCurrentSupply()?.name }}</p>
      <div class="form-group">
        <label>Add Quantity</label>
        <input v-model="restockAmount" type="number" class="input-field" min="1" />
      </div>
      <template #actions>
        <button class="btn-secondary" @click="showRestockForm = false">Cancel</button>
        <button class="btn-primary" @click="submitRestock" :disabled="restockLoading">
          {{ restockLoading ? 'Restocking...' : 'Restock' }}
        </button>
      </template>
    </AppModal>

    <!-- Use/Decrease Modal -->
    <AppModal v-if="showUseForm" :open="true" title="Record Usage" size="sm" @close="showUseForm = false">
      <p>{{ getCurrentSupply()?.name }}</p>
      <div class="form-group">
        <label>Quantity Used</label>
        <input v-model="useAmount" type="number" class="input-field" min="1" />
      </div>
      <template #actions>
        <button class="btn-secondary" @click="showUseForm = false">Cancel</button>
        <button class="btn-primary" @click="submitUse" :disabled="useLoading">
          {{ useLoading ? 'Updating...' : 'Record Usage' }}
        </button>
      </template>
    </AppModal>

    <!-- Order Modal -->
    <AppModal v-if="showOrderForm" :open="true" title="Order Item" size="sm" @close="showOrderForm = false">
      <p v-if="orderSupply">{{ orderSupply.name }}</p>
      <div class="order-info">
        <p><strong>Current Stock:</strong> {{ orderSupply?.quantity }} {{ orderSupply?.unit }}</p>
        <p><strong>Reorder Level:</strong> {{ orderSupply?.reorderLevel }} {{ orderSupply?.unit }}</p>
        <p v-if="orderSupply?.supplier"><strong>Supplier:</strong> {{ orderSupply.supplier }}</p>
        <p v-if="orderSupply?.costPerUnit"><strong>Cost Per Unit:</strong> ${{ orderSupply.costPerUnit.toFixed(2) }}</p>
      </div>
      <p class="modal-note">Contact the supplier to place an order for this item.</p>
      <template #actions>
        <button class="btn-primary" @click="showOrderForm = false">Done</button>
      </template>
    </AppModal>

    <!-- Last Restocked Info -->
    <div class="info-section">
      <SectionLabel>Inventory Statistics</SectionLabel>
      <AppCard :flat="true">
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value">{{ supplies.length }}</div>
            <div class="stat-label">Total Items</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ lowStockAlerts.length }}</div>
            <div class="stat-label">Low Stock</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ getOrderedCount() }}</div>
            <div class="stat-label">Ordered (Low)</div>
          </div>
        </div>
      </AppCard>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSupplyInventoryStore } from '../../../stores/supplyInventory'
import { useFormModal } from '../../../composables/useFormModal'
import { useTableFilters } from '../../../composables/useTableFilters'
import { useConfirmDelete } from '../../../composables/useConfirmDelete'
import { useUIStore } from '../../../stores/ui'
import { PageContainer, AppCard, SectionLabel, AppSelect, AlertBox, AppButton, EmptyState, AppModal } from '../../ui'

const ui = useUIStore()

const supplyStore = useSupplyInventoryStore()

// Form modal composable for add/edit supplies
const {
  showModal: showAddForm,
  formData: form,
  isSubmitting: addLoading,
  openAdd,
  closeModal: closeAddForm,
  submitForm
} = useFormModal()

// Specialized modals for restock, use, and order
const showRestockForm = ref(false)
const showUseForm = ref(false)
const showOrderForm = ref(false)
const restockLoading = ref(false)
const useLoading = ref(false)

const selectedSupplyId = ref(null)
const restockAmount = ref('')
const useAmount = ref('')
const orderSupply = ref(null)

const categoryOptions = [
  { value: 'food', label: 'Food' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'bedding', label: 'Bedding' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'cleaning', label: 'Cleaning Supplies' },
  { value: 'enrichment', label: 'Enrichment' },
  { value: 'first-aid', label: 'First Aid' },
  { value: 'other', label: 'Other' }
]

const unitOptions = [
  { value: 'units', label: 'Units' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'liters', label: 'Liters' },
  { value: 'gallons', label: 'Gallons' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'bags', label: 'Bags' },
  { value: 'bottles', label: 'Bottles' }
]

const supplies = computed(() => supplyStore.supplies)

// Table filters composable for category filtering
const { filterBy: categoryFilter } = useTableFilters(supplies)

const filteredSupplies = computed(() => {
  if (categoryFilter.value.category) {
    return supplies.value.filter(s => s.category === categoryFilter.value.category)
  }
  return supplies.value
})

const lowStockAlerts = computed(() => {
  return supplyStore.getLowStock().sort((a, b) => {
    const aPercentage = (a.quantity / a.reorderLevel) * 100
    const bPercentage = (b.quantity / b.reorderLevel) * 100
    return aPercentage - bPercentage
  })
})

onMounted(async () => {
  await supplyStore.fetchAll()
})

const getCategoryLabel = (value) => {
  return categoryOptions.find(o => o.value === value)?.label || value
}

const getStockStatus = (supply) => {
  if (supply.quantity === 0) return 'out'
  if (supply.quantity <= supply.reorderLevel) return 'low'
  if (supply.quantity <= supply.reorderLevel * 1.5) return 'moderate'
  return 'adequate'
}

const getStatusLabel = (supply) => {
  const status = getStockStatus(supply)
  switch (status) {
    case 'out': return 'Out of Stock'
    case 'low': return 'Low Stock'
    case 'moderate': return 'Moderate'
    case 'adequate': return 'Adequate'
    default: return 'Unknown'
  }
}

const getStatusClass = (supply) => {
  return 'status-' + getStockStatus(supply)
}

const getRowClass = (supply) => {
  const status = getStockStatus(supply)
  if (status === 'out' || status === 'low') return 'row-alert'
  return ''
}

const getCurrentSupply = () => {
  return supplies.value.find(s => s.id === selectedSupplyId.value)
}

const getOrderedCount = () => {
  return supplies.value.filter(s => getStockStatus(s) === 'low').length
}

const handleSubmitAdd = async () => {
  if (!form.value.name || !form.value.category || !form.value.quantity) {
    alert('Please fill in required fields')
    return
  }

  try {
    await submitForm(async () => {
      await supplyStore.addSupply(form.value)
    })
  } catch (err) {
    alert('Error adding supply: ' + err.message)
  }
}

const openRestockForm = (id) => {
  selectedSupplyId.value = id
  restockAmount.value = ''
  showRestockForm.value = true
}

const submitRestock = async () => {
  if (!restockAmount.value || parseInt(restockAmount.value) <= 0) {
    alert('Enter a valid quantity')
    return
  }

  restockLoading.value = true
  try {
    await supplyStore.restockSupply(selectedSupplyId.value, restockAmount.value)
    showRestockForm.value = false
    selectedSupplyId.value = null
    restockAmount.value = ''
  } catch (err) {
    alert('Error restocking: ' + err.message)
  } finally {
    restockLoading.value = false
  }
}

const openUseForm = (id) => {
  selectedSupplyId.value = id
  useAmount.value = ''
  showUseForm.value = true
}

const submitUse = async () => {
  if (!useAmount.value || parseInt(useAmount.value) <= 0) {
    alert('Enter a valid quantity')
    return
  }

  useLoading.value = true
  try {
    await supplyStore.decreaseStock(selectedSupplyId.value, useAmount.value)
    showUseForm.value = false
    selectedSupplyId.value = null
    useAmount.value = ''
  } catch (err) {
    alert('Error updating stock: ' + err.message)
  } finally {
    useLoading.value = false
  }
}

const openOrderForm = (supply) => {
  orderSupply.value = supply
  showOrderForm.value = true
}
</script>

<style scoped>
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -.01em;
}

.alerts-section {
  margin-bottom: 24px;
}

.alert-header {
  font-weight: 600;
  margin-bottom: 8px;
}

.alert-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
}

.alert-name {
  font-weight: 500;
}

.alert-qty {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.form-card {
  margin-bottom: 24px;
}

.form-card h2 {
  margin-top: 0;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--ink-2);
  letter-spacing: 0.04em;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  font-family: inherit;
  font-size: 14px;
  background: var(--surface-2);
  color: var(--ink);
  box-sizing: border-box;
  transition: border 0.15s;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: var(--mint);
}

.textarea-field {
  resize: vertical;
}

.controls-section {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 24px;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.inventory-table thead {
  background: var(--surface-2);
  border-bottom: 2px solid var(--border);
}

.inventory-table th {
  padding: 12px;
  text-align: left;
  font-weight: 700;
  color: var(--ink-2);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.inventory-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--ink);
}

.inventory-table tr:hover {
  background: rgba(78, 255, 197, 0.05);
}

.inventory-table tr.row-alert {
  background: rgba(255, 122, 69, 0.08);
  border-left: 4px solid var(--coral);
}

.name-cell {
  font-weight: 500;
}

.requested-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(78, 255, 197, 0.15);
  border: 1px solid var(--mint);
  color: var(--mint);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.category-cell {
  font-size: 13px;
}

.qty-cell {
  font-weight: 500;
  text-align: center;
}

.reorder-cell {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.status-cell {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-adequate {
  background: rgba(78, 255, 197, 0.15);
  color: var(--mint);
}

.status-moderate {
  background: rgba(255, 170, 85, 0.15);
  color: var(--amber);
}

.status-low,
.status-out {
  background: rgba(255, 122, 69, 0.15);
  color: var(--coral);
  font-weight: 700;
}

.supplier-cell {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.actions-cell {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 6px 10px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--surface-3);
  border-color: var(--mint);
  color: var(--mint);
}

.action-btn.order-btn {
  background: rgba(255, 170, 85, 0.15);
  border-color: var(--amber);
  color: var(--amber);
}

.action-btn.order-btn:hover {
  background: rgba(255, 170, 85, 0.25);
  border-color: var(--amber);
  color: var(--amber);
}

.order-info {
  background: var(--surface-2);
  padding: 12px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  margin: 12px 0;
  font-size: 12px;
}

.order-info p {
  margin: 4px 0;
}

.modal-note {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 12px 0;
}

.info-section {
  margin-top: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat {
  text-align: center;
  padding: 16px;
  border-right: 1px solid var(--color-border);
}

.stat:last-child {
  border-right: none;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}


@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: start;
    gap: 12px;
  }

  .inventory-table {
    font-size: 12px;
  }

  .inventory-table th,
  .inventory-table td {
    padding: 8px;
  }
}
</style>
