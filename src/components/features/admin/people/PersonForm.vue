<template>
  <div class="form-card">
    <div class="form-card-header">
      <span>{{ editing ? 'Edit Person' : 'New Person' }}</span>
      <button class="panel-close" @click="$emit('cancel')">✕</button>
    </div>

    <!-- Type selector (multi-select) -->
    <div class="form-group">
      <div class="form-label">Person Type (select all that apply)</div>
      <div class="type-grid">
        <label
          v-for="type in personTypes"
          :key="type"
          class="type-checkbox"
          :class="{ active: form.types?.includes(type) }"
        >
          <input
            type="checkbox"
            :value="type"
            :checked="form.types?.includes(type)"
            @change="e => {
              if (e.target.checked) {
                if (!form.types) form.types = []
                if (!form.types.includes(type)) form.types.push(type)
              } else {
                form.types = form.types.filter(t => t !== type)
              }
            }"
          />
          <span class="type-checkbox-icon">{{ typeIcons[type] }}</span>
          <span class="type-checkbox-label">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</span>
        </label>
      </div>
    </div>

    <div class="form-cols">
      <!-- Left col -->
      <div class="form-col">
        <div class="form-group">
          <div class="form-label">Full Name *</div>
          <input v-model="form.name" type="text" class="form-input" placeholder="First and last name" />
        </div>

        <div class="form-group">
          <div class="form-label">Email</div>
          <input v-model="form.email" type="email" class="form-input" placeholder="email@example.com" />
        </div>

        <div class="form-group">
          <div class="form-label">Phone</div>
          <input v-model="form.phone" type="tel" class="form-input" placeholder="(555) 000-0000" />
        </div>
      </div>

      <!-- Right col -->
      <div class="form-col">
        <div class="form-group">
          <div class="form-label">Status</div>
          <div class="btn-group">
            <button
              v-for="st in statusOptions"
              :key="st"
              class="group-btn"
              :class="{ active: form.status === st, [st]: true }"
              @click="form.status = st"
            >{{ st }}</button>
          </div>
        </div>

        <div class="form-group">
          <div class="form-label">Location / City</div>
          <input v-model="form.location" type="text" class="form-input" placeholder="City, AZ" />
        </div>

        <div class="form-group">
          <div class="form-label">Tags</div>
          <div class="tag-checks">
            <label v-for="tag in availableTags" :key="tag" class="tag-check">
              <input type="checkbox" :value="tag" v-model="form.tags" />
              <span>{{ tag }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-label">Notes</div>
      <textarea v-model="form.notes" class="form-textarea" placeholder="Skills, experience, preferences..." rows="3" />
    </div>

    <div class="form-actions">
      <AppButton variant="primary" @click="$emit('save')">✓ {{ editing ? 'Update' : 'Save' }} Person</AppButton>
      <AppButton variant="secondary" @click="$emit('cancel')">Cancel</AppButton>
    </div>
  </div>
</template>

<script setup>
import { AppButton } from '../../../ui'
import { personTypes, statusOptions, availableTags, typeIcons } from './personDisplay'

defineProps({
  // Form data object from useFormModal — mutated in place (same object the parent submits).
  form: { type: Object, required: true },
  // Truthy when editing an existing person.
  editing: { default: null },
})

defineEmits(['save', 'cancel'])
</script>

<style scoped>
.panel-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }

/* Add/Edit form */
.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 16px;
  margin-bottom: 16px;
}
.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ink-3);
}
.form-input {
  padding: 9px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  transition: border .15s;
}
.form-input:focus { outline: none; border-color: var(--mint); }
.form-textarea {
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  color: var(--ink);
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  resize: vertical;
}
.form-textarea:focus { outline: none; border-color: var(--mint); }

.form-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 4px; }
.form-col { display: flex; flex-direction: column; }

/* Type selector */
.type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.type-checkbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--surface-2);
  border: 2px solid var(--border);
  border-radius: var(--r);
  cursor: pointer;
  transition: all .15s;
}
.type-checkbox input { display: none; }
.type-checkbox:hover { border-color: var(--mint); }
.type-checkbox.active { border-color: var(--mint); background: rgba(78,255,197,.12); }
.type-checkbox-icon { font-size: 22px; }
.type-checkbox-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--ink-2); }

/* Button group */
.btn-group { display: flex; gap: 0; border-radius: var(--r); overflow: hidden; border: 1.5px solid var(--border); }
.group-btn {
  flex: 1;
  padding: 8px;
  background: var(--surface-2);
  border: none;
  color: var(--ink-2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  text-transform: uppercase;
  border-right: 1px solid var(--border);
}
.group-btn:last-child { border-right: none; }
.group-btn:hover { background: var(--surface-3); color: var(--ink); }
.group-btn.active.active { background: var(--mint); color: var(--bg); }
.group-btn.inactive.active { background: var(--ink-3); color: var(--bg); }
.group-btn.pending.active { background: var(--amber); color: var(--bg); }

/* Tags */
.tag-checks { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-check {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-2);
  cursor: pointer;
  transition: all .15s;
}
.tag-check:hover { border-color: var(--mint); }
.tag-check input { display: none; }
.tag-check:has(input:checked) { background: rgba(78,255,197,.15); border-color: var(--mint); color: var(--mint); }

.form-actions { display: flex; gap: 8px; padding-top: 8px; }
</style>
