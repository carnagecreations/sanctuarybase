import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { useShiftsStore } from './shifts'

// The users/{uid}.role field is this app's single source of truth for
// permissions. A brand-new login creates its own doc in one write — role
// defaults to 'volunteer' unless a staff/admin already queued a role via
// roleInvites/{email} from the People tab, in which case the security
// rules themselves verify that invite (via get()) before allowing the
// create to claim it. The invite is deleted only after that create commits.
async function resolveUserRole(uid, email, displayName) {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    return snap.data().role || 'volunteer'
  }

  const emailKey = (email || '').toLowerCase()
  let role = 'volunteer'
  if (emailKey) {
    const inviteSnap = await getDoc(doc(db, 'roleInvites', emailKey))
    if (inviteSnap.exists()) role = inviteSnap.data().role || 'volunteer'
  }

  await setDoc(userRef, { email, emailLower: emailKey, name: displayName || 'User', role, createdAt: new Date().toISOString() })

  if (emailKey && role !== 'volunteer') {
    await deleteDoc(doc(db, 'roleInvites', emailKey)).catch(() => {})
  }
  return role
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  const clockInTime = ref(null)
  const isClocked = computed(() => !!clockInTime.value)
  const loading = ref(false)
  const currentShiftId = ref(null)

  const buildUser = async (fbUser, fallbackName) => {
    const role = await resolveUserRole(fbUser.uid, fbUser.email, fbUser.displayName || fallbackName)
    return {
      id: fbUser.uid,
      email: fbUser.email,
      name: fbUser.displayName || fallbackName || 'User',
      photo: fbUser.photoURL || null,
      role,
    }
  }

  /** Initializes Firebase authentication state listener. @returns {void} */
  const initializeAuth = () => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        user.value = await buildUser(currentUser)
      } else {
        user.value = null
      }
    })
  }

  /** Signs in user with Google provider. @returns {Promise<Object>} */
  const signInWithGoogle = async () => {
    loading.value = true
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      user.value = await buildUser(result.user)
      return user.value
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Creates a new user account with email and password. @returns {Promise<Object>} */
  const signUpWithEmail = async (email, password, name) => {
    loading.value = true
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      user.value = await buildUser(result.user, name)
      return user.value
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Signs in user with email and password. @returns {Promise<Object>} */
  const signInWithEmail = async (email, password) => {
    loading.value = true
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      user.value = await buildUser(result.user)
      return user.value
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /** Updates the current user's own account fields (users/{uid}) and refreshes local state. @returns {Promise<void>} */
  const updateProfile = async (updates) => {
    if (!user.value) return
    await updateDoc(doc(db, 'users', user.value.id), updates)
    user.value = { ...user.value, ...updates }
  }

  /** Signs out the current user. @returns {Promise<void>} */
  const signOut = async () => {
    loading.value = true
    try {
      await firebaseSignOut(auth)
      user.value = null
      clockInTime.value = null
    } catch (error) {
      // Silently fail on sign out errors
    } finally {
      loading.value = false
    }
  }

  /** Records user clock-in time. @returns {Promise<Date|null>} */
  const clockIn = async () => {
    try {
      const shiftsStore = useShiftsStore()
      if (!user.value) return null

      const shift = await shiftsStore.clockIn(user.value.id, user.value.name || user.value.email)
      clockInTime.value = new Date(shift.clockInTime)
      currentShiftId.value = shift.id
      return clockInTime.value
    } catch (err) {
      console.error('Clock in error:', err)
      throw err
    }
  }

  /** Records user clock-out time. @returns {Promise<void>} */
  const clockOut = async () => {
    try {
      const shiftsStore = useShiftsStore()
      if (!user.value) return null

      await shiftsStore.clockOut(user.value.id)
      clockInTime.value = null
      currentShiftId.value = null
    } catch (err) {
      console.error('Clock out error:', err)
      throw err
    }
  }

  return {
    user,
    isLoggedIn,
    clockInTime,
    isClocked,
    loading,
    currentShiftId,
    initializeAuth,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    updateProfile,
    signOut,
    clockIn,
    clockOut,
  }
})
