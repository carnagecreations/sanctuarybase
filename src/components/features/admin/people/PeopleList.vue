<template>
  <div v-if="loading" class="loading-msg">Loading...</div>
  <div v-else-if="people.length" class="people-list">
    <div
      v-for="person in people"
      :key="person.id"
      class="person-row"
      @click="$emit('select', person)"
    >
      <div class="person-avatar" :style="avatarStyle(personTypeList(person)[0])">
        {{ person.name?.charAt(0)?.toUpperCase() || '?' }}
      </div>
      <div class="person-body">
        <div class="person-top">
          <span class="person-name">{{ person.name }}</span>
          <AppBadge :type="badgeType(person.status)">{{ person.status || 'active' }}</AppBadge>
        </div>
        <div class="person-sub">
          <span v-for="t in personTypeList(person)" :key="t" class="person-chip">{{ typeIcons[t] }} {{ t }}</span>
          <span v-if="person.email" class="person-detail">{{ person.email }}</span>
          <span v-if="person.phone" class="person-detail">{{ person.phone }}</span>
          <span v-if="person.location" class="person-detail">📍 {{ person.location }}</span>
        </div>
        <div v-if="person.tags?.length" class="person-tags">
          <span v-for="tag in person.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="person-actions" @click.stop>
        <button class="action-btn" title="Edit" @click="$emit('edit', person)">✏️</button>
        <button class="action-btn danger" title="Delete" @click="$emit('remove', person)">🗑</button>
      </div>
    </div>
  </div>
  <EmptyState v-else icon="👥" title="No people found" message="Try adjusting your filters or add someone." />
</template>

<script setup>
import { AppBadge, EmptyState } from '../../../ui'
import { avatarStyle, badgeType, typeIcons, personTypeList } from './personDisplay'

defineProps({
  people: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['select', 'edit', 'remove'])
</script>

<style scoped>
/* People list */
.people-list { display: flex; flex-direction: column; gap: 6px; }
.loading-msg { text-align: center; color: var(--ink-3); font-size: 13px; padding: 40px 0; }

.person-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  cursor: pointer;
  transition: all .15s;
}
.person-row:hover { border-color: var(--mint); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }

.person-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.person-body { flex: 1; min-width: 0; }
.person-top { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.person-name { font-size: 13px; font-weight: 800; color: var(--ink); }
.person-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}
.person-chip {
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: .03em;
}
.person-detail { font-size: 11px; color: var(--ink-2); }
.person-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }

.tag {
  padding: 2px 6px;
  background: rgba(78,255,197,.12);
  border: 1px solid rgba(78,255,197,.3);
  border-radius: 10px;
  font-size: 10px;
  color: var(--mint);
  font-weight: 700;
}

.person-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .15s;
}
.person-row:hover .person-actions { opacity: 1; }
.action-btn {
  width: 28px;
  height: 28px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all .15s;
}
.action-btn:hover { background: var(--surface-3); border-color: var(--mint); }
.action-btn.danger:hover { border-color: var(--coral); }
</style>
