<template>
  <PageContainer>

    <!-- Hero Banner -->
    <div class="vet-hero">
      <div class="vet-hero-content">
        <div class="vet-hero-title">🩺 Vet Hub</div>
        <div class="vet-hero-sub">Emergency protocols · Species guides · AI assistant · Contacts</div>
      </div>
      <div class="vet-stat-chips">
        <div class="vsc" :class="medicalAnimals.length ? 'vsc-alert' : 'vsc-ok'">
          <span class="vsc-num">{{ medicalAnimals.length }}</span>
          <span class="vsc-lbl">On Watch</span>
        </div>
        <div class="vsc vsc-blue">
          <span class="vsc-num">{{ SPECIES.length }}</span>
          <span class="vsc-lbl">Species</span>
        </div>
        <div class="vsc vsc-purple">
          <span class="vsc-num">{{ contacts.length }}</span>
          <span class="vsc-lbl">Contacts</span>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="hub-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="hub-tab"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >{{ t.emoji }} {{ t.label }}</button>
    </div>

    <!-- ─── OVERVIEW ─── -->
    <template v-if="activeTab === 'overview'">
      <!-- Emergency Protocols Component -->
      <VetHubEmergencyProtocols />

      <div class="section-title" style="margin-top:16px">Animals Needing Attention</div>
      <template v-if="medicalAnimals.length">
        <AppCard
          v-for="a in medicalAnimals"
          :key="a.id"
          :flat="true"
          class="animal-row-card"
          @click="ui.selectAnimal(a)"
        >
          <div class="ar-row">
            <span class="ar-emoji">{{ getEmoji(a.species) }}</span>
            <div class="ar-info">
              <div class="ar-name">{{ a.name }}</div>
              <div class="ar-sub">{{ a.species }}<template v-if="a.location"> · {{ a.location }}</template></div>
            </div>
            <AppBadge type="high">{{ statusLabel(a.status) }}</AppBadge>
          </div>
        </AppCard>
      </template>
      <EmptyState v-else icon="✅" title="No animals flagged" message="All clear — no animals currently on medical hold." />

      <div class="section-title" style="margin-top:16px">Vitals at a Glance</div>
      <AppCard :flat="true" style="overflow-x:auto">
        <div class="vitals-table">
          <div class="vt-header">
            <span>Species</span><span>Temp (°F)</span><span>Heart Rate</span><span>Resp Rate</span>
          </div>
          <div v-for="s in SPECIES" :key="s.id" class="vt-row">
            <span>{{ s.emoji }} {{ s.name }}</span>
            <span>{{ s.vitals.temp }}</span>
            <span>{{ s.vitals.hr }}</span>
            <span>{{ s.vitals.rr }}</span>
          </div>
        </div>
      </AppCard>
    </template>

    <!-- ─── SPECIES GUIDE ─── -->
    <template v-if="activeTab === 'species'">
      <VetHubSpeciesGuide />
    </template>

    <!-- ─── SYMPTOM CHECKER ─── -->
    <template v-if="activeTab === 'symptoms'">
      <div class="section-title">Symptom Checker</div>
      <AppCard :flat="true" class="symptom-card">
        <div class="sc-step">
          <div class="sc-step-label">1. Select species</div>
          <div class="sym-species-pills">
            <button v-for="s in SPECIES" :key="s.id" class="sp-pill" :class="{ active: symSpecies?.id === s.id }" @click="symSpecies = s; symSigns = []; symResult = null">
              {{ s.emoji }} {{ s.name }}
            </button>
          </div>
        </div>

        <template v-if="symSpecies">
          <div class="sc-step" style="margin-top:16px">
            <div class="sc-step-label">2. Select all symptoms you observe</div>
            <div class="sym-signs-grid">
              <button
                v-for="sign in symSpecies.warnings"
                :key="sign"
                class="sym-sign-btn"
                :class="{ selected: symSigns.includes(sign) }"
                @click="toggleSign(sign)"
              >{{ sign }}</button>
            </div>
          </div>

          <div v-if="symSigns.length" class="sc-step" style="margin-top:16px">
            <AppButton variant="primary" @click="runSymptomCheck">Check Symptoms ({{ symSigns.length }} selected)</AppButton>
          </div>

          <div v-if="symResult" class="sym-result" :class="symResult.urgency">
            <div class="sr-urgency">{{ symResult.urgencyLabel }}</div>
            <div class="sr-title">{{ symResult.title }}</div>
            <div class="sr-body">{{ symResult.body }}</div>
            <div v-if="symResult.urgency === 'critical'" class="sr-cta">📞 Call your vet NOW</div>
          </div>
        </template>
      </AppCard>

      <div class="section-title" style="margin-top:16px">First Aid Reference</div>
      <div class="first-aid-grid">
        <AppCard v-for="aid in firstAidCards" :key="aid.title" :flat="true" class="aid-card">
          <div class="aid-icon">{{ aid.icon }}</div>
          <div class="aid-title">{{ aid.title }}</div>
          <div class="aid-steps">
            <div v-for="(step, i) in aid.steps" :key="i" class="aid-step">{{ i + 1 }}. {{ step }}</div>
          </div>
        </AppCard>
      </div>
    </template>

    <!-- ─── AI CHAT ─── -->
    <template v-if="activeTab === 'chat'">
      <div class="chat-layout">
        <!-- Animal selector -->
        <AppCard :flat="true" :no-pad="true">
          <div class="animal-search-wrap">
            <AppInput v-model="animalSearch" placeholder="Find animal by name..." />
            <div v-if="animalSearch && !selectedAnimal" class="animal-drop">
              <div
                v-for="a in filteredAnimals"
                :key="a.id"
                class="animal-drop-item"
                @click="selectAnimal(a)"
              >
                <span>{{ getEmoji(a.species) }}</span>
                <div>
                  <div class="adi-name">{{ a.name }}</div>
                  <div class="adi-sub">{{ a.species }}<template v-if="a.age"> · {{ a.age }}</template></div>
                </div>
              </div>
              <div v-if="!filteredAnimals.length" class="adi-empty">No animals found</div>
            </div>
          </div>

          <div v-if="selectedAnimal" class="sel-animal">
            <span class="sel-emoji">{{ getEmoji(selectedAnimal.species) }}</span>
            <div class="sel-info">
              <div class="sel-name">{{ selectedAnimal.name }}</div>
              <div class="sel-sub">{{ selectedAnimal.species }}<template v-if="selectedAnimal.age"> · {{ selectedAnimal.age }}</template></div>
            </div>
            <button class="sel-clear" @click="clearAnimal">✕</button>
          </div>
        </AppCard>

        <!-- Quick prompts -->
        <div class="quick-prompts">
          <button v-for="p in quickPrompts" :key="p.label" class="qp-btn" @click="sendQuick(p.text)">
            {{ p.emoji }} {{ p.label }}
          </button>
        </div>

        <!-- Chat messages -->
        <div class="chat-messages" ref="messagesEl">
          <div v-if="!messages.length" class="chat-empty">
            <div class="ce-icon">🩺</div>
            <div class="ce-title">Vet AI Assistant</div>
            <div class="ce-sub">{{ selectedAnimal ? `Ask about ${selectedAnimal.name}` : 'Select an animal first, then ask a health question' }}</div>
          </div>
          <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
            <div class="msg-bubble">{{ m.text }}</div>
            <div class="msg-time">{{ m.time }}</div>
          </div>
          <div v-if="aiLoading" class="msg ai">
            <div class="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-row">
          <AppInput
            v-model="chatInput"
            :placeholder="selectedAnimal ? `Ask about ${selectedAnimal.name}…` : 'Select an animal first'"
            :disabled="!selectedAnimal || aiLoading"
            @keydown.enter.prevent="sendMessage"
          />
          <AppButton variant="primary" :disabled="!selectedAnimal || !chatInput.trim() || aiLoading" @click="sendMessage">Send</AppButton>
        </div>
      </div>
    </template>

    <!-- ─── CONTACTS ─── -->
    <template v-if="activeTab === 'contacts'">
      <AppButton variant="primary" style="margin-bottom:12px" @click="showContactForm = !showContactForm">
        + Add Vet Contact
      </AppButton>

      <AppCard v-if="showContactForm" :flat="true" style="margin-bottom:12px">
        <div class="contact-form">
          <AppInput v-model="contactForm.name"     label="Name / Clinic"     placeholder="Yuma Animal Hospital" />
          <AppInput v-model="contactForm.phone"    label="Phone"             placeholder="(928) 555-0100" type="tel" />
          <AppInput v-model="contactForm.species"  label="Specializes in"    placeholder="Large animal, Small animal, All" />
          <AppInput v-model="contactForm.address"  label="Address"           placeholder="123 Main St, Yuma AZ" />
          <AppInput v-model="contactForm.notes"    label="Notes"             placeholder="Emergency line, after-hours contact…" />
          <div class="contact-form-actions">
            <AppButton variant="primary" @click="saveContact">Save Contact</AppButton>
            <AppButton @click="showContactForm = false">Cancel</AppButton>
          </div>
        </div>
      </AppCard>

      <template v-if="contacts.length">
        <AppCard v-for="c in contacts" :key="c.id" :flat="true" class="contact-card">
          <div class="cc-row">
            <div class="cc-icon">🏥</div>
            <div class="cc-info">
              <div class="cc-name">{{ c.name }}</div>
              <div v-if="c.species" class="cc-spec">{{ c.species }}</div>
              <a v-if="c.phone" :href="`tel:${c.phone}`" class="cc-phone">📞 {{ c.phone }}</a>
              <div v-if="c.address" class="cc-addr">📍 {{ c.address }}</div>
              <div v-if="c.notes" class="cc-notes">{{ c.notes }}</div>
            </div>
            <button class="cc-del" @click="removeContact(c.id)">✕</button>
          </div>
        </AppCard>
      </template>
      <EmptyState v-else icon="📞" title="No vet contacts yet" message="Add your vets and emergency contacts." />
    </template>

  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { PageContainer, AppCard, AppBadge, AppButton, AppInput, EmptyState } from '../ui'
import { useAnimalsStore } from '../../stores/animals'
import { useUIStore } from '../../stores/ui'
import { authHeaders } from '../../services/siteApi'
import VetHubEmergencyProtocols from './VetHubEmergencyProtocols.vue'
import VetHubSpeciesGuide from './VetHubSpeciesGuide.vue'

const animalsStore = useAnimalsStore()
const ui = useUIStore()

// ── Tab state ────────────────────────────────────────────────
const tabs = [
  { id: 'overview',  emoji: '🏥', label: 'Overview' },
  { id: 'species',   emoji: '🐾', label: 'Species' },
  { id: 'symptoms',  emoji: '🔍', label: 'Symptoms' },
  { id: 'chat',      emoji: '🤖', label: 'AI Chat' },
  { id: 'contacts',  emoji: '📞', label: 'Contacts' },
]
const activeTab = ref('overview')

// ── Emergency Protocols ──────────────────────────────────────
const activeProtocol = ref(null)
const openProtocol = (p) => { activeProtocol.value = p }

const emergencyProtocols = [
  {
    id: 'cpr', icon: '🫀', name: 'CPR', color: '#e53935',
    steps: [
      'Check for responsiveness — call the animal\'s name, tap gently.',
      'Check airway — clear mouth/throat of any obstructions.',
      'Check breathing — watch for chest rise for 5–10 seconds.',
      'If not breathing: give 2 rescue breaths (close mouth, breathe into nose).',
      '30 chest compressions at 1/3–1/2 chest depth, 100–120/min.',
      'Alternate 30 compressions to 2 breaths. Continue until breathing returns.',
      'Keep animal warm. Call vet immediately and continue until they arrive.',
    ],
  },
  {
    id: 'bleeding', icon: '🩹', name: 'Severe Bleed', color: '#c62828',
    steps: [
      'Apply direct firm pressure with a clean cloth or gauze pad.',
      'Hold pressure continuously for 5–10 minutes — do NOT peek.',
      'If soaked through, add more gauze on top; do not remove.',
      'Elevate the affected limb if possible.',
      'For limb: apply pressure bandage. For arterial bleed: tourniquet 2" above wound.',
      'Keep animal calm and warm. Transport to vet immediately.',
    ],
  },
  {
    id: 'choking', icon: '😮‍💨', name: 'Choking', color: '#e65100',
    steps: [
      'Look inside mouth — only remove visible obstructions. Do NOT blind-probe.',
      'Small dogs/cats: hold by hips, swing gently head-down (Heimlich-like).',
      'Large dogs: apply abdominal thrusts behind the ribcage.',
      'Horses: do NOT attempt unless trained. Keep calm, call vet.',
      'If unconscious, perform rescue breaths after clearing airway.',
      'Seek emergency vet care immediately — internal injury risk.',
    ],
  },
  {
    id: 'seizure', icon: '⚡', name: 'Seizure', color: '#6a1b9a',
    steps: [
      'DO NOT restrain the animal — move yourself and hazards away.',
      'Time the seizure. >5 minutes = status epilepticus, call vet NOW.',
      'Keep the area dark and quiet — reduce stimulation.',
      'Do not put anything in the animal\'s mouth.',
      'After seizure: keep in dark, quiet space. Do not offer food/water.',
      'Log duration, behavior, time of day — give to vet.',
      'First seizure or cluster seizures = vet visit same day.',
    ],
  },
  {
    id: 'heatstroke', icon: '🌡️', name: 'Heatstroke', color: '#f57c00',
    steps: [
      'Move to shade or cool indoor area immediately.',
      'Apply cool (NOT ice-cold) water to paws, groin, armpits, neck.',
      'Fan the animal while applying water.',
      'Offer small amounts of cool water to drink if conscious.',
      'DO NOT use ice — causes vasoconstriction, traps heat.',
      'Monitor temperature — stop cooling at 103°F to avoid overcooling.',
      'Transport to vet — heatstroke causes organ damage even after recovery.',
    ],
  },
  {
    id: 'poisoning', icon: '☠️', name: 'Poisoning', color: '#2e7d32',
    steps: [
      'Identify the substance — note name, amount, time of exposure.',
      'CALL poison control FIRST: ASPCA (888) 426-4435.',
      'Do NOT induce vomiting unless specifically instructed by a vet.',
      'If skin/eye exposure: flush with large amounts of water for 15+ minutes.',
      'Bring the packaging or substance sample to the vet.',
      'Monitor for: seizures, vomiting, drooling, collapse, pale gums.',
      'Transport to emergency vet immediately.',
    ],
  },
  {
    id: 'colic', icon: '🐴', name: 'Horse Colic', color: '#1565c0',
    steps: [
      'Remove all feed immediately — do not let horse eat.',
      'Check gut sounds in all 4 quadrants (left/right, front/back). Absence = emergency.',
      'Walk the horse gently if safe — short walks, not exhausting.',
      'Do NOT give banamine/drugs without vet guidance.',
      'Monitor vitals every 15 minutes: HR, gum color, CRT.',
      'HR >60 bpm, no gut sounds, or uncontrollable pain = surgical emergency.',
      'Call vet immediately. Have transport ready.',
    ],
  },
  {
    id: 'gi-stasis', icon: '🐰', name: 'Rabbit GI Stasis', color: '#558b2f',
    steps: [
      'No droppings for 8–12 hours = GI stasis until proven otherwise.',
      'Offer hay immediately — chewing stimulates gut motility.',
      'Syringe-feed Critical Care formula if not eating (follow package).',
      'Gentle belly massage in circular motion 2–3 minutes.',
      'Keep warm — gut slows with hypothermia.',
      'Do NOT give simethicone unless vet-directed.',
      'Rabbits deteriorate fast — call vet within hours, not days.',
    ],
  },
]

// ── Symptom Checker ──────────────────────────────────────────
const symSpecies = ref(null)
const symSigns   = ref([])
const symResult  = ref(null)

const toggleSign = (sign) => {
  const idx = symSigns.value.indexOf(sign)
  if (idx === -1) symSigns.value.push(sign)
  else symSigns.value.splice(idx, 1)
  symResult.value = null
}

const runSymptomCheck = () => {
  const critical = ['Seizures', 'Not breathing', 'Pale/white gums', 'Sudden collapse',
    'Bloated abdomen', 'Difficulty breathing', 'No gut sounds', 'Multiple sudden deaths',
    'Not eating/defecating 12h+', 'Labored breathing', 'Severe lameness', 'High fever (>104°F)']
  const hasCritical = symSigns.value.some(s => critical.some(c => s.toLowerCase().includes(c.toLowerCase().slice(0, 10))))

  if (hasCritical || symSigns.value.length >= 3) {
    symResult.value = {
      urgency: 'critical',
      urgencyLabel: '🚨 CRITICAL — ACT NOW',
      title: 'Immediate Veterinary Care Required',
      body: `${symSigns.value.join(', ')} — These signs indicate a potentially life-threatening emergency. Do not wait. Contact your emergency vet or animal hospital immediately while providing basic stabilization.`,
    }
  } else if (symSigns.value.length >= 2) {
    symResult.value = {
      urgency: 'urgent',
      urgencyLabel: '⚠️ URGENT — See Vet Today',
      title: 'Veterinary Attention Needed',
      body: `${symSigns.value.join(', ')} — Multiple symptoms present. This animal should be seen by a vet today. Monitor closely for any worsening and be prepared for an emergency visit.`,
    }
  } else {
    symResult.value = {
      urgency: 'monitor',
      urgencyLabel: '👁️ MONITOR — Watch Closely',
      title: 'Monitor and Document',
      body: `${symSigns.value.join(', ')} — Single symptom noted. Monitor closely for 2–4 hours. Document when it started and any changes. Call vet if symptoms worsen or additional signs appear.`,
    }
  }
}

const firstAidCards = [
  {
    icon: '🩹', title: 'Wound Care',
    steps: ['Flush with saline or clean water', 'Apply antiseptic (chlorhexidine)', 'Cover with clean bandage', 'Check for swelling, heat, discharge', 'Vet visit if deep, won\'t stop bleeding, or signs of infection'],
  },
  {
    icon: '💧', title: 'Dehydration Check',
    steps: ['Skin tent test: pinch skin — should snap back < 2 sec', 'Check gums: moist = good, tacky/dry = dehydrated', 'Sunken eyes = severe dehydration', 'Offer fresh water or electrolyte solution', 'IV fluids if severe — vet only'],
  },
  {
    icon: '🌡️', title: 'Taking Temperature',
    steps: ['Use a digital rectal thermometer', 'Lubricate tip with petroleum jelly', 'Insert 1–2 inches (small animals) or 3–4 inches (horses)', 'Hold for 60 seconds', 'Dog/Cat: 100–102.5°F normal. Horse: 99–101°F normal'],
  },
  {
    icon: '❤️', title: 'Checking Pulse',
    steps: ['Dogs/Cats: feel femoral artery (inner thigh)', 'Horses: facial artery (under jaw) or digital pulse (pastern)', 'Count beats for 15 sec × 4 = BPM', 'Normal dog: 60–140 bpm. Cat: 120–140 bpm', 'Weak/rapid/absent = emergency'],
  },
]

// ── Animals ──────────────────────────────────────────────────
const animals = computed(() => Array.isArray(animalsStore.animals) ? animalsStore.animals : [])

const medicalStatuses = ['medical', 'quarantine', 'intake']
const medicalAnimals  = computed(() => animals.value.filter(a => medicalStatuses.includes(a.status) || a.alert))

const statusLabel = s => ({
  medical: 'Medical Hold', quarantine: 'Quarantine', intake: 'Intake',
}[s] || s)

// ── Species data ─────────────────────────────────────────────
const SPECIES = [
  {
    id: 'dog', emoji: '🐶', name: 'Dog',
    vitals: { temp: '99–102.5°F', hr: '60–140 bpm', rr: '15–30 brpm' },
    conditions: ['Parvovirus', 'Kennel cough', 'Mange', 'Heartworm', 'Distemper', 'Leptospirosis'],
    warnings: ['Seizures', 'Difficulty breathing', 'Pale/white gums', 'Sudden collapse', 'Bloated abdomen', 'Unresponsive'],
    vaccines: ['Rabies', 'DHPP', 'Bordetella', 'Leptospirosis', 'Canine Influenza'],
    care: 'Feed 2× daily with species-appropriate food. Fresh water always available. Monthly parasite prevention. Check gums — healthy = pink & moist.',
  },
  {
    id: 'cat', emoji: '🐱', name: 'Cat',
    vitals: { temp: '100–102.5°F', hr: '120–140 bpm', rr: '20–30 brpm' },
    conditions: ['Upper respiratory infection', 'FIV / FeLV', 'Ringworm', 'Panleukopenia', 'Dental disease'],
    warnings: ['Not eating 24h+', 'Labored breathing', 'Straining to urinate', 'Third eyelid showing', 'Head pressing'],
    vaccines: ['Rabies', 'FVRCP', 'FeLV (outdoor/multi-cat)'],
    care: 'Quarantine new arrivals 2–4 weeks. Monitor litter box output daily. Provide hiding spots to reduce stress.',
  },
  {
    id: 'horse', emoji: '🐴', name: 'Horse',
    vitals: { temp: '99–101°F', hr: '28–44 bpm', rr: '8–16 brpm', gut: 'Present all 4 quadrants' },
    conditions: ['Colic', 'Laminitis', 'Rain rot', 'Thrush', 'Heaves (RAO)', 'Strangles'],
    warnings: ['No gut sounds', 'Rolling / pawing aggressively', 'Not eating', 'Labored breathing', 'Severe lameness', 'Profuse sweating'],
    vaccines: ['Rabies', 'EEE/WEE', 'West Nile', 'Tetanus', 'Influenza', 'Rhinopneumonitis', 'Strangles'],
    care: 'Hay 24/7 (1.5–2% body weight). Fresh water 8–12 gal/day. Hoof pick daily. Check for colic signs every AM & PM. Dental float annually.',
  },
  {
    id: 'goat', emoji: '🐐', name: 'Goat',
    vitals: { temp: '101–104°F', hr: '70–135 bpm', rr: '12–20 brpm' },
    conditions: ['Enterotoxemia', 'Caseous lymphadenitis (CL)', 'Pneumonia', 'Internal parasites', 'Pregnancy toxemia'],
    warnings: ['Bloat', 'Off feed', 'Grinding teeth', 'Hunched posture', 'Diarrhea (scours)', 'Sudden death'],
    vaccines: ['CD&T (enterotoxemia + tetanus)', 'Rabies (endemic areas)'],
    care: 'Check FAMACHA score monthly for parasite load. Rotate pastures. Provide loose goat minerals. Do NOT overfeed grain — causes enterotoxemia.',
  },
  {
    id: 'pig', emoji: '🐷', name: 'Pig',
    vitals: { temp: '101–103.5°F', hr: '60–100 bpm', rr: '10–20 brpm' },
    conditions: ['Erysipelas', 'PRRS', 'Mange', 'Pneumonia', 'Sunburn', 'Rectal prolapse'],
    warnings: ['High fever (>104°F)', 'Blue/purple skin', 'Sudden death', 'Severe lameness', 'Not eating 24h+'],
    vaccines: ['Erysipelas', 'Leptospirosis', 'Mycoplasma', 'Parvovirus (sows)'],
    care: 'No sweat glands — must have mud wallow or shade. Root-enriched environment. Social — keep with companions. Monitor weight weekly.',
  },
  {
    id: 'rabbit', emoji: '🐰', name: 'Rabbit',
    vitals: { temp: '101–103°F', hr: '130–325 bpm', rr: '30–60 brpm' },
    conditions: ['GI stasis', 'Pasteurellosis (snuffles)', 'Myxomatosis', 'Dental malocclusion', 'Ear mites'],
    warnings: ['Not eating/defecating 12h+', 'Head tilt', 'Seizures', 'Labored breathing', 'Grinding teeth continuously'],
    vaccines: ['RHD-2 (if available)', 'Myxomatosis (regional)'],
    care: 'Unlimited timothy hay is essential — the most important part of diet. Minimal pellets. Never lift by ears. Handle gently — stress/shock can be fatal.',
  },
  {
    id: 'bird', emoji: '🦅', name: 'Bird / Poultry',
    vitals: { temp: '101–106°F', hr: '200–400 bpm', rr: '20–40 brpm' },
    conditions: ['Newcastle disease', 'Avian influenza', "Marek's disease", 'Coccidiosis', 'Bumblefoot', 'Egg binding'],
    warnings: ['Fluffed feathers / lethargy', 'Closed eyes during day', 'Nasal discharge', 'Limping / unable to stand', 'Sudden deaths in flock'],
    vaccines: ["Marek's disease", 'Newcastle (poultry)', 'Infectious bronchitis'],
    care: 'Quarantine new birds 30 days — biosecurity critical. Provide grit and oyster shell. Clean water daily. Report suspected avian flu to state vet immediately.',
  },
  {
    id: 'donkey', emoji: '🫏', name: 'Donkey / Mule',
    vitals: { temp: '97.2–100.5°F', hr: '36–52 bpm', rr: '12–20 brpm' },
    conditions: ['Hyperlipemia', 'Laminitis', 'Lungworm', 'Skin parasites', 'Dental disease'],
    warnings: ['Off food (emergency — hyperlipemia risk)', 'Foot heat / lameness', 'Rapid breathing', 'Depression / not moving', 'Swollen legs'],
    vaccines: ['Tetanus', 'EEE/WEE', 'West Nile', 'Rabies', 'Influenza'],
    care: 'Donkeys are stoic — illness often hidden until severe. Restrict lush grass (laminitis risk). Dental float every 1–2 years. Hoof trim every 6–8 weeks.',
  },
]

const selectedSpecies = ref(SPECIES[0])

const getEmoji = (species) => {
  const map = {
    dog: '🐶', cat: '🐱', horse: '🐴', goat: '🐐', pig: '🐷',
    rabbit: '🐰', bird: '🦅', chicken: '🐔', donkey: '🫏', duck: '🦆',
  }
  return map[species?.toLowerCase()] || '🐾'
}

// ── Emergency quick-reference ────────────────────────────────
const emergencies = [
  { species: 'Dog/Cat',   emoji: '🐾', signs: ['Pale gums', 'Seizure', 'Not breathing', 'Bloated belly'] },
  { species: 'Horse',     emoji: '🐴', signs: ['No gut sounds', 'Rolling in pain', 'Severe lameness'] },
  { species: 'Goat/Pig',  emoji: '🐐', signs: ['Bloat', 'Off feed', 'Teeth grinding'] },
  { species: 'Rabbit',    emoji: '🐰', signs: ['No droppings 12h', 'Head tilt', 'Seizure'] },
  { species: 'Poultry',   emoji: '🦅', signs: ['Multiple sudden deaths', 'Nasal discharge', 'Unable to stand'] },
]

// ── AI Chat ──────────────────────────────────────────────────
const animalSearch  = ref('')
const selectedAnimal = ref(null)
const chatInput     = ref('')
const aiLoading     = ref(false)
const messages      = ref([])
const messagesEl    = ref(null)
let msgId = 0

const filteredAnimals = computed(() => {
  const list = animals.value
  if (!animalSearch.value) return []
  return list.filter(a => a.name?.toLowerCase().startsWith(animalSearch.value.toLowerCase())).slice(0, 8)
})

const selectAnimal = (a) => {
  selectedAnimal.value = a
  animalSearch.value   = a.name
  messages.value       = []
}

const clearAnimal = () => {
  selectedAnimal.value = null
  animalSearch.value   = ''
  messages.value       = []
}

const quickPrompts = [
  { emoji: '💧', label: 'Dehydration',  text: 'How do I check for dehydration and what are the signs?' },
  { emoji: '🩹', label: 'Wound care',   text: 'How should I handle and clean a minor wound?' },
  { emoji: '❤️', label: 'Check vitals', text: 'What are normal vitals and how do I measure them?' },
  { emoji: '🦠', label: 'Infection',    text: 'What are signs of infection I should watch for?' },
  { emoji: '🚨', label: 'Emergency',    text: 'What signs mean I need to call the vet immediately?' },
  { emoji: '🥗', label: 'Nutrition',    text: 'What are general nutritional guidelines for this species?' },
]

const scrollBottom = async () => {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

const sendQuick = (text) => {
  if (!selectedAnimal.value) {
    ui.showToast('Select an animal first', 'error')
    return
  }
  chatInput.value = text
  sendMessage()
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || aiLoading.value || !selectedAnimal.value) return

  const text = chatInput.value.trim()
  chatInput.value = ''

  messages.value.push({
    id: ++msgId,
    role: 'user',
    text,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  })
  await scrollBottom()

  aiLoading.value = true
  try {
    const res = await fetch('/api/vet-chat', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ animal: selectedAnimal.value, question: text, species: selectedAnimal.value.species }),
    })
    const data = await res.json()
    messages.value.push({
      id: ++msgId,
      role: 'ai',
      text: data.response || 'Sorry, I could not generate a response.',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })
  } catch {
    messages.value.push({
      id: ++msgId,
      role: 'ai',
      text: 'Connection error. Please try again.',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    })
  } finally {
    aiLoading.value = false
    await scrollBottom()
  }
}

// ── Contacts ─────────────────────────────────────────────────
const contacts = ref([])
const showContactForm = ref(false)
const contactForm = ref({ name: '', phone: '', species: '', address: '', notes: '' })

const saveContact = () => {
  if (!contactForm.value.name.trim()) return
  contacts.value.push({ id: Date.now(), ...contactForm.value })
  contactForm.value = { name: '', phone: '', species: '', address: '', notes: '' }
  showContactForm.value = false
  ui.showToast('Contact saved')
}

const removeContact = (id) => {
  contacts.value = contacts.value.filter(c => c.id !== id)
}

onMounted(() => animalsStore.fetchAnimals())
</script>

<style scoped>
/* Tab nav */
.hub-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 16px;
  scrollbar-width: none;
}
.hub-tabs::-webkit-scrollbar { display: none; }

.hub-tab {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.hub-tab:hover { border-color: var(--border-2); color: var(--ink-2); }
.hub-tab.active {
  background: var(--teal-l);
  border-color: var(--mint);
  color: var(--mint);
}

/* Section titles */
.section-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ink-3);
  margin-bottom: 8px;
}

/* Animal row card */
.animal-row-card { margin-bottom: 8px; cursor: pointer; }
.ar-row { display: flex; align-items: center; gap: 10px; }
.ar-emoji { font-size: 24px; flex-shrink: 0; }
.ar-info { flex: 1; min-width: 0; }
.ar-name { font-size: 14px; font-weight: 800; color: var(--ink); }
.ar-sub  { font-size: 11px; color: var(--ink-3); font-weight: 600; }

/* Emergency grid */
.emergency-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.emergency-item { }
.ei-head {
  font-size: 12px;
  font-weight: 800;
  color: var(--coral);
  margin-bottom: 4px;
}
.ei-list {
  margin: 0;
  padding-left: 14px;
}
.ei-list li {
  font-size: 11px;
  color: var(--ink-3);
  font-weight: 600;
  margin-bottom: 2px;
}

/* Vitals table */
.vitals-table { font-size: 11px; }
.vt-header {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 6px;
  font-weight: 800;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: .04em;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}
.vt-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border);
  color: var(--ink-2);
  font-weight: 600;
}

/* Species pills */
.species-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 14px;
  scrollbar-width: none;
}
.species-pills::-webkit-scrollbar { display: none; }
.sp-pill {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: all .15s;
}
.sp-pill.active { background: var(--teal-l); border-color: var(--mint); color: var(--mint); }

/* Species card */
.species-card { }
.sc-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.sc-emoji { font-size: 36px; }
.sc-name { font-size: 18px; font-weight: 900; color: var(--ink); }
.sc-sub  { font-size: 11px; color: var(--ink-3); font-weight: 600; }

.sc-section { margin-bottom: 14px; }
.sc-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--ink-3);
  margin-bottom: 6px;
}

.vitals-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.vm-item {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  background: var(--surface-2);
  border-radius: var(--r);
  gap: 2px;
}
.vm-item span { font-size: 10px; color: var(--ink-3); font-weight: 700; }
.vm-item strong { font-size: 12px; color: var(--ink); font-weight: 800; }

.tag-list { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}
.tag-warn { background: rgba(255,122,69,.12); color: var(--coral); }
.tag-mint { background: var(--teal-l); color: var(--mint); }

.warn-list {
  margin: 0;
  padding-left: 16px;
}
.warn-list li {
  font-size: 12px;
  color: var(--coral);
  font-weight: 700;
  margin-bottom: 4px;
}

.care-text {
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 600;
  line-height: 1.6;
  background: var(--surface-2);
  padding: 10px 12px;
  border-radius: var(--r);
}

/* AI Chat */
.chat-layout { display: flex; flex-direction: column; gap: 10px; }

.animal-search-wrap { padding: 12px; }
.animal-drop {
  margin-top: 6px;
  border: 1px solid var(--border);
  border-radius: var(--r);
  background: var(--surface);
  overflow: hidden;
}
.animal-drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background .1s;
}
.animal-drop-item:last-child { border-bottom: none; }
.animal-drop-item:hover { background: var(--surface-2); }
.adi-name { font-size: 13px; font-weight: 800; color: var(--ink); }
.adi-sub  { font-size: 11px; color: var(--ink-3); }
.adi-empty { padding: 12px; font-size: 12px; color: var(--ink-3); text-align: center; }

.sel-animal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  background: var(--teal-l);
}
.sel-emoji { font-size: 22px; }
.sel-info { flex: 1; }
.sel-name { font-size: 13px; font-weight: 800; color: var(--mint); }
.sel-sub  { font-size: 11px; color: var(--ink-3); }
.sel-clear {
  background: none; border: none;
  font-size: 14px; color: var(--ink-3); cursor: pointer; padding: 4px;
}

.quick-prompts {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.quick-prompts::-webkit-scrollbar { display: none; }
.qp-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Nunito', sans-serif;
  color: var(--ink-2);
  cursor: pointer;
  white-space: nowrap;
  transition: all .15s;
}
.qp-btn:hover { border-color: var(--mint); color: var(--mint); }

.chat-messages {
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 6px;
  color: var(--ink-3);
}
.ce-icon  { font-size: 32px; }
.ce-title { font-size: 15px; font-weight: 800; color: var(--ink-2); }
.ce-sub   { font-size: 12px; text-align: center; }

.msg { display: flex; flex-direction: column; }
.msg.user { align-items: flex-end; }
.msg.ai   { align-items: flex-start; }

.msg-bubble {
  max-width: 85%;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}
.msg.user .msg-bubble { background: var(--mint); color: #fff; border-bottom-right-radius: 4px; }
.msg.ai   .msg-bubble { background: var(--surface); border: 1px solid var(--border); color: var(--ink); border-bottom-left-radius: 4px; }

.msg-time { font-size: 10px; color: var(--ink-3); margin-top: 3px; padding: 0 4px; }

.typing { display: flex; gap: 4px; align-items: center; min-width: 44px; }
.typing span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--ink-3); animation: blink 1.2s infinite;
}
.typing span:nth-child(2) { animation-delay: .2s; }
.typing span:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0%,80%,100% { opacity:.2 } 40% { opacity:1 } }

.chat-input-row { display: flex; gap: 8px; align-items: flex-end; }
.chat-input-row .app-input { flex: 1; }

/* Contacts */
.contact-form { display: flex; flex-direction: column; gap: 10px; }
.contact-form-actions { display: flex; gap: 8px; margin-top: 4px; }

.contact-card { margin-bottom: 8px; }
.cc-row { display: flex; gap: 10px; align-items: flex-start; }
.cc-icon { font-size: 24px; flex-shrink: 0; padding-top: 2px; }
.cc-info { flex: 1; min-width: 0; }
.cc-name  { font-size: 14px; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.cc-spec  { font-size: 11px; color: var(--mint); font-weight: 700; margin-bottom: 4px; }
.cc-phone { display: block; font-size: 13px; color: var(--brand); font-weight: 700; text-decoration: none; margin-bottom: 2px; }
.cc-addr  { font-size: 11px; color: var(--ink-3); font-weight: 600; margin-bottom: 2px; }
.cc-notes { font-size: 11px; color: var(--ink-3); font-style: italic; margin-top: 4px; }
.cc-del {
  background: none; border: none;
  font-size: 14px; color: var(--ink-3); cursor: pointer; padding: 4px; flex-shrink: 0;
}

/* ── Hero ── */
.vet-hero {
  background: linear-gradient(135deg, #1b233d 0%, #0f1526 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.vet-hero-title { font-size: 22px; font-weight: 900; color: #fff; font-family: 'Fredoka One', sans-serif; }
.vet-hero-sub { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 2px; }
.vet-stat-chips { display: flex; gap: 10px; }
.vsc {
  flex: 1;
  background: rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vsc-num { font-size: 20px; font-weight: 900; color: #fff; }
.vsc-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; }
.vsc-ok     .vsc-num { color: #4ecca3; }
.vsc-alert  .vsc-num { color: #f59e0b; }
.vsc-blue   .vsc-num { color: #60a5fa; }
.vsc-purple .vsc-num { color: #c084fc; }

/* ── Emergency bar ── */
.emergency-bar { margin-bottom: 16px; }
.eb-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-3); margin-bottom: 8px; }
.eb-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ep-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all .15s;
  font-family: 'Nunito', sans-serif;
}
.ep-btn:hover { border-color: var(--accent, #e53935); transform: translateY(-2px); }
.ep-icon { font-size: 20px; }
.ep-name { font-size: 9px; font-weight: 800; color: var(--ink-2); text-align: center; }

/* ── Protocol Modal ── */
.proto-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 999;
  display: flex; align-items: flex-end; justify-content: center;
  padding: 16px;
}
.proto-modal {
  background: var(--bg-2);
  border-radius: 20px 20px 12px 12px;
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}
.proto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 900;
  color: var(--ink);
  margin-bottom: 10px;
}
.proto-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--ink-3); }
.proto-disclaimer {
  font-size: 11px;
  background: rgba(229,57,53,.1);
  color: #e53935;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  font-weight: 700;
}
.proto-steps { display: flex; flex-direction: column; gap: 10px; }
.proto-step { display: flex; gap: 12px; align-items: flex-start; }
.ps-num {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: var(--mint); border-radius: 50%;
  font-size: 11px; font-weight: 900; color: #000;
  flex-shrink: 0;
}
.ps-text { font-size: 13px; color: var(--ink-2); font-weight: 600; line-height: 1.5; padding-top: 2px; }

/* ── Symptom checker ── */
.symptom-card { }
.sc-step { }
.sc-step-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-3); margin-bottom: 10px; }
.sym-species-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.sym-signs-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.sym-sign-btn {
  padding: 8px 14px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: var(--ink-2);
  transition: all .15s;
  font-family: 'Nunito', sans-serif;
}
.sym-sign-btn:hover { border-color: var(--coral); }
.sym-sign-btn.selected { background: rgba(229,57,53,.1); border-color: var(--coral); color: var(--coral); }

.sym-result {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid;
}
.sym-result.critical { background: rgba(229,57,53,.08); border-color: #e53935; }
.sym-result.urgent   { background: rgba(245,158,11,.08); border-color: #f59e0b; }
.sym-result.monitor  { background: rgba(96,165,250,.08); border-color: #60a5fa; }
.sr-urgency { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
.critical .sr-urgency { color: #e53935; }
.urgent   .sr-urgency { color: #f59e0b; }
.monitor  .sr-urgency { color: #60a5fa; }
.sr-title { font-size: 15px; font-weight: 900; color: var(--ink); margin-bottom: 6px; }
.sr-body  { font-size: 12px; color: var(--ink-2); line-height: 1.6; }
.sr-cta   { margin-top: 12px; font-size: 13px; font-weight: 900; color: #e53935; }

/* ── First aid cards ── */
.first-aid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aid-card { }
.aid-icon  { font-size: 24px; margin-bottom: 6px; }
.aid-title { font-size: 13px; font-weight: 900; color: var(--ink); margin-bottom: 8px; }
.aid-steps { display: flex; flex-direction: column; gap: 4px; }
.aid-step  { font-size: 11px; color: var(--ink-2); font-weight: 600; line-height: 1.4; }

/* ── Vet Chat ── */
</style>
