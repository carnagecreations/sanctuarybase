<template>
  <div class="volunteer-signup">
    <!-- Step 1: Welcome intro -->
    <SignupStepWelcome v-if="step === 1" :show-login="showLogin" @next="step = 2" @toggle-login="showLogin = !showLogin" @sign-in="handleSignIn" />

    <!-- Step 2: Account Info -->
    <template v-else-if="step === 2">
      <div class="signup-page">
        <div class="signup-container">
          <!-- Progress bar -->
          <div class="progress-section">
            <button class="back-button" @click="step = 1" type="button">← Back</button>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 33%"></div>
            </div>
            <div class="step-indicator">Step 1 of 3</div>
          </div>

          <!-- Form card -->
          <div class="form-card">
            <div class="form-header">
              <h2>Let's get started</h2>
              <p>This is how we'll know who you are</p>
            </div>

            <div v-if="error" class="error-alert" role="alert">
              <span class="error-icon">⚠️</span>
              <span>{{ error }}</span>
            </div>

            <div class="form-fields">
              <div class="form-group">
                <label for="name" class="field-label">Full name *</label>
                <div class="input-wrapper">
                  <span class="input-icon">👤</span>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="Jane Smith"
                    @keydown.enter="nextStep"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="field-label">Email *</label>
                <div class="input-wrapper">
                  <span class="input-icon">✉️</span>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    placeholder="jane@example.com"
                    @keydown.enter="nextStep"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="phone" class="field-label">Phone (optional)</label>
                <div class="input-wrapper">
                  <span class="input-icon">📱</span>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="password" class="field-label">Create password *</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="form-input"
                    placeholder="At least 8 characters"
                    @keydown.enter="nextStep"
                  />
                </div>
                <p class="field-hint">Use a mix of letters, numbers, and symbols</p>
              </div>
            </div>

            <button class="btn-primary" @click="nextStep" :disabled="loading" type="button">
              {{ loading ? 'Creating account…' : 'Next: Tell us about you' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Step 3: Tell us about you -->
    <template v-else-if="step === 3">
      <div class="signup-page">
        <div class="signup-container">
          <!-- Progress bar -->
          <div class="progress-section">
            <button class="back-button" @click="step = 2" type="button">← Back</button>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 66%"></div>
            </div>
            <div class="step-indicator">Step 2 of 3</div>
          </div>

          <!-- Form card -->
          <div class="form-card">
            <div class="form-header">
              <h2>Tell us about you</h2>
              <p>Help us match you with the right roles and opportunities</p>
            </div>

            <div v-if="error" class="error-alert" role="alert">
              <span class="error-icon">⚠️</span>
              <span>{{ error }}</span>
            </div>

            <div class="form-fields">
              <!-- Motivation textarea -->
              <div class="form-group">
                <label for="why" class="field-label">Why do you want to volunteer? *</label>
                <textarea
                  id="why"
                  v-model="form.why"
                  class="form-textarea"
                  placeholder="Tell us what motivates you to volunteer..."
                  rows="3"
                ></textarea>
              </div>

              <!-- Experience level -->
              <div class="form-group">
                <label class="field-label">Experience with animals *</label>
                <div class="options-grid">
                  <button
                    v-for="level in ['Beginner', 'Intermediate', 'Experienced']"
                    :key="level"
                    :class="['option-button', { active: form.experience === level }]"
                    @click="form.experience = level"
                    type="button"
                  >
                    {{ level }}
                  </button>
                </div>
              </div>

              <!-- Availability days -->
              <div class="form-group">
                <label class="field-label">What days can you volunteer? *</label>
                <div class="days-grid">
                  <button
                    v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
                    :key="day"
                    :class="['day-button', { active: form.availability.includes(day) }]"
                    @click="toggleDay(day)"
                    type="button"
                  >
                    {{ day }}
                  </button>
                </div>
              </div>

              <!-- Skills multi-select -->
              <div class="form-group">
                <label class="field-label">Your skills (select all that apply)</label>
                <div class="skills-grid">
                  <button
                    v-for="skill in ['Animal care', 'Cleaning', 'Feeding', 'Socializing', 'Medical', 'Admin']"
                    :key="skill"
                    :class="['skill-button', { active: form.skills.includes(skill) }]"
                    @click="toggleSkill(skill)"
                    type="button"
                  >
                    {{ skill }}
                  </button>
                </div>
              </div>
            </div>

            <button class="btn-primary" @click="nextStep" type="button">
              Next: Sign waiver
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Step 4: Waiver Signing -->
    <template v-else-if="step === 4">
      <div class="signup-page">
        <div class="signup-container">
          <!-- Progress bar -->
          <div class="progress-section">
            <button class="back-button" @click="step = 3" type="button">← Back</button>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 100%"></div>
            </div>
            <div class="step-indicator">Step 3 of 3</div>
          </div>

          <!-- Form card -->
          <div class="form-card">
            <div class="form-header">
              <h2>Sign the waiver</h2>
              <p>Required to complete your account and start volunteering</p>
            </div>

            <div v-if="error" class="error-alert" role="alert">
              <span class="error-icon">⚠️</span>
              <span>{{ error }}</span>
            </div>

            <!-- Waiver document -->
            <div class="waiver-document">
              <div class="waiver-title">Volunteer Release of Liability</div>
              <div class="waiver-content">
                <p><strong>{{ form.name }}</strong> (hereinafter "Volunteer") hereby voluntarily assumes all risks related to working as a volunteer with Saint Francis Rescue.</p>

                <p>The Volunteer acknowledges that volunteering may involve contact with animals and activities that could pose physical risks. The Volunteer has been informed of these potential risks and has chosen to proceed voluntarily.</p>

                <p>In consideration for being allowed to volunteer, the Volunteer hereby agrees to indemnify and hold harmless Saint Francis Rescue, its directors, officers, employees, and agents from and against all claims, damages, liabilities, and expenses arising out of or connected with the Volunteer's participation in volunteer activities.</p>

                <p>This includes but is not limited to: animal bites, scratches, allergic reactions, falls, and other injuries that may occur during volunteer work.</p>

                <p><strong>The Volunteer assumes full responsibility for any injuries or damages that occur during volunteer service.</strong></p>

                <p>I hereby certify that I am in good health and am physically able to volunteer. I have disclosed any relevant medical conditions or allergies to the organization.</p>

                <p>By signing below, I acknowledge that I have read, understood, and agree to the terms of this Release of Liability.</p>
              </div>
            </div>

            <!-- Signature section -->
            <div class="form-fields">
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="form.waiverSigned"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span>I understand and agree to the waiver terms *</span>
                </label>
              </div>

              <div class="form-group">
                <label for="signature" class="field-label">Digital signature *</label>
                <p class="field-hint">Type your full name exactly as shown above</p>
                <input
                  id="signature"
                  v-model="form.signature"
                  type="text"
                  class="form-input"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <button class="btn-primary" @click="submit" :disabled="loading" type="button">
              {{ loading ? 'Creating account…' : 'Complete signup' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Success screen -->
    <template v-else-if="step === 5">
      <div class="signup-page success-page">
        <div class="success-container">
          <div class="success-animation">
            <div class="success-icon">✅</div>
          </div>

          <h1 class="success-title">Welcome to the team, {{ form.name }}!</h1>
          <p class="success-subtitle">Your account is ready and you're all set to start volunteering</p>

          <!-- Summary card -->
          <div class="success-summary">
            <div class="summary-item">
              <span class="summary-icon">👤</span>
              <div>
                <div class="summary-label">Name</div>
                <div class="summary-value">{{ form.name }}</div>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">✉️</span>
              <div>
                <div class="summary-label">Email</div>
                <div class="summary-value">{{ form.email }}</div>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">📈</span>
              <div>
                <div class="summary-label">Experience level</div>
                <div class="summary-value">{{ form.experience }}</div>
              </div>
            </div>
          </div>

          <!-- Next steps -->
          <div class="next-steps">
            <h3>Next steps</h3>
            <ol>
              <li>Complete your volunteer profile</li>
              <li>Review safety guidelines and training materials</li>
              <li>Schedule your first shift with the team</li>
            </ol>
          </div>

          <button class="btn-primary" @click="() => signupComplete = true" type="button">
            Go to dashboard
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePeopleStore } from '../../stores/people'
import { useAuthStore } from '../../stores/auth'
import { useWaiversStore } from '../../stores/waivers'
import { useSignupStore } from '../../stores/signup'
import SignupStepWelcome from './SignupStepWelcome.vue'

const peopleStore = usePeopleStore()
const authStore = useAuthStore()
const waiversStore = useWaiversStore()
const signupStore = useSignupStore()

const step = ref(1)
const loading = ref(false)
const error = ref('')
const showLogin = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const signupComplete = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  why: '',
  experience: '',
  availability: [],
  skills: [],
  waiverSigned: false,
  signature: '',
})

const nextStep = () => {
  error.value = ''

  if (step.value === 2) {
    if (!form.value.name || !form.value.email || !form.value.password) {
      error.value = 'Name, email, and password are required'
      return
    }
    if (form.value.password.length < 8) {
      error.value = 'Password must be at least 8 characters'
      return
    }
  }

  if (step.value === 3) {
    if (!form.value.why || !form.value.experience || form.value.availability.length === 0) {
      error.value = 'Please fill in all required fields'
      return
    }
  }

  step.value++
}

const toggleDay = (day) => {
  const idx = form.value.availability.indexOf(day)
  if (idx >= 0) {
    form.value.availability.splice(idx, 1)
  } else {
    form.value.availability.push(day)
  }
}

const toggleSkill = (skill) => {
  const idx = form.value.skills.indexOf(skill)
  if (idx >= 0) {
    form.value.skills.splice(idx, 1)
  } else {
    form.value.skills.push(skill)
  }
}

const submit = async () => {
  error.value = ''

  if (!form.value.waiverSigned || !form.value.signature) {
    error.value = 'Please sign the waiver to continue'
    return
  }

  if (form.value.signature.toLowerCase() !== form.value.name.toLowerCase()) {
    error.value = 'Signature must match your full name'
    return
  }

  loading.value = true
  try {
    // Flag success screen BEFORE creating account so the overlay shows
    // when Firebase login triggers (prevents redirect to dashboard)
    signupStore.setSignupSuccess(form.value.name)

    // Create Firebase account (logs user in)
    await authStore.signUpWithEmail(form.value.email, form.value.password, form.value.name)

    // Now authenticated — write waiver and volunteer records
    await waiversStore.addWaiver({
      name: form.value.name,
      email: form.value.email,
      signed: true,
      signature: form.value.signature,
      signedAt: new Date().toISOString(),
      waiverVersion: '1.0',
    })

    await peopleStore.addPerson({
      type: 'volunteer',
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      experience: form.value.experience,
      availability: form.value.availability,
      skills: form.value.skills,
      why: form.value.why,
      waiverSigned: true,
      waiverSignedAt: new Date().toISOString(),
      status: 'active',
    })

    step.value = 5
  } catch (err) {
    signupStore.clearSignupSuccess()
    error.value = err.message || 'Failed to create account'
  } finally {
    loading.value = false
  }
}

const handleSignIn = async () => {
  if (showLogin.value) {
    loading.value = true
    error.value = ''
    try {
      await authStore.signInWithEmail(loginEmail.value, loginPassword.value)
    } catch (err) {
      error.value = err.message || 'Sign in failed'
    } finally {
      loading.value = false
    }
  } else {
    loading.value = true
    error.value = ''
    try {
      await authStore.signInWithEmail(form.value.email, form.value.password)
    } catch (err) {
      error.value = err.message || 'Sign in failed'
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════════════════════
   VOLUNTEER SIGNUP - MODERN REDESIGN
   Step-based signup flow with progress tracking and welcoming design
   ════════════════════════════════════════════════════════════════════════════ */

.volunteer-signup {
  min-height: 100vh;
  background: var(--color-bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-5);
  font-family: var(--font-family-primary);
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 1: WELCOME PAGE
   ════════════════════════════════════════════════════════════════════════════ */
.signup-page {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Hero section */
.hero-section {
  position: relative;
  background: var(--gradient-brand);
  border-radius: var(--radius-2xl);
  padding: var(--space-11);
  text-align: center;
  color: #fff;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}

.hero-background {
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
}

.hero-icon {
  font-size: var(--font-size-6xl);
  display: block;
  margin-bottom: var(--space-4);
}

.hero-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-black);
  color: #fff;
  line-height: var(--line-height-tight);
  margin: 0 0 var(--space-2);
  letter-spacing: var(--letter-spacing-tight);
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: rgba(255,255,255,.9);
  line-height: var(--line-height-normal);
  margin: 0;
}

/* Welcome card */
.welcome-card {
  background: var(--color-surface-1);
  border-radius: var(--radius-2xl);
  padding: var(--space-9);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-strong);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
  line-height: var(--line-height-tight);
}

.card-header p {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* Perks grid */
.perks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

@media (max-width: 640px) {
  .perks-grid {
    grid-template-columns: 1fr;
  }
}

.perk-card {
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  text-align: center;
  border: 1px solid var(--color-border);
  transition: all var(--duration-fast);
}

.perk-card:hover {
  border-color: var(--color-brand);
  background: var(--color-surface-3);
  transform: translateY(-2px);
}

.perk-card .perk-icon {
  font-size: var(--font-size-5xl);
  display: block;
  margin-bottom: var(--space-3);
}

.perk-card h3 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.perk-card p {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-strong);
}

/* Login section (collapsible) */
.login-section {
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border-strong);
  animation: slideDown var(--duration-normal) var(--ease-out);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ════════════════════════════════════════════════════════════════════════════
   STEPS 2-4: FORM PAGES
   ════════════════════════════════════════════════════════════════════════════ */
.signup-container {
  background: var(--color-surface-1);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-strong);
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}

@media (max-width: 640px) {
  .signup-container {
    padding: var(--space-6);
    gap: var(--space-6);
  }
}

/* Progress section */
.progress-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.back-button {
  background: none;
  border: none;
  color: var(--color-brand);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  transition: color var(--duration-fast);
  flex-shrink: 0;
  white-space: nowrap;
}

.back-button:hover {
  color: var(--color-brand-light);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border-strong);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-success);
  transition: width var(--duration-normal) var(--ease-out);
  border-radius: var(--radius-full);
}

.step-indicator {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
  white-space: nowrap;
}

/* Form card */
.form-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-header {
  text-align: center;
}

.form-header h2 {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
  line-height: var(--line-height-tight);
}

.form-header p {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: var(--line-height-normal);
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

/* Form fields */
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

.field-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-disabled);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

/* Input wrapper and fields */
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
}

.form-textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-surface-0);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  transition: all var(--duration-fast);
  box-sizing: border-box;
  resize: vertical;
  line-height: var(--line-height-normal);
}

.form-textarea::placeholder {
  color: var(--color-text-disabled);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: var(--shadow-focus);
}

/* Option buttons (multi-select) */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
}

.option-button {
  padding: var(--space-3);
  background: var(--color-surface-0);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: var(--font-family-primary);
}

.option-button:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.option-button.active {
  background: var(--gradient-success);
  border-color: var(--color-success);
  color: #fff;
}

/* Days grid */
.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: var(--space-2);
}

.day-button {
  padding: var(--space-3);
  background: var(--color-surface-0);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: var(--font-family-primary);
  text-align: center;
}

.day-button:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.day-button.active {
  background: var(--gradient-mint);
  border-color: var(--color-mint);
  color: #000;
  font-weight: var(--font-weight-black);
}

/* Skills grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--space-3);
}

.skill-button {
  padding: var(--space-3);
  background: var(--color-surface-0);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-family: var(--font-family-primary);
}

.skill-button:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.skill-button.active {
  background: var(--gradient-brand);
  border-color: var(--color-brand);
  color: #fff;
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 4: WAIVER SIGNING
   ════════════════════════════════════════════════════════════════════════════ */
.waiver-document {
  background: var(--color-surface-0);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-height: 320px;
  overflow-y: auto;
  margin: var(--space-2) 0;
}

.waiver-title {
  font-weight: var(--font-weight-black);
  font-size: var(--font-size-base);
  text-transform: uppercase;
  color: var(--color-brand);
  margin-bottom: var(--space-4);
  letter-spacing: var(--letter-spacing-loose);
}

.waiver-content {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.waiver-content p {
  margin: 0 0 var(--space-4);
}

.waiver-content p:last-child {
  margin-bottom: 0;
}

.waiver-content strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

/* Checkbox group */
.checkbox-group {
  padding: var(--space-4);
  background: var(--color-surface-0);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-success);
}

/* ════════════════════════════════════════════════════════════════════════════
   STEP 5: SUCCESS PAGE
   ════════════════════════════════════════════════════════════════════════════ */
.success-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.success-container {
  background: var(--color-surface-1);
  border-radius: var(--radius-2xl);
  padding: var(--space-9);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border-strong);
  max-width: 500px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.success-animation {
  display: block;
  margin-bottom: var(--space-4);
}

.success-icon {
  font-size: 80px;
  display: block;
  animation: bounceScale var(--duration-normal) var(--ease-bounce);
}

@keyframes bounceScale {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-black);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--space-2);
  letter-spacing: var(--letter-spacing-tight);
}

.success-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-5);
  line-height: var(--line-height-normal);
}

.success-summary {
  background: var(--color-surface-0);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  text-align: left;
  border: 1px solid var(--color-border);
}

.summary-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.summary-icon {
  font-size: var(--font-size-3xl);
  flex-shrink: 0;
  display: block;
}

.summary-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-loose);
  margin-bottom: var(--space-1);
}

.summary-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.next-steps {
  text-align: left;
  padding: var(--space-5);
  background: var(--color-mint-faint);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-mint-glow);
}

.next-steps h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
}

.next-steps ol {
  margin: 0;
  padding-left: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.next-steps li {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

/* ════════════════════════════════════════════════════════════════════════════
   BUTTONS
   ════════════════════════════════════════════════════════════════════════════ */
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

.btn-secondary {
  width: 100%;
  padding: var(--space-4);
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-brand);
  color: var(--color-brand);
  background: var(--color-surface-3);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ════════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .signup-page {
    gap: var(--space-5);
  }

  .hero-section {
    padding: var(--space-8);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .welcome-card {
    padding: var(--space-6);
    gap: var(--space-5);
  }

  .signup-container {
    padding: var(--space-6);
  }

  .success-container {
    padding: var(--space-7);
    margin: var(--space-5);
  }
}
</style>
