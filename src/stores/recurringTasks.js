import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useTasksStore } from './tasks'

/**
 * Recurring task templates, stored in the `tasklibrary` collection
 * (read: any authenticated user, write: staff/admin — see firestore.rules).
 *
 * There is no server-side cron on Cloudflare Pages, so instances are
 * materialized client-side: whenever a staff/admin user loads the app,
 * generateDueTasks() creates any task instances that are due for the
 * current period and stamps the template with `lastGeneratedKey` so the
 * same period is never generated twice. Each generated task also carries
 * { recurringId, periodKey } as a second layer of duplicate protection.
 */
export const useRecurringTasksStore = defineStore('recurringTasks', () => {
  const templates = ref([])
  const loading = ref(false)

  const dateKey = (d) =>
    d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')

  /**
   * For a template, returns the current period's schedule or null if the
   * scheduled day hasn't arrived yet this period.
   * @returns {{ periodKey: string, dueDate: string } | null}
   */
  const currentOccurrence = (template, now = new Date()) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (template.frequency === 'daily') {
      return { periodKey: dateKey(today), dueDate: dateKey(today) }
    }
    if (template.frequency === 'weekly') {
      const weekday = Number(template.weekday) || 0 // 0 = Sunday
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const scheduled = new Date(weekStart)
      scheduled.setDate(weekStart.getDate() + weekday)
      if (today < scheduled) return null
      return { periodKey: 'W' + dateKey(scheduled), dueDate: dateKey(scheduled) }
    }
    if (template.frequency === 'monthly') {
      const wanted = Math.min(Math.max(Number(template.monthday) || 1, 1), 28)
      const scheduled = new Date(today.getFullYear(), today.getMonth(), wanted)
      if (today < scheduled) return null
      const periodKey = 'M' + today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0')
      return { periodKey, dueDate: dateKey(scheduled) }
    }
    return null
  }

  /** Fetches all recurring templates. @returns {Promise<Array>} */
  const fetchTemplates = async () => {
    loading.value = true
    try {
      const snapshot = await getDocs(collection(db, 'tasklibrary'))
      templates.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      return templates.value
    } catch (error) {
      console.error('Failed to fetch recurring tasks:', error.message)
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a recurring template. @returns {Promise<Object>} */
  const addTemplate = async (data) => {
    const payload = {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'Medium',
      frequency: data.frequency,            // 'daily' | 'weekly' | 'monthly'
      weekday: Number(data.weekday) || 0,   // weekly: 0 (Sun) – 6 (Sat)
      monthday: Number(data.monthday) || 1, // monthly: 1 – 28
      lastGeneratedKey: '',
      createdAt: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, 'tasklibrary'), payload)
    const tpl = { id: docRef.id, ...payload }
    templates.value.unshift(tpl)
    return tpl
  }

  /** Deletes a recurring template (already-created tasks are kept). */
  const deleteTemplate = async (id) => {
    await deleteDoc(doc(db, 'tasklibrary', id))
    templates.value = templates.value.filter(t => t.id !== id)
  }

  /**
   * Materializes due task instances for the current period.
   * Safe to call on every app load; only staff/admin can create tasks
   * (firestore rules), so callers should gate on role.
   * @returns {Promise<number>} number of tasks created
   */
  const generateDueTasks = async () => {
    const tasksStore = useTasksStore()
    if (!templates.value.length) await fetchTemplates()
    if (!templates.value.length) return 0
    if (!tasksStore.tasks.length) await tasksStore.fetchTasks()

    let created = 0
    for (const tpl of templates.value) {
      try {
        const occ = currentOccurrence(tpl)
        if (!occ || tpl.lastGeneratedKey === occ.periodKey) continue
        // Second guard: a task for this template+period may already exist
        // (e.g. two admins loaded the app at the same time).
        const exists = tasksStore.tasks.some(
          t => t.recurringId === tpl.id && t.periodKey === occ.periodKey
        )
        if (!exists) {
          await tasksStore.addTask({
            title: tpl.title,
            description: tpl.description || '',
            priority: tpl.priority || 'Medium',
            dueDate: occ.dueDate,
            recurringId: tpl.id,
            periodKey: occ.periodKey,
          })
          created++
        }
        await updateDoc(doc(db, 'tasklibrary', tpl.id), { lastGeneratedKey: occ.periodKey })
        tpl.lastGeneratedKey = occ.periodKey
      } catch (error) {
        console.error('Failed to generate recurring task:', tpl.title, error.message)
      }
    }
    return created
  }

  return {
    templates,
    loading,
    fetchTemplates,
    addTemplate,
    deleteTemplate,
    generateDueTasks,
    currentOccurrence,
  }
})
