<template>
  <div class="signup-page">
    <!-- Hero section -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="hero-icon">🐾</div>
        <h1 class="hero-title">Join our volunteer team</h1>
        <p class="hero-subtitle">Help care for animals at Saint Francis Rescue</p>
      </div>
    </div>

    <!-- Welcome card -->
    <div class="welcome-card">
      <div class="card-header">
        <h2>Why volunteer with us?</h2>
        <p>Make a real difference in animal welfare</p>
      </div>

      <div class="perks-grid">
        <div class="perk-card">
          <div class="perk-icon">🐴</div>
          <h3>Work with Amazing Animals</h3>
          <p>Horses, dogs, cats, farm animals and more in need of care</p>
        </div>
        <div class="perk-card">
          <div class="perk-icon">👥</div>
          <h3>Join a Community</h3>
          <p>Meet passionate people dedicated to animal welfare</p>
        </div>
        <div class="perk-card">
          <div class="perk-icon">🌱</div>
          <h3>Make Real Impact</h3>
          <p>Your hours directly improve animal lives and sanctuary operations</p>
        </div>
        <div class="perk-card">
          <div class="perk-icon">📈</div>
          <h3>Track Your Growth</h3>
          <p>Log hours, complete training, and build your volunteer portfolio</p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-primary" @click="$emit('next')">Get started →</button>
        <button class="btn-secondary" @click="$emit('toggle-login')" type="button">
          {{ showLogin ? '← Back' : 'Already a volunteer? Sign in' }}
        </button>
      </div>

      <!-- Login form (collapsible) -->
      <div v-if="showLogin" class="login-section">
        <div class="login-form">
          <div class="form-group">
            <label for="login-email" class="field-label">Email</label>
            <div class="input-wrapper">
              <span class="input-icon">✉️</span>
              <input v-model="loginEmail" id="login-email" type="email" class="form-input" placeholder="you@example.com" />
            </div>
          </div>
          <div class="form-group">
            <label for="login-password" class="field-label">Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input v-model="loginPassword" id="login-password" type="password" class="form-input" placeholder="••••••••" />
            </div>
          </div>
          <button class="btn-primary" @click="handleSignIn" type="button">Sign in</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ showLogin: Boolean })
const emit = defineEmits(['next', 'toggle-login', 'sign-in'])

const loginEmail = ref('')
const loginPassword = ref('')

const handleSignIn = () => {
  emit('sign-in', { email: loginEmail.value, password: loginPassword.value })
}
</script>

<style scoped>
.signup-page { padding: 0; }
.hero-section { background: linear-gradient(135deg, #4EFFC5 0%, #FF6B9D 100%); padding: 60px 24px; border-radius: 0; display: flex; align-items: center; justify-content: center; text-align: center; color: #fff; overflow: hidden; box-shadow: var(--shadow-2xl); }
.hero-background { position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,.1) 0%, transparent 50%); pointer-events: none; }
.hero-content { position: relative; z-index: 1; }
.hero-icon { font-size: 64px; display: block; margin-bottom: 16px; }
.hero-title { font-family: 'Fredoka One', sans-serif; font-size: 40px; font-weight: 900; color: #fff; margin: 0 0 8px; letter-spacing: -0.01em; line-height: 1.2; }
.hero-subtitle { font-size: 18px; color: rgba(255,255,255,.9); margin: 0; line-height: 1.4; }
.welcome-card { background: var(--color-surface-1); border-radius: 16px; padding: 40px; box-shadow: var(--shadow-xl); border: 1px solid var(--color-border-strong); display: flex; flex-direction: column; gap: 28px; margin: -40px 24px 24px; }
.card-header { text-align: center; }
.card-header h2 { font-family: 'Fredoka One', sans-serif; font-size: 28px; font-weight: 900; color: var(--color-text-primary); margin: 0 0 8px; line-height: 1.2; }
.card-header p { font-size: 16px; color: var(--color-text-tertiary); margin: 0; }
.perks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .perks-grid { grid-template-columns: 1fr; } }
.perk-card { background: var(--color-surface-2); border-radius: 12px; padding: 16px; text-align: center; border: 1px solid var(--color-border); transition: all 0.15s; }
.perk-card:hover { border-color: #4EFFC5; }
.perk-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.perk-card h3 { font-size: 14px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 4px; }
.perk-card p { font-size: 12px; color: var(--color-text-tertiary); margin: 0; }
.action-buttons { display: flex; flex-direction: column; gap: 12px; }
.btn-primary, .btn-secondary { padding: 12px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.btn-primary { background: linear-gradient(135deg, #4EFFC5, #FF6B9D); color: white; }
.btn-primary:hover { filter: brightness(1.1); }
.btn-secondary { background: var(--color-surface-2); color: var(--color-text-primary); border: 1px solid var(--color-border); }
.btn-secondary:hover { background: var(--color-surface-3); }
.login-section { border-top: 1px solid var(--color-border); padding-top: 20px; }
.login-form { display: flex; flex-direction: column; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 12px; font-size: 16px; }
.form-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 14px; background: var(--color-surface); }
.form-input:focus { outline: none; border-color: #4EFFC5; box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.1); }
</style>
