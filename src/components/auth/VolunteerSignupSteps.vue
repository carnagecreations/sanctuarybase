<!-- Simplified multi-step signup form component -->
<template>
  <div v-if="step === 2" class="signup-page">
    <div class="signup-container">
      <div class="progress-section">
        <button class="back-button" @click="$emit('prev')" type="button">← Back</button>
        <div class="progress-bar"><div class="progress-fill" :style="`width: ${progress}%`"></div></div>
        <div class="step-indicator">{{ stepLabel }}</div>
      </div>
      <div class="form-card">
        <div class="form-header">
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
        <slot />
        <div class="form-actions">
          <button class="btn-secondary" @click="$emit('prev')" type="button">← Back</button>
          <button class="btn-primary" @click="$emit('next')" type="button">Next →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  step: Number,
  stepNum: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 5 },
  title: String,
  subtitle: String,
})

const progress = (props.stepNum / props.totalSteps) * 100
const stepLabel = `Step ${props.stepNum} of ${props.totalSteps}`
</script>

<style scoped>
.signup-page { min-height: 100vh; background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%); padding: 24px; display: flex; align-items: center; justify-content: center; }
.signup-container { width: 100%; max-width: 500px; }
.progress-section { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.back-button { background: none; border: none; color: var(--ink-2); cursor: pointer; font-weight: 600; font-size: 14px; padding: 0; }
.back-button:hover { color: var(--ink); }
.progress-bar { flex: 1; height: 4px; background: var(--surface-2); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: #4EFFC5; transition: width 0.3s ease; }
.step-indicator { font-size: 12px; font-weight: 700; color: var(--ink-2); min-width: 80px; text-align: right; }
.form-card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.form-header { margin-bottom: 24px; text-align: center; }
.form-header h2 { font-family: 'Fredoka One', sans-serif; font-size: 24px; font-weight: 900; color: var(--ink); margin: 0 0 8px; }
.form-header p { font-size: 14px; color: var(--ink-3); margin: 0; }
.form-actions { display: flex; gap: 12px; margin-top: 24px; }
.btn-primary, .btn-secondary { padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all 0.15s; }
.btn-primary { background: #4EFFC5; color: white; flex: 1; }
.btn-primary:hover { filter: brightness(0.95); }
.btn-secondary { background: var(--surface-2); color: var(--ink); }
.btn-secondary:hover { background: var(--surface-3); }
</style>
