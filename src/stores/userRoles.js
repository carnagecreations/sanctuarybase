import { defineStore } from 'pinia'
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuthStore } from './auth'

// Lets a staff/admin assign a volunteer's real app role from the People tab.
// Staff can only move people between volunteer <-> staff; only admins can
// grant or revoke admin, matching the Firestore rules for users/{uid}.
export const useUserRolesStore = defineStore('userRoles', () => {
  const setRoleForEmail = async (email, role) => {
    const auth = useAuthStore()
    const actingRole = auth.user?.role
    const canAssign = actingRole === 'admin' || (actingRole === 'staff' && role !== 'admin')
    if (!canAssign) throw new Error('You do not have permission to assign that role')

    const emailKey = (email || '').toLowerCase().trim()
    if (!emailKey) throw new Error('This person needs an email on file first')

    const snap = await getDocs(query(collection(db, 'users'), where('emailLower', '==', emailKey)))

    if (!snap.empty) {
      const target = snap.docs[0]
      if (actingRole === 'staff' && !['volunteer', 'staff'].includes(target.data().role)) {
        throw new Error("Only an admin can change an admin's role")
      }
      await setDoc(doc(db, 'users', target.id), { role }, { merge: true })
      return { applied: true }
    }

    // They haven't logged in yet — queue the role for when their account is created.
    await setDoc(doc(db, 'roleInvites', emailKey), {
      role,
      invitedBy: auth.user?.email || 'unknown',
      invitedAt: new Date().toISOString(),
    })
    return { applied: false }
  }

  return { setRoleForEmail }
})
