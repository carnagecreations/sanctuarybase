<template>
  <div class="search-panel">
    <div class="panel-header">
      <span class="panel-title">Filter & Search</span>
      <button class="panel-close" @click="$emit('close')">✕</button>
    </div>

    <div class="panel-body">
      <!-- Search -->
      <div class="panel-section">
        <div class="panel-label">Search</div>
        <input v-model="searchQuery" type="text" placeholder="Name, email, phone..." class="panel-input" />
      </div>

      <!-- Type filter -->
      <div class="panel-section">
        <div class="panel-label">Type</div>
        <div class="panel-checks">
          <label v-for="type in personTypes" :key="type" class="check-item">
            <input type="checkbox" :value="type" v-model="selectedTypes" />
            <span>{{ typeIcons[type] }} {{ type.charAt(0).toUpperCase() + type.slice(1) }}</span>
          </label>
        </div>
      </div>

      <!-- Status filter -->
      <div class="panel-section">
        <div class="panel-label">Status</div>
        <div class="panel-checks">
          <label v-for="st in statusOptions" :key="st" class="check-item">
            <input type="checkbox" :value="st" v-model="selectedStatuses" />
            <span>{{ st.charAt(0).toUpperCase() + st.slice(1) }}</span>
          </label>
        </div>
      </div>

      <!-- Sort -->
      <div class="panel-section">
        <div class="panel-label">Sort By</div>
        <select v-model="sortBy" class="panel-select">
          <option value="name">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="type">Type</option>
          <option value="status">Status</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <!-- Clear -->
      <button class="clear-btn" @click="$emit('clear')">Clear All Filters</button>
    </div>
  </div>
</template>

<script setup>
import { personTypes, statusOptions, typeIcons } from './personDisplay'

defineEmits(['close', 'clear'])

const searchQuery = defineModel('searchQuery', { type: String, default: '' })
const selectedTypes = defineModel('selectedTypes', { type: Array, default: () => [] })
const selectedStatuses = defineModel('selectedStatuses', { type: Array, default: () => [] })
const sortBy = defineModel('sortBy', { type: String, default: 'name' })
</script>

<style scoped>
/* Side search panel */
.search-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0,0,0,.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}
.panel-title { font-size: 14px; font-weight: 800; color: var(--ink); }
.panel-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-section { display: flex; flex-direction: column; gap: 8px; }
.panel-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ink-3);
}
.panel-input, .panel-select {
  width: 100%;
  padding: 8px 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
}
.panel-select { cursor: pointer; }

.panel-checks { display: flex; flex-direction: column; gap: 6px; }
.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
}
.check-item input { accent-color: var(--mint); cursor: pointer; }

.clear-btn {
  padding: 8px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--ink-3);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all .15s;
}
.clear-btn:hover { border-color: var(--coral); color: var(--coral); }
</style>
