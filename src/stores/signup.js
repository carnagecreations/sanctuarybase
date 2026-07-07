import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSignupStore = defineStore('signup', () => {
  const showSuccessScreen = ref(false)
  const volunteerName = ref('')

  /** Sets signup success state. @returns {void} */
  const setSignupSuccess = (name) => {
    volunteerName.value = name
    showSuccessScreen.value = true
  }

  /** Clears signup success state. @returns {void} */
  const clearSignupSuccess = () => {
    showSuccessScreen.value = false
    volunteerName.value = ''
  }

  return {
    showSuccessScreen,
    volunteerName,
    setSignupSuccess,
    clearSignupSuccess,
  }
})
