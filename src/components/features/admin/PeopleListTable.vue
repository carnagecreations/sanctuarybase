<template>
  <div class="people-list">
    <div class="list-controls">
      <input v-model="search" type="text" placeholder="Search by name..." class="search-input" />
      <select v-model="roleFilter" class="filter-select">
        <option value="">All Roles</option>
        <option value="volunteer">Volunteers</option>
        <option value="staff">Staff</option>
        <option value="admin">Admins</option>
      </select>
    </div>

    <div class="people-cards">
      <div v-for="person in filteredPeople" :key="person.id" class="person-card" @click="$emit('select', person)">
        <div class="person-avatar">{{ getInitials(person.name) }}</div>
        <div class="person-info">
          <div class="person-name">{{ person.name }}</div>
          <div class="person-role">{{ person.role }}</div>
        </div>
        <div class="person-action">→</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({ people: Array })
defineEmits(['select'])

const search = ref('')
const roleFilter = ref('')

const filteredPeople = computed(() => {
  let result = people || []
  if (search.value) result = result.filter(p => p.name?.toLowerCase().includes(search.value.toLowerCase()))
  if (roleFilter.value) result = result.filter(p => p.role === roleFilter.value)
  return result
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<style scoped>
.people-list { display: flex; flex-direction: column; gap: 16px; }
.list-controls { display: flex; gap: 12px; }
.search-input, .filter-select { flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; }
.search-input:focus, .filter-select:focus { outline: none; border-color: #4EFFC5; }
.people-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.person-card { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 12px; }
.person-card:hover { border-color: #4EFFC5; transform: translateY(-2px); }
.person-avatar { width: 40px; height: 40px; border-radius: 50%; background: #4EFFC5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }
.person-info { flex: 1; min-width: 0; }
.person-name { font-size: 13px; font-weight: 700; color: var(--ink); }
.person-role { font-size: 11px; color: var(--ink-3); text-transform: uppercase; }
.person-action { color: var(--ink-3); font-size: 18px; }
</style>
