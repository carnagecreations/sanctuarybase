import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../services/firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'

export const useVolunteerQuestionsStore = defineStore('volunteerQuestions', () => {
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)
  let unsubscribe = null

  /** Live-subscribes to every question (admin) — a plain unfiltered query
   *  works here because isPrivileged() in the rules doesn't depend on the
   *  document, so Firestore can prove it's safe without a matching where(). @returns {void} */
  const watchAll = () => {
    if (unsubscribe) return
    const q = query(collection(db, 'volunteerQuestions'), orderBy('createdAt', 'desc'))
    unsubscribe = onSnapshot(q, (snapshot) => {
      questions.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    }, (err) => {
      error.value = err.message
      console.error('Volunteer questions listener error:', err)
    })
  }

  /** Live-subscribes to one volunteer's own questions — filtered by askedById
   *  so a non-admin's read satisfies the security rule's self-only clause. @returns {void} */
  const watchOwn = (userId) => {
    if (unsubscribe) return
    const q = query(collection(db, 'volunteerQuestions'), where('askedById', '==', userId))
    unsubscribe = onSnapshot(q, (snapshot) => {
      questions.value = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
    }, (err) => {
      error.value = err.message
      console.error('Volunteer questions listener error:', err)
    })
  }

  /** Submits a new question. @returns {Promise<void>} */
  const askQuestion = async ({ askedById, askedByName, askedByEmail, question }) => {
    loading.value = true
    try {
      await addDoc(collection(db, 'volunteerQuestions'), {
        askedById, askedByName, askedByEmail, question,
        status: 'open',
        answer: '',
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Records staff's reply and marks the question answered. @returns {Promise<void>} */
  const answerQuestion = async (id, answer) => {
    try {
      await updateDoc(doc(db, 'volunteerQuestions', id), {
        answer, status: 'answered', answeredAt: serverTimestamp(),
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Deletes a question (staff/admin only, per rules). @returns {Promise<void>} */
  const deleteQuestion = async (id) => {
    try {
      await deleteDoc(doc(db, 'volunteerQuestions', id))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /** Stops the active listener. @returns {void} */
  const cleanup = () => {
    unsubscribe?.()
    unsubscribe = null
    questions.value = []
  }

  return { questions, loading, error, watchAll, watchOwn, askQuestion, answerQuestion, deleteQuestion, cleanup }
})
