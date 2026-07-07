<template>
  <div class="welcome-page">
    <!-- Left — Hero section (desktop only) -->
    <div class="hero-panel">
      <div class="hero-content">
        <!-- Top: Branding -->
        <div class="hero-header">
          <div class="brand-hero">
            <span class="brand-icon">🐾</span>
            <h1 class="brand-name">SanctuaryBase</h1>
          </div>
          <p class="brand-tagline">Volunteer Platform for Saint Francis Rescue</p>
        </div>

        <!-- Middle: Main value prop -->
        <div class="hero-main">
          <div class="hero-headline">Welcome to SanctuaryBase</div>
          <p class="hero-subheading">Your volunteer platform for caring and community</p>

          <!-- Volunteer benefits -->
          <div class="benefits-list">
            <div class="benefit-item">
              <span class="benefit-icon">⏱️</span>
              <div>
                <div class="benefit-title">Track Your Hours</div>
                <p class="benefit-desc">Log volunteer hours and see your impact</p>
              </div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📚</span>
              <div>
                <div class="benefit-title">Access Training</div>
                <p class="benefit-desc">Learn best practices and grow your skills</p>
              </div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📅</span>
              <div>
                <div class="benefit-title">Manage Schedules</div>
                <p class="benefit-desc">Coordinate shifts and manage availability</p>
              </div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">📢</span>
              <div>
                <div class="benefit-title">Stay Updated</div>
                <p class="benefit-desc">Get announcements and important updates</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom: Stats and footer -->
        <div class="hero-footer">
          <div class="org-stats">
            <div class="stat-block">
              <div class="stat-value">100%</div>
              <div class="stat-label">Volunteer Run</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <div class="stat-value">14+</div>
              <div class="stat-label">Years Serving</div>
            </div>
          </div>
          <p class="footer-text">Built for animal lovers, by volunteers</p>
        </div>
      </div>
    </div>

    <!-- Right — Auth form -->
    <div class="auth-panel">
      <div class="auth-container">
        <!-- Mobile header (visible only on mobile) -->
        <div class="mobile-header">
          <span class="mobile-icon">🐾</span>
          <div>
            <div class="mobile-title">SanctuaryBase</div>
            <div class="mobile-subtitle">Volunteer Portal</div>
          </div>
        </div>

        <!-- Sign in card -->
        <div class="auth-form-card">
          <div class="form-header">
            <h2 class="form-title">Welcome back</h2>
            <p class="form-subtitle">Sign in to your volunteer account</p>
          </div>

          <!-- Error message -->
          <div v-if="error" class="error-alert" role="alert">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>

          <!-- Google Sign In -->
          <button
            class="btn-google"
            @click="handleGoogleSignIn"
            :disabled="loading"
            type="button"
          >
            <svg class="google-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span v-if="loading && loadingMethod === 'google'" class="btn-spinner">Signing in…</span>
            <span v-else>Continue with Google</span>
          </button>

          <!-- Divider -->
          <div class="divider-line">
            <span class="divider-text">or</span>
          </div>

          <!-- Email & Password fields -->
          <div class="form-fields">
            <div class="form-group">
              <label for="email" class="field-label">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-input"
                  placeholder="you@example.com"
                  autocomplete="email"
                  @keydown.enter="handleSignIn"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="field-label">Password</label>
              <div class="input-wrapper password-wrapper">
                <span class="input-icon">🔒</span>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  @keydown.enter="handleSignIn"
                />
                <button
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                  type="button"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword ? '👁️‍🗨️' : '👁️' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Sign in button -->
          <button
            class="btn-primary"
            @click="handleSignIn"
            :disabled="loading"
            type="button"
          >
            <span v-if="loading && loadingMethod === 'email'" class="btn-spinner">Signing in…</span>
            <span v-else>Sign in</span>
          </button>

          <!-- Divider or new volunteer -->
          <div class="form-footer">
            <p class="footer-text">
              New volunteer?
              <button
                class="link-button"
                @click="$emit('switch-to-volunteer')"
                type="button"
              >
                Create account →
              </button>
            </p>
            <button class="link-secondary" type="button">Forgot password?</button>
          </div>
        </div>

        <!-- Footer note -->
        <p class="auth-footer-note">
          <span class="footer-icon">🔐</span>
          Secured with Google OAuth 2.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

defineEmits(['switch-to-volunteer'])
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const loadingMethod = ref('')
const error = ref('')

const handleSignIn = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }
  loading.value = true
  loadingMethod.value = 'email'
  try {
    await auth.signInWithEmail(email.value, password.value)
  } catch (err) {
    const code = err.code || ''
    error.value =
      code.includes('user-not-found') ? 'No account found with that email.' :
      code.includes('wrong-password') || code.includes('invalid-credential') ? 'Incorrect password.' :
      code.includes('invalid-email') ? 'Invalid email address.' :
      'Sign in failed — check your credentials and try again.'
  } finally {
    loading.value = false
    loadingMethod.value = ''
  }
}

const handleGoogleSignIn = async () => {
  error.value = ''
  loading.value = true
  loadingMethod.value = 'google'
  try {
    await auth.signInWithGoogle()
  } catch {
    error.value = 'Google sign-in failed. Make sure popups are allowed and try again.'
  } finally {
    loading.value = false
    loadingMethod.value = ''
  }
}
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════════════════════
   WELCOME SCREEN - VOLUNTEER-FRIENDLY REDESIGN
   Modern, clean, welcoming auth page with split hero + form layout
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Base Container ────────────────────────────────────────────────────── */
.welcome-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-1);
  font-family: var(--font-family-primary);
}

@media (min-width: 1024px) {
  .welcome-page {
    flex-direction: row;
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   LEFT: HERO PANEL (Desktop only)
   ════════════════════════════════════════════════════════════════════════════ */
.hero-panel {
  display: none;
}

@media (min-width: 1024px) {
  .hero-panel {
    flex: 1;
    background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-mint) 100%);
    padding: var(--space-11);
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Subtle background pattern */
  .hero-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255,255,255,.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0,0,0,.1) 0%, transparent 50%);
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-10);
  }
}

/* Hero header with branding */
.hero-header {
  display: none;
}

@media (min-width: 1024px) {
  .hero-header {
    display: block;
  }

  .brand-hero {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-3);
  }

  .brand-icon {
    font-size: 48px;
    line-height: 1;
  }

  .brand-name {
    font-family: var(--font-family-display);
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-black);
    color: #fff;
    line-height: var(--line-height-tight);
  }

  .brand-tagline {
    font-size: var(--font-size-lg);
    color: rgba(255,255,255,.85);
    line-height: var(--line-height-normal);
    font-weight: var(--font-weight-medium);
  }
}

/* Main hero content */
.hero-main {
  display: none;
}

@media (min-width: 1024px) {
  .hero-main {
    display: block;
  }

  .hero-headline {
    font-family: var(--font-family-display);
    font-size: var(--font-size-6xl);
    font-weight: var(--font-weight-black);
    color: #fff;
    line-height: var(--line-height-tight);
    margin-bottom: var(--space-3);
    letter-spacing: var(--letter-spacing-tight);
  }

  .hero-subheading {
    font-size: var(--font-size-2xl);
    color: rgba(255,255,255,.9);
    line-height: var(--line-height-normal);
    margin-bottom: var(--space-8);
  }
}

/* Volunteer benefits list */
.benefits-list {
  display: none;
}

@media (min-width: 1024px) {
  .benefits-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .benefit-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .benefit-icon {
    font-size: var(--font-size-4xl);
    flex-shrink: 0;
    display: block;
  }

  .benefit-title {
    font-weight: var(--font-weight-bold);
    color: #fff;
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-1);
  }

  .benefit-desc {
    color: rgba(255,255,255,.8);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    margin: 0;
  }
}

/* Footer stats */
.hero-footer {
  display: none;
}

@media (min-width: 1024px) {
  .hero-footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding-top: var(--space-8);
    border-top: 1px solid rgba(255,255,255,.2);
  }

  .org-stats {
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }

  .stat-block {
    flex: 1;
  }

  .stat-value {
    font-family: var(--font-family-display);
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-black);
    color: #fff;
    line-height: 1;
    margin-bottom: var(--space-2);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: rgba(255,255,255,.75);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-loose);
  }

  .stat-divider {
    width: 1px;
    height: 48px;
    background: rgba(255,255,255,.2);
  }

  .footer-text {
    font-size: var(--font-size-base);
    color: rgba(255,255,255,.75);
    margin: 0;
    font-weight: var(--font-weight-medium);
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   RIGHT: AUTH PANEL (Form side)
   ════════════════════════════════════════════════════════════════════════════ */
.auth-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-bg-1);
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .auth-panel {
    width: 460px;
    padding: var(--space-11);
    background: var(--color-surface-1);
    border-left: 1px solid var(--color-border-strong);
    box-shadow: var(--shadow-2xl);
    min-height: auto;
    min-height: 100vh;
  }
}

.auth-container {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Mobile header */
.mobile-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-strong);
  margin-bottom: var(--space-2);
}

@media (min-width: 1024px) {
  .mobile-header {
    display: none;
  }
}

.mobile-icon {
  font-size: var(--font-size-5xl);
}

.mobile-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--space-1);
  font-weight: var(--font-weight-black);
}

.mobile-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-semibold);
}

/* ── Auth form card ────────────────────────────────────────────────────── */
.auth-form-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
}

.form-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  line-height: var(--line-height-normal);
  margin: 0;
}

/* Error alert */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-error-faint);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-error-light);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

.error-icon {
  flex-shrink: 0;
  display: block;
}

/* ── Buttons ────────────────────────────────────────────────────────── */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--duration-fast);
  box-shadow: var(--shadow-xs);
}

.btn-google:hover:not(:disabled) {
  border-color: var(--color-brand);
  background: var(--color-surface-3);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-google:active:not(:disabled) {
  transform: translateY(0);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Primary button */
.btn-primary {
  width: 100%;
  padding: var(--space-4);
  background: var(--gradient-success);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--duration-fast);
  box-shadow: var(--shadow-glow-success);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: var(--shadow-glow-success), var(--shadow-lg);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  display: inline-block;
}

/* Link buttons */
.link-button {
  background: none;
  border: none;
  color: var(--color-brand);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  cursor: pointer;
  font-family: var(--font-family-primary);
  padding: 0;
  display: inline;
  transition: color var(--duration-fast);
}

.link-button:hover {
  color: var(--color-brand-light);
  text-decoration: underline;
}

.link-secondary {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-family: var(--font-family-primary);
  padding: 0;
  transition: color var(--duration-fast);
  font-weight: var(--font-weight-medium);
}

.link-secondary:hover {
  color: var(--color-brand);
}

/* ── Divider ────────────────────────────────────────────────────────── */
.divider-line {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-2) 0;
}

.divider-line::before,
.divider-line::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-strong);
}

.divider-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-loose);
}

/* ── Form fields ────────────────────────────────────────────────────── */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-loose);
  color: var(--color-text-tertiary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-3);
  font-size: var(--font-size-lg);
  pointer-events: none;
  flex-shrink: 0;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-9);
  background: var(--color-surface-0);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  transition: all var(--duration-fast);
  box-sizing: border-box;
  -webkit-appearance: none;
}

.form-input::placeholder {
  color: var(--color-text-disabled);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: var(--shadow-focus);
  background: var(--color-surface-0);
}

/* Password wrapper with toggle */
.password-wrapper {
  padding-right: var(--space-1);
}

.toggle-password {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  transition: color var(--duration-fast);
}

.toggle-password:hover {
  color: var(--color-text-secondary);
}

/* ── Form footer ────────────────────────────────────────────────────── */
.form-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-strong);
}

.footer-text {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: var(--line-height-normal);
}

.footer-text .link-button {
  margin-left: var(--space-1);
}

/* ── Auth footer note ────────────────────────────────────────────────── */
.auth-footer-note {
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-disabled);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.footer-icon {
  display: inline-block;
}

/* ════════════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════════════════════════════════════════ */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.auth-form-card {
  animation: slideInRight var(--duration-normal) var(--ease-out);
}

/* Responsive adjustments for small screens */
@media (max-width: 768px) {
  .auth-panel {
    padding: var(--space-5);
    min-height: auto;
  }

  .auth-container {
    gap: var(--space-5);
  }

  .form-title {
    font-size: var(--font-size-3xl);
  }

  .btn-google,
  .btn-primary {
    padding: var(--space-3);
    font-size: var(--font-size-sm);
  }
}
</style>
