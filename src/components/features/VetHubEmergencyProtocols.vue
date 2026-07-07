<template>
  <div>
    <!-- Emergency action bar -->
    <div class="emergency-bar">
      <div class="eb-title">🚨 Emergency Protocols</div>
      <div class="eb-grid">
        <button
          v-for="p in emergencyProtocols"
          :key="p.id"
          class="ep-btn"
          :style="{ '--accent': p.color }"
          @click="selectProtocol(p)"
        >
          <span class="ep-icon">{{ p.icon }}</span>
          <span class="ep-name">{{ p.name }}</span>
        </button>
      </div>
    </div>

    <!-- Protocol Modal -->
    <AppModal v-if="selectedProtocol" :open="true" :title="`${selectedProtocol.icon} ${selectedProtocol.name}`" size="md" @close="close">
      <div class="proto-disclaimer">⚠️ Call a vet immediately. This is for initial stabilization only.</div>
      <div class="proto-steps">
        <div v-for="(step, i) in selectedProtocol.steps" :key="i" class="proto-step">
          <div class="ps-num">{{ i + 1 }}</div>
          <div class="ps-text">{{ step }}</div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AppModal } from '../ui'

const selectedProtocol = ref(null)

const emergencyProtocols = [
  {
    id: 1,
    name: 'Respiratory Distress',
    icon: '🫁',
    color: '#FF6B6B',
    steps: [
      'Remove from enclosure to minimize stress',
      'Place in cool, quiet, dark container with ventilation',
      'Do NOT forcefully restrain the animal',
      'Keep mouth/nostrils clear of debris',
      'Monitor closely and contact vet immediately',
      'Prepare transport container for emergency transport',
    ],
  },
  {
    id: 2,
    name: 'Bleeding/Hemorrhage',
    icon: '🩸',
    color: '#FF4444',
    steps: [
      'Remain calm; stress makes bleeding worse',
      'If external: apply gentle pressure with clean gauze',
      'Do not apply a tourniquet unless arterial bleeding in limb',
      'Keep animal in warm, dark, quiet space',
      'Minimize handling and movement',
      'Transport immediately to emergency vet with gauze in place',
    ],
  },
  {
    id: 3,
    name: 'Impaction',
    icon: '⚠️',
    color: '#FFA500',
    steps: [
      'Provide warm (not hot) soak for 15-30 minutes',
      'Gently massage abdomen in circular motions',
      'Offer food or water only if animal is responsive',
      'Do not force the animal to defecate',
      'If no improvement in 12-24 hours, contact vet',
      'Monitor for lethargy or refusal to eat',
    ],
  },
  {
    id: 4,
    name: 'Thermal Burn',
    icon: '🔥',
    color: '#FF6347',
    steps: [
      'Immediately remove from heat source',
      'Allow to cool gradually with room temperature water (not ice)',
      'Do not apply ice directly to skin',
      'Leave mild burns unbandaged to prevent infection',
      'Severe burns: cover loosely with clean cloth',
      'Contact vet for evaluation, risk of infection high',
    ],
  },
  {
    id: 5,
    name: 'Neurological (Seizure)',
    icon: '⚡',
    color: '#9370DB',
    steps: [
      'Do NOT restrain; let seizure run its course',
      'Move nearby objects to prevent injury',
      'Note the duration and characteristics of seizure',
      'Keep the environment calm and quiet',
      'After seizure ends: keep warm and undisturbed',
      'Contact vet immediately after; seizures are serious',
    ],
  },
  {
    id: 6,
    name: 'Escape/Injury Risk',
    icon: '🏃',
    color: '#FF8C00',
    steps: [
      'Carefully corner the animal with minimal stress',
      'Use a towel or cloth to gently guide it back',
      'Check for visible injuries (scratches, cuts)',
      'Provide warmth and a secure enclosure',
      'Monitor for shock or stress (lethargy, trembling)',
      'Contact vet if injuries present or behavior abnormal',
    ],
  },
]

const selectProtocol = (protocol) => {
  selectedProtocol.value = protocol
}

const close = () => {
  selectedProtocol.value = null
}
</script>

<style scoped>
.emergency-bar {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 165, 0, 0.08));
  border: 1.5px solid rgba(255, 107, 107, 0.3);
  border-radius: var(--r);
  padding: 16px;
  margin-bottom: 16px;
}

.eb-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.eb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.ep-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface-2);
  border: 1.5px solid var(--accent, var(--border));
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.ep-btn:hover {
  background: var(--surface-3);
  border-color: var(--accent, var(--mint));
  transform: translateY(-2px);
}

.ep-icon {
  font-size: 18px;
}

.ep-name {
  text-align: left;
}

.proto-disclaimer {
  background: rgba(255, 107, 107, 0.1);
  border-left: 3px solid var(--coral);
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--coral);
  font-weight: 600;
  margin-bottom: 12px;
}

.proto-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.proto-step {
  display: flex;
  gap: 12px;
}

.ps-num {
  min-width: 28px;
  width: 28px;
  height: 28px;
  background: var(--mint);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.ps-text {
  font-size: 13px;
  color: var(--ink);
  line-height: 1.5;
}
</style>
