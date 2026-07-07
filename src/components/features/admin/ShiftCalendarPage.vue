<template>
  <PageContainer>
    <div class="space-y-4">
      <div class="cal-header">
        <h2 class="page-title">Shift Calendar</h2>
        <div class="cal-nav">
          <button class="nav-btn" @click="prevWeek">‹</button>
          <span class="cal-range">{{ weekLabel }}</span>
          <button class="nav-btn" @click="nextWeek">›</button>
        </div>
        <AppButton variant="primary" size="sm" @click="showAddForm = true">+ Schedule Shift</AppButton>
      </div>

      <!-- Stats bar -->
      <div class="stats-row">
        <div class="sc-stat"><div class="sc-num">{{ totalShiftsWeek }}</div><div class="sc-lbl">This Week</div></div>
        <div class="sc-stat"><div class="sc-num">{{ totalHoursWeek }}</div><div class="sc-lbl">Hours Covered</div></div>
        <div class="sc-stat"><div class="sc-num">{{ openShiftsCount }}</div><div class="sc-lbl">Open Slots</div></div>
        <div class="sc-stat"><div class="sc-num">{{ uniqueVolunteers }}</div><div class="sc-lbl">Volunteers</div></div>
      </div>

      <!-- Add shift form -->
      <div v-if="showAddForm" class="form-card">
        <div class="form-card-header">
          <span>Schedule a Shift</span>
          <button class="form-close" @click="showAddForm = false">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <div class="field-label">Date</div>
            <input v-model="newShift.date" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <div class="field-label">Shift Type</div>
            <select v-model="newShift.type" class="form-input">
              <option v-for="t in shiftTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-group">
            <div class="field-label">Start Time</div>
            <select v-model="newShift.startTime" class="form-input">
              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-group">
            <div class="field-label">End Time</div>
            <select v-model="newShift.endTime" class="form-input">
              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="form-group span2">
            <div class="field-label">Volunteer (optional)</div>
            <input v-model="newShift.volunteer" type="text" class="form-input" placeholder="Name or leave open" />
          </div>
          <div class="form-group span2">
            <div class="field-label">Notes</div>
            <input v-model="newShift.notes" type="text" class="form-input" placeholder="Tasks, requirements..." />
          </div>
        </div>
        <div class="form-actions">
          <AppButton variant="primary" @click="addShift">✓ Save Shift</AppButton>
          <AppButton variant="secondary" @click="showAddForm = false">Cancel</AppButton>
        </div>
      </div>

      <!-- Week view -->
      <div class="week-grid">
        <div v-for="day in weekDays" :key="day.iso" class="day-col">
          <div class="day-header" :class="{ today: day.isToday }">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-num">{{ day.num }}</div>
          </div>
          <div class="day-shifts">
            <div
              v-for="shift in getShiftsForDay(day.iso)"
              :key="shift.id"
              class="shift-block"
              :class="shiftTypeClass(shift.type)"
              @click="selectedShift = shift"
            >
              <div class="sb-time">{{ shift.startTime }} – {{ shift.endTime }}</div>
              <div class="sb-type">{{ shift.type }}</div>
              <div v-if="shift.volunteer" class="sb-vol">👤 {{ shift.volunteer }}</div>
              <div v-else class="sb-open">Open</div>
            </div>
            <button class="add-slot" @click="quickAdd(day.iso)">+</button>
          </div>
        </div>
      </div>

      <!-- List view for overflow -->
      <SectionLabel>All Scheduled Shifts</SectionLabel>
      <div class="shift-list">
        <div
          v-for="shift in sortedShifts"
          :key="shift.id"
          class="shift-row"
          @click="selectedShift = shift"
        >
          <div class="sr-date">{{ formatDate(shift.date) }}</div>
          <div class="sr-body">
            <div class="sr-type" :class="shiftTypeClass(shift.type)">{{ shift.type }}</div>
            <div class="sr-time">{{ shift.startTime }} – {{ shift.endTime }}</div>
          </div>
          <div class="sr-vol">{{ shift.volunteer || '⚠ Open' }}</div>
          <button class="sr-del" @click.stop="deleteShift(shift.id)">✕</button>
        </div>
      </div>
      <EmptyState v-if="!shifts.length" icon="📅" title="No shifts scheduled" message="Add your first shift above." />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PageContainer, AppButton, SectionLabel, EmptyState } from '../../ui'
import { useUIStore } from '../../../stores/ui'
import { db } from '../../../services/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'

const ui = useUIStore()

const showAddForm = ref(false)
const selectedShift = ref(null)
const weekOffset = ref(0)
const shifts = ref([])

const shiftTypes = ['Morning Rounds', 'Feeding', 'Medical', 'Cleaning', 'Admin', 'Event', 'Foster Transport', 'Adoption Event']
const timeSlots = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM']

const newShift = ref({
  date: new Date().toISOString().slice(0, 10),
  type: 'Morning Rounds',
  startTime: '8:00 AM',
  endTime: '12:00 PM',
  volunteer: '',
  notes: '',
})

const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset.value * 7)
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    days.push({
      iso: d.toISOString().slice(0, 10),
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    })
  }
  return days
})

const weekLabel = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  return `${new Date(start.iso + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(end.iso + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

const getShiftsForDay = (iso) => shifts.value.filter(s => s.date === iso)

const sortedShifts = computed(() => [...shifts.value].sort((a, b) => a.date.localeCompare(b.date)))

const totalShiftsWeek = computed(() => weekDays.value.reduce((n, d) => n + getShiftsForDay(d.iso).length, 0))
const totalHoursWeek = computed(() => {
  return weekDays.value.reduce((total, d) => {
    return total + getShiftsForDay(d.iso).reduce((sum, s) => {
      // Not every doc in the shared `shifts` collection has startTime/endTime
      // in this "H:MM AM/PM" shape — real-time clock-in/out shifts (see
      // stores/shifts.js) only carry clockInTime/clockOutTime. Skip anything
      // that doesn't match rather than crashing the whole calendar.
      const parseTime = (t) => {
        if (typeof t !== 'string' || !t.includes(':')) return null
        const [time, period] = t.split(' ')
        let [h] = time.split(':').map(Number)
        if (isNaN(h)) return null
        if (period === 'PM' && h !== 12) h += 12
        if (period === 'AM' && h === 12) h = 0
        return h
      }
      const start = parseTime(s.startTime)
      const end = parseTime(s.endTime)
      if (start === null || end === null) return sum
      return sum + Math.max(0, end - start)
    }, 0)
  }, 0)
})
const openShiftsCount = computed(() => shifts.value.filter(s => !s.volunteer).length)
const uniqueVolunteers = computed(() => new Set(shifts.value.filter(s => s.volunteer).map(s => s.volunteer)).size)

const shiftTypeClass = (type) => {
  const map = {
    'Morning Rounds': 'type-rounds',
    'Feeding': 'type-feeding',
    'Medical': 'type-medical',
    'Cleaning': 'type-cleaning',
    'Admin': 'type-admin',
    'Event': 'type-event',
    'Foster Transport': 'type-foster',
    'Adoption Event': 'type-adoption',
  }
  return map[type] || 'type-admin'
}

const formatDate = (iso) => new Date(iso + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const prevWeek = () => weekOffset.value--
const nextWeek = () => weekOffset.value++

const quickAdd = (date) => {
  newShift.value.date = date
  showAddForm.value = true
}

const addShift = async () => {
  if (!newShift.value.date || !newShift.value.type) return
  try {
    const ref = await addDoc(collection(db, 'shifts'), {
      ...newShift.value,
      createdAt: new Date().toISOString(),
    })
    shifts.value.push({ id: ref.id, ...newShift.value })
    newShift.value = { date: new Date().toISOString().slice(0,10), type: 'Morning Rounds', startTime: '8:00 AM', endTime: '12:00 PM', volunteer: '', notes: '' }
    showAddForm.value = false
    ui.showToast('Shift scheduled')
  } catch { ui.showToast('Error saving shift', 'error') }
}

const deleteShift = async (id) => {
  const ok = await ui.confirm({ title: 'Delete shift?', message: 'This cannot be undone.', danger: true, confirmText: 'Delete' })
  if (!ok) return
  try {
    await deleteDoc(doc(db, 'shifts', id))
    shifts.value = shifts.value.filter(s => s.id !== id)
    ui.showToast('Shift removed')
  } catch { ui.showToast('Error', 'error') }
}

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'shifts'))
    shifts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error(e) }

  if (ui.shiftPrefillVolunteer) {
    newShift.value.volunteer = ui.shiftPrefillVolunteer
    showAddForm.value = true
    ui.shiftPrefillVolunteer = null
  }
})
</script>

<style scoped>
.space-y-4 > * + * { margin-top: 16px; }
.cal-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.page-title { font-size: 20px; font-weight: 800; color: var(--ink); margin: 0; flex: none; }
.cal-nav { display: flex; align-items: center; gap: 8px; flex: 1; }
.nav-btn {
  width: 30px; height: 30px; background: var(--surface-2);
  border: 1px solid var(--border); border-radius: var(--r);
  color: var(--ink); font-size: 16px; cursor: pointer; transition: all .15s;
}
.nav-btn:hover { border-color: var(--mint); }
.cal-range { font-size: 12px; font-weight: 700; color: var(--ink-2); }

.stats-row { display: flex; gap: 8px; }
.sc-stat { flex: 1; padding: 10px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r); text-align: center; }
.sc-num { font-family: 'Fredoka One', sans-serif; font-size: 20px; color: var(--mint); }
.sc-lbl { font-size: 9px; text-transform: uppercase; color: var(--ink-3); font-weight: 700; }

.form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; }
.form-card-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 800; color: var(--ink); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.form-close { background: none; border: none; font-size: 16px; color: var(--ink-3); cursor: pointer; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.span2 { grid-column: span 2; }
.field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--ink-3); letter-spacing: .04em; }
.form-input {
  padding: 8px 10px; background: var(--surface-2); border: 1.5px solid var(--border);
  border-radius: var(--r); color: var(--ink); font-family: 'Nunito', sans-serif; font-size: 12px;
}
.form-input:focus { outline: none; border-color: var(--mint); }
.form-actions { display: flex; gap: 8px; }

/* Week grid */
.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; overflow-x: auto; }
.day-col { min-width: 100px; }
.day-header {
  text-align: center; padding: 8px 4px;
  background: var(--surface-2); border-radius: 6px 6px 0 0;
  border-bottom: 2px solid var(--border); margin-bottom: 6px;
}
.day-header.today { border-bottom-color: var(--mint); }
.day-name { font-size: 10px; text-transform: uppercase; font-weight: 800; color: var(--ink-3); }
.day-num { font-size: 18px; font-weight: 800; color: var(--ink); font-family: 'Fredoka One', sans-serif; }
.day-header.today .day-num { color: var(--mint); }

.day-shifts { display: flex; flex-direction: column; gap: 4px; }
.shift-block {
  padding: 6px 8px; border-radius: 6px; cursor: pointer;
  border-left: 3px solid; transition: all .15s;
}
.shift-block:hover { transform: translateY(-1px); }
.sb-time { font-size: 9px; color: var(--ink-3); }
.sb-type { font-size: 10px; font-weight: 800; color: var(--ink); }
.sb-vol { font-size: 9px; color: var(--ink-2); }
.sb-open { font-size: 9px; color: var(--coral); font-weight: 700; }

.add-slot {
  width: 100%; padding: 4px; background: none;
  border: 1px dashed var(--border); border-radius: 6px;
  color: var(--ink-3); font-size: 14px; cursor: pointer;
  transition: all .15s;
}
.add-slot:hover { border-color: var(--mint); color: var(--mint); }

/* Shift type colors */
.type-rounds { background: rgba(96,165,250,.1); border-color: #60A5FA; }
.type-feeding { background: rgba(251,191,36,.1); border-color: #FBbf24; }
.type-medical { background: rgba(255,122,69,.1); border-color: var(--coral); }
.type-cleaning { background: rgba(148,163,184,.1); border-color: #94A3B8; }
.type-admin { background: rgba(167,139,250,.1); border-color: #A78BFA; }
.type-event { background: rgba(52,211,153,.1); border-color: #34D399; }
.type-foster { background: rgba(251,113,133,.1); border-color: #FB7185; }
.type-adoption { background: rgba(78,255,197,.1); border-color: var(--mint); }

/* List */
.shift-list { display: flex; flex-direction: column; gap: 4px; }
.shift-row {
  display: flex; align-items: center; gap: 10px; padding: 10px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
  cursor: pointer; transition: all .15s;
}
.shift-row:hover { border-color: var(--mint); }
.sr-date { font-size: 11px; font-weight: 700; color: var(--ink-2); min-width: 90px; }
.sr-body { flex: 1; display: flex; align-items: center; gap: 8px; }
.sr-type { font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 10px; }
.sr-time { font-size: 11px; color: var(--ink-3); }
.sr-vol { font-size: 11px; color: var(--ink-2); }
.sr-del {
  background: none; border: none; color: var(--ink-3); cursor: pointer;
  font-size: 13px; padding: 4px; transition: color .15s;
}
.sr-del:hover { color: var(--coral); }
</style>
