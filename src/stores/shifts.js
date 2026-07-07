import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useShiftsStore = defineStore('shifts', () => {
  const shifts = ref([])
  const volunteers = ref([])
  const loading = ref(false)

  // Older shift documents were written with a misspelled `volunterId` field;
  // every read below checks both so existing shifts still match correctly
  // while all new writes use the correct `volunteerId` spelling.
  const shiftOwnerId = (s) => s.volunteerId ?? s.volunterId

  /** Filters shifts for a specific volunteer from local state. @returns {Array} */
  const getVolunteerShifts = (userId) => {
    return (Array.isArray(shifts.value) ? shifts.value : []).filter(s => shiftOwnerId(s) === userId)
  }

  /** Fetches all shifts from Firestore. @returns {Promise<Array>} */
  const fetchShifts = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'shifts'))
      shifts.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return shifts.value
    } catch (error) {
      return []
    } finally {
      loading.value = false
    }
  }

  /** Fetches all volunteers from Firestore. @returns {Promise<Array>} */
  const fetchVolunteers = async () => {
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'volunteers'))
      volunteers.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return volunteers.value
    } catch (error) {
      return []
    } finally {
      loading.value = false
    }
  }

  /** Creates a new shift in Firestore. @returns {Promise<Object|null>} */
  const createShift = async (shiftData) => {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'shifts'), {
        ...shiftData,
        createdAt: new Date(),
      })
      const newShift = { id: docRef.id, ...shiftData }
      shifts.value.push(newShift)
      return newShift
    } catch (error) {
      return null
    } finally {
      loading.value = false
    }
  }

  /** Updates an existing shift in Firestore. @returns {Promise<Object|null>} */
  const updateShift = async (id, shiftData) => {
    loading.value = true
    try {
      await updateDoc(doc(db, 'shifts', id), {
        ...shiftData,
        updatedAt: new Date(),
      })
      const idx = shifts.value.findIndex((s) => s.id === id)
      if (idx !== -1) {
        shifts.value[idx] = { ...shifts.value[idx], ...shiftData }
      }
      return shifts.value[idx]
    } catch (error) {
      return null
    } finally {
      loading.value = false
    }
  }

  /** Records a volunteer clock-in in Firestore. @returns {Promise<Object>} */
  const clockIn = async (volunteerId, volunteerName) => {
    try {
      const now = new Date().toISOString()
      const docRef = await addDoc(collection(db, 'shifts'), {
        volunteerId,
        volunteerName,
        status: 'active',
        clockInTime: now,
        clockIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().slice(0, 10),
        hours: 0,
        createdAt: now,
      })
      const newShift = {
        id: docRef.id,
        volunteerId,
        volunteerName,
        status: 'active',
        clockInTime: now,
        clockIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().slice(0, 10),
        hours: 0,
      }
      shifts.value.unshift(newShift)
      return newShift
    } catch (error) {
      throw error
    }
  }

  /** Records a volunteer clock-out in Firestore. @returns {Promise<void>} */
  const clockOut = async (volunteerId) => {
    try {
      const activeShift = shifts.value.find(s => shiftOwnerId(s) === volunteerId && s.status === 'active')
      if (!activeShift) throw new Error('No active shift found')

      const clockOutTime = new Date().toISOString()
      const clockInTime = new Date(activeShift.clockInTime)
      const hours = Math.round((new Date(clockOutTime) - clockInTime) / 3600000 * 100) / 100

      await updateDoc(doc(db, 'shifts', activeShift.id), {
        status: 'completed',
        clockOutTime,
        clockOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hours,
      })

      const idx = shifts.value.findIndex(s => s.id === activeShift.id)
      if (idx !== -1) {
        shifts.value[idx] = { ...shifts.value[idx], status: 'completed', clockOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), hours }
      }
    } catch (error) {
      throw error
    }
  }

  /** Admin: ends a specific volunteer's active shift by shift id. @returns {Promise<void>} */
  const forceClockOut = async (shiftId) => {
    const shift = shifts.value.find(s => s.id === shiftId)
    if (!shift) throw new Error('Shift not found')

    const clockOutTime = new Date().toISOString()
    const clockInTime = new Date(shift.clockInTime)
    const hours = Math.round((new Date(clockOutTime) - clockInTime) / 3600000 * 100) / 100

    await updateDoc(doc(db, 'shifts', shiftId), {
      status: 'completed',
      clockOutTime,
      clockOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      hours,
    })

    const idx = shifts.value.findIndex(s => s.id === shiftId)
    if (idx !== -1) {
      shifts.value[idx] = { ...shifts.value[idx], status: 'completed', clockOutTime, hours }
    }
  }

  /** Deletes a shift document from Firestore. @returns {Promise<void>} */
  const removeShift = async (id) => {
    await deleteDoc(doc(db, 'shifts', id))
    shifts.value = shifts.value.filter(s => s.id !== id)
  }

  /** Admin: publishes an open, unclaimed shift slot for volunteers to self-serve claim.
   *  @returns {Promise<Object>} */
  const scheduleShift = async ({ date, startTime, endTime, role, notes }) => {
    const payload = {
      status: 'open',
      volunteerId: null,
      volunteerName: null,
      date,
      startTime,
      endTime,
      role: role || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, 'shifts'), payload)
    const newShift = { id: docRef.id, ...payload }
    shifts.value.unshift(newShift)
    return newShift
  }

  /** Volunteer: claims an open shift slot for themselves. @returns {Promise<void>} */
  const claimShift = async (shiftId, volunteerId, volunteerName) => {
    const shift = shifts.value.find(s => s.id === shiftId)
    if (!shift || shift.status !== 'open') throw new Error('Shift is no longer available')

    await updateDoc(doc(db, 'shifts', shiftId), {
      status: 'scheduled',
      volunteerId,
      volunteerName,
    })

    const idx = shifts.value.findIndex(s => s.id === shiftId)
    if (idx !== -1) {
      shifts.value[idx] = { ...shifts.value[idx], status: 'scheduled', volunteerId, volunteerName }
    }
  }

  /** Volunteer: releases a claimed-but-not-yet-started shift back to open. @returns {Promise<void>} */
  const releaseClaim = async (shiftId) => {
    await updateDoc(doc(db, 'shifts', shiftId), {
      status: 'open',
      volunteerId: null,
      volunteerName: null,
    })

    const idx = shifts.value.findIndex(s => s.id === shiftId)
    if (idx !== -1) {
      shifts.value[idx] = { ...shifts.value[idx], status: 'open', volunteerId: null, volunteerName: null }
    }
  }

  /** Aggregates completed + active shift hours per volunteer over a date range.
   *  Shape matches the old checkins-based clockIn store so consumers don't
   *  need to change. @returns {Promise<Array>} */
  const getAllVolunteerHours = async (startDate, endDate) => {
    await fetchShifts()
    const volunteerMap = {}

    shifts.value.forEach(s => {
      const clockInTime = s.clockInTime ? new Date(s.clockInTime) : null
      if (!clockInTime || clockInTime < startDate || clockInTime >= endDate) return

      const volunteerId = shiftOwnerId(s)
      if (!volunteerMap[volunteerId]) {
        volunteerMap[volunteerId] = {
          userId: volunteerId,
          email: s.volunteerName,
          totalMinutes: 0,
          shifts: [],
        }
      }

      const minutes = Math.round((s.hours || 0) * 60)
      volunteerMap[volunteerId].totalMinutes += minutes
      volunteerMap[volunteerId].shifts.push({
        id: s.id,
        clockInAt: clockInTime,
        clockOutAt: s.clockOutTime ? new Date(s.clockOutTime) : null,
        duration: minutes,
      })
    })

    return Object.values(volunteerMap).map(v => ({
      ...v,
      hours: Math.floor(v.totalMinutes / 60),
      minutes: v.totalMinutes % 60,
    }))
  }

  return {
    shifts,
    volunteers,
    loading,
    fetchShifts,
    fetchVolunteers,
    createShift,
    updateShift,
    clockIn,
    clockOut,
    forceClockOut,
    removeShift,
    scheduleShift,
    claimShift,
    releaseClaim,
    getVolunteerShifts,
    getAllVolunteerHours,
  }
})
