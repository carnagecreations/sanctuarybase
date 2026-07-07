<template>
  <div>
    <div class="species-pills">
      <button
        v-for="s in SPECIES"
        :key="s.id"
        class="sp-pill"
        :class="{ active: selectedSpecies?.id === s.id }"
        @click="selectedSpecies = s"
      >{{ s.emoji }} {{ s.name }}</button>
    </div>

    <template v-if="selectedSpecies">
      <AppCard :flat="true" class="species-card">
        <div class="sc-head">
          <span class="sc-emoji">{{ selectedSpecies.emoji }}</span>
          <div>
            <div class="sc-name">{{ selectedSpecies.name }}</div>
            <div class="sc-sub">Species health reference</div>
          </div>
        </div>

        <div class="sc-section">
          <div class="sc-label">Normal Vitals</div>
          <div class="vitals-mini">
            <div class="vm-item"><span>🌡️ Temp</span><strong>{{ selectedSpecies.vitals.temp }}</strong></div>
            <div class="vm-item"><span>❤️ Heart Rate</span><strong>{{ selectedSpecies.vitals.hr }}</strong></div>
            <div class="vm-item"><span>💨 Resp Rate</span><strong>{{ selectedSpecies.vitals.rr }}</strong></div>
            <div v-if="selectedSpecies.vitals.gut" class="vm-item"><span>🫁 Gut Sounds</span><strong>{{ selectedSpecies.vitals.gut }}</strong></div>
          </div>
        </div>

        <div class="sc-section">
          <div class="sc-label">Common Conditions</div>
          <div class="tag-list">
            <span v-for="c in selectedSpecies.conditions" :key="c" class="tag tag-warn">{{ c }}</span>
          </div>
        </div>

        <div class="sc-section">
          <div class="sc-label">⚠️ Emergency Warning Signs</div>
          <ul class="warn-list">
            <li v-for="w in selectedSpecies.warnings" :key="w">{{ w }}</li>
          </ul>
        </div>

        <div class="sc-section">
          <div class="sc-label">🏥 Veterinary Care</div>
          <ul class="care-list">
            <li v-for="c in selectedSpecies.vetCare" :key="c">{{ c }}</li>
          </ul>
        </div>
      </AppCard>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AppCard } from '../ui'

const selectedSpecies = ref(null)

const SPECIES = [
  {
    id: 'dog', emoji: '🐶', name: 'Dog',
    vitals: { temp: '99–102.5°F', hr: '60–140 bpm', rr: '15–30 brpm' },
    conditions: ['Parvovirus', 'Kennel cough', 'Mange', 'Heartworm', 'Distemper', 'Leptospirosis'],
    warnings: ['Seizures', 'Difficulty breathing', 'Pale/white gums', 'Sudden collapse', 'Bloated abdomen', 'Unresponsive'],
    vetCare: ['Feed 2× daily with species-appropriate food', 'Fresh water always available', 'Monthly parasite prevention', 'Check gums — healthy = pink & moist'],
  },
  {
    id: 'cat', emoji: '🐱', name: 'Cat',
    vitals: { temp: '100–102.5°F', hr: '120–140 bpm', rr: '20–30 brpm' },
    conditions: ['Upper respiratory infection', 'FIV / FeLV', 'Ringworm', 'Panleukopenia', 'Dental disease'],
    warnings: ['Not eating 24h+', 'Labored breathing', 'Straining to urinate', 'Third eyelid showing', 'Head pressing'],
    vetCare: ['Quarantine new arrivals 2–4 weeks', 'Monitor litter box output daily', 'Provide hiding spots to reduce stress'],
  },
  {
    id: 'horse', emoji: '🐴', name: 'Horse',
    vitals: { temp: '99–101°F', hr: '28–44 bpm', rr: '8–16 brpm', gut: 'Present all 4 quadrants' },
    conditions: ['Colic', 'Laminitis', 'Rain rot', 'Thrush', 'Heaves (RAO)', 'Strangles'],
    warnings: ['No gut sounds', 'Rolling / pawing aggressively', 'Not eating', 'Labored breathing', 'Severe lameness', 'Profuse sweating'],
    vetCare: ['Hay 24/7 (1.5–2% body weight)', 'Fresh water 8–12 gal/day', 'Hoof pick daily', 'Check for colic signs every AM & PM', 'Dental float annually'],
  },
  {
    id: 'goat', emoji: '🐐', name: 'Goat',
    vitals: { temp: '101–104°F', hr: '70–135 bpm', rr: '12–20 brpm' },
    conditions: ['Enterotoxemia', 'Caseous lymphadenitis (CL)', 'Pneumonia', 'Internal parasites', 'Pregnancy toxemia'],
    warnings: ['Bloat', 'Off feed', 'Grinding teeth', 'Hunched posture', 'Diarrhea (scours)', 'Sudden death'],
    vetCare: ['Check FAMACHA score monthly for parasite load', 'Rotate pastures', 'Provide loose goat minerals', 'Do NOT overfeed grain'],
  },
  {
    id: 'pig', emoji: '🐷', name: 'Pig',
    vitals: { temp: '101–103.5°F', hr: '60–100 bpm', rr: '10–20 brpm' },
    conditions: ['Erysipelas', 'PRRS', 'Mange', 'Pneumonia', 'Sunburn', 'Rectal prolapse'],
    warnings: ['High fever (>104°F)', 'Blue/purple skin', 'Sudden death', 'Severe lameness', 'Not eating 24h+'],
    vetCare: ['No sweat glands — must have mud wallow or shade', 'Root-enriched environment', 'Social — keep with companions', 'Monitor weight weekly'],
  },
  {
    id: 'rabbit', emoji: '🐰', name: 'Rabbit',
    vitals: { temp: '101–103°F', hr: '130–325 bpm', rr: '30–60 brpm' },
    conditions: ['GI stasis', 'Pasteurellosis (snuffles)', 'Myxomatosis', 'Dental malocclusion', 'Ear mites'],
    warnings: ['Not eating/defecating 12h+', 'Head tilt', 'Seizures', 'Labored breathing', 'Grinding teeth continuously'],
    vetCare: ['Unlimited timothy hay is essential — the most important part of diet', 'Minimal pellets', 'Never lift by ears', 'Handle gently — stress/shock can be fatal'],
  },
  {
    id: 'bird', emoji: '🦅', name: 'Bird / Poultry',
    vitals: { temp: '101–106°F', hr: '200–400 bpm', rr: '20–40 brpm' },
    conditions: ['Newcastle disease', 'Avian influenza', "Marek's disease", 'Coccidiosis', 'Bumblefoot', 'Egg binding'],
    warnings: ['Fluffed feathers / lethargy', 'Closed eyes during day', 'Nasal discharge', 'Limping / unable to stand', 'Sudden deaths in flock'],
    vetCare: ['Quarantine new birds 30 days — biosecurity critical', 'Provide grit and oyster shell', 'Clean water daily', 'Report suspected avian flu to state vet'],
  },
  {
    id: 'donkey', emoji: '🫏', name: 'Donkey / Mule',
    vitals: { temp: '97.2–100.5°F', hr: '36–52 bpm', rr: '12–20 brpm' },
    conditions: ['Hyperlipemia', 'Laminitis', 'Lungworm', 'Skin parasites', 'Dental disease'],
    warnings: ['Off food (emergency — hyperlipemia risk)', 'Foot heat / lameness', 'Rapid breathing', 'Depression / not moving', 'Swollen legs'],
    vetCare: ['Donkeys are stoic — illness often hidden until severe', 'Restrict lush grass (laminitis risk)', 'Dental float every 1–2 years', 'Hoof trim every 6–8 weeks'],
  },
]

selectedSpecies.value = selectedSpecies.value || (SPECIES.length > 0 ? SPECIES[0] : null)
</script>

<style scoped>
.species-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.sp-pill {
  padding: 8px 14px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.15s;
}

.sp-pill:hover {
  border-color: var(--mint);
  background: var(--surface-3);
  color: var(--mint);
}

.sp-pill.active {
  background: var(--mint);
  border-color: var(--mint);
  color: white;
}

.species-card {
  overflow: visible;
}

.sc-head {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.sc-emoji {
  font-size: 32px;
  line-height: 1;
}

.sc-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 2px;
}

.sc-sub {
  font-size: 12px;
  color: var(--ink-3);
}

.sc-section {
  margin-bottom: 20px;
}

.sc-section:last-child {
  margin-bottom: 0;
}

.sc-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.vitals-mini {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.vm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: var(--surface-2);
  border-radius: 6px;
  font-size: 12px;
}

.vm-item span {
  color: var(--ink-3);
}

.vm-item strong {
  color: var(--mint);
  font-weight: 700;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 107, 107, 0.1);
  color: var(--coral);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.warn-list,
.care-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--ink);
  line-height: 1.6;
}

.warn-list li,
.care-list li {
  margin-bottom: 6px;
}
</style>
