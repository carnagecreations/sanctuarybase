<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1A1033] via-[#22163F] to-[#1A1033] flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center space-y-4 mb-8">
        <div class="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="Logo" class="h-12 w-12">
          <h1 class="text-3xl font-black font-fredoka" style="color: var(--mint)">Mission Control</h1>
        </div>
        <p class="text-sm" style="color: var(--ink-3)">Admin Dashboard</p>
      </div>

      <!-- Main Card with Gradient Border -->
      <div class="relative group">
        <div class="absolute inset-0 bg-gradient-to-r from-[#4EFFC5] via-[#FF7A45] to-[#4EFFC5] rounded-2xl blur opacity-20 group-hover:opacity-30 transition"></div>
        <div class="relative bg-[#2E1F5E] rounded-2xl p-8 space-y-6 border border-[rgba(255,255,255,0.1)]">

          <!-- Error Message -->
          <div v-if="error" class="bg-[rgba(255,107,107,0.15)] border border-[#FF6B6B] text-[#FF9999] px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <!-- Google Sign In Button -->
          <button
            @click="handleSignIn"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition"
            style="background: var(--mint); color: var(--bg); border: 2px solid var(--mint)"
            @mouseover="$el.style.filter = 'brightness(0.95)'"
            @mouseout="$el.style.filter = 'brightness(1)'"
            :style="{ opacity: loading ? 0.6 : 1 }"
          >
            <span v-if="!loading" class="text-lg">🔐</span>
            <span v-else class="animate-spin inline-block">⟳</span>
            {{ loading ? 'Signing in...' : 'Sign in with Google' }}
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-[rgba(255,255,255,0.1)]"></div>
            <span style="color: var(--ink-3)" class="text-xs font-semibold">OR</span>
            <div class="flex-1 h-px bg-[rgba(255,255,255,0.1)]"></div>
          </div>

          <!-- Demo Button -->
          <button
            @click="handleDemoLogin"
            :disabled="loading"
            class="w-full px-4 py-3 rounded-lg font-bold text-sm transition"
            style="background: var(--mint); color: var(--ink); border: 2px solid var(--mint)"
            @mouseover="$el.style.filter = 'brightness(0.95)'"
            @mouseout="$el.style.filter = 'brightness(1)'"
            :style="{ opacity: loading ? 0.6 : 1 }"
          >
            {{ loading ? 'Loading demo...' : '👉 Try Demo' }}
          </button>

          <!-- Info -->
          <div class="space-y-2 text-xs pt-4 border-t" style="border-color: rgba(255,255,255,0.1); color: var(--ink-3)">
            <p><span style="color: var(--mint)">📧</span> <strong>Demo account:</strong> admin@yumareptiles.com</p>
            <p><span style="color: var(--mint)">🔒</span> <strong>Security:</strong> Google OAuth 2.0</p>
          </div>

          <!-- Features Grid -->
          <div class="grid grid-cols-2 gap-2 pt-4 text-xs" style="color: var(--ink-2)">
            <div class="flex items-center gap-2">
              <span>🐾</span>
              <span>Animal Records</span>
            </div>
            <div class="flex items-center gap-2">
              <span>👥</span>
              <span>Volunteers</span>
            </div>
            <div class="flex items-center gap-2">
              <span>💰</span>
              <span>Finances</span>
            </div>
            <div class="flex items-center gap-2">
              <span>💊</span>
              <span>Medical Care</span>
            </div>
            <div class="flex items-center gap-2">
              <span>📅</span>
              <span>Scheduling</span>
            </div>
            <div class="flex items-center gap-2">
              <span>📊</span>
              <span>Reports</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs" style="color: var(--ink-3)">
        <span style="color: var(--mint)">v2.0-beta</span> | Modern Vue 3 rebuild
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUIStore } from '../../stores/ui'

const auth = useAuthStore()
const ui = useUIStore()
const loading = ref(false)
const error = ref('')

const handleSignIn = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.signInWithGoogle()
  } catch (err) {
    error.value = 'Google sign-in failed. Try the demo instead.'
    console.error('Sign in error:', err)
  } finally {
    loading.value = false
  }
}

const handleDemoLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.signInDemo()
  } catch (err) {
    error.value = 'Demo login failed'
    console.error('Demo error:', err)
  } finally {
    loading.value = false
  }
}
</script>
