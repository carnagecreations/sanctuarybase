import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVetHubStore = defineStore('vetHub', () => {
  const species = ref({
    dog: {
      name: 'Dog',
      emoji: '🐶',
      vitals: {
        temp: '100–102.5°F',
        hr: '60–140 bpm',
        resp: '10–30 breaths/min'
      },
      emergencies: [
        { sign: 'Difficulty breathing', action: 'Clear airway, provide oxygen if available, call vet immediately' },
        { sign: 'Seizures', action: 'Clear area, do not restrain, time the seizure, cool if overheated, seek vet care' },
        { sign: 'Distended abdomen with retching (bloat)', action: 'EMERGENCY: Possible gastric dilation-volvulus (GDV), requires immediate surgery' },
        { sign: 'Severe bleeding', action: 'Apply direct pressure 5-10+ minutes, elevate limb, bandage' },
        { sign: 'Unconsciousness/Collapse', action: 'Check ABCs (Airway, Breathing, Circulation), CPR if trained, call vet' }
      ],
      commonIssues: [
        'Dental disease',
        'Obesity',
        'Parasites (fleas, ticks, worms)',
        'Skin allergies',
        'Urinary issues'
      ],
      nutrition: 'High-quality, species-appropriate food. Monitor weight and adjust portions.',
      vaccines: 'Core: Rabies, Distemper. Follow sanctuary vet protocol.'
    },
    cat: {
      name: 'Cat',
      emoji: '🐱',
      vitals: {
        temp: '100–103°F',
        hr: '140–220 bpm',
        resp: '20–30 breaths/min'
      },
      emergencies: [
        { sign: 'Inability to urinate (blocked cat)', action: 'EMERGENCY: Signs include straining, distress, lethargy. Requires immediate vet care.' },
        { sign: 'Difficulty breathing', action: 'Clear airway, call vet immediately' },
        { sign: 'Seizures', action: 'Clear area, do not restrain, time seizure, cool if needed' },
        { sign: 'Vomiting/diarrhea with lethargy', action: 'Possible dehydration or toxin. Keep warm, offer water, call vet' },
        { sign: 'Trauma (hit by car, fall)', action: 'Minimize movement, stabilize fractures, control bleeding, transport carefully' }
      ],
      commonIssues: [
        'Urinary tract infections',
        'Dental disease',
        'Obesity',
        'Hyperthyroidism (senior cats)',
        'Kidney disease'
      ],
      nutrition: 'High-quality protein diet. Ensure adequate water intake.',
      vaccines: 'Core: Rabies, FVRCP. Follow sanctuary vet protocol.'
    },
    horse: {
      name: 'Horse',
      emoji: '🐴',
      vitals: {
        temp: '99–101°F',
        hr: '28–44 bpm',
        resp: '8–16 breaths/min',
        gutSounds: 'Present (listen for rumbling, clicking sounds)'
      },
      emergencies: [
        { sign: 'Colic (pain, rolling, pawing, no gut sounds)', action: 'EMERGENCY: Withhold feed, walk gently if safe, monitor vitals, call vet immediately. May require surgery.' },
        { sign: 'Severe lameness/fracture', action: 'Confine to stall, support limb, cold therapy if appropriate, call vet' },
        { sign: 'Respiratory distress (choking)', action: 'Keep calm, provide fresh air, do not force food, call vet' },
        { sign: 'Severe bleeding', action: 'Apply direct pressure, use tourniquet if necessary for limb bleeding, call vet' },
        { sign: 'Heat exhaustion', action: 'Move to shade, cool with water (not ice), offer electrolytes' }
      ],
      commonIssues: [
        'Colic',
        'Laminitis',
        'Parasites',
        'Respiratory (heaves, COPD)',
        'Hoof issues (thrush, abscesses)'
      ],
      nutrition: 'Forage-based (hay/pasture). Grain as needed. Monitor dental wear.',
      hoofCare: 'Regular farrier visits every 6-8 weeks.',
      vaccines: 'Tetanus, Rhinovirus, Influenza, West Nile. Follow vet protocol.'
    },
    goat: {
      name: 'Goat',
      emoji: '🐐',
      vitals: {
        temp: '101.5–103.5°F',
        hr: '70–135 bpm',
        resp: '15–30 breaths/min'
      },
      emergencies: [
        { sign: 'Bloat (distended left side, discomfort)', action: 'Position goat to relieve gas (head uphill), call vet. Vet may pass stomach tube.' },
        { sign: 'Off feed with teeth grinding', action: 'Pain indicator. Check for parasites, injury, GI stasis. Call vet.' },
        { sign: 'Respiratory distress (nasal discharge, coughing)', action: 'Isolate from herd, provide supportive care, call vet' },
        { sign: 'Severe lameness', action: 'Confine, check hooves for foot rot or injury, call vet' },
        { sign: 'Kidding emergency (red bag, prolonged labor)', action: 'EMERGENCY: Call vet immediately. Do not intervene unless trained.' }
      ],
      commonIssues: [
        'Parasites (internal and external)',
        'Bloat',
        'Foot rot',
        'CAE (Caprine Arthritis Encephalitis)',
        'CL (Caseous Lymphadenitis)'
      ],
      nutrition: 'Balanced diet, avoid sudden feed changes. Provide minerals (calcium, copper).',
      hoofCare: 'Trim every 6-8 weeks, treat foot rot promptly.',
      vaccines: 'CDT (Clostridium C&D, Tetanus). Follow sanctuary vet protocol.'
    },
    pig: {
      name: 'Pig',
      emoji: '🐷',
      vitals: {
        temp: '101–103°F',
        hr: '60–100 bpm',
        resp: '10–20 breaths/min'
      },
      emergencies: [
        { sign: 'Heat stress (panting, weakness, collapse)', action: 'Pigs don't sweat well. Cool immediately with water/mud, provide shade and fans, call vet' },
        { sign: 'Severe respiratory distress', action: 'Isolate, provide fresh air, check for swine respiratory disease, call vet' },
        { sign: 'Lameness/inability to stand', action: 'Confine to clean area, check for injuries, monitor weight distribution, call vet' },
        { sign: 'GI distress (diarrhea, vomiting)', action: 'Isolate if contagious signs, keep hydrated, call vet' }
      ],
      commonIssues: [
        'Respiratory disease',
        'Skin issues (mange, abrasions)',
        'GI problems',
        'Parasites',
        'Hoof/leg issues'
      ],
      nutrition: 'Balanced pig feed, fresh water always available. Monitor for obesity.',
      vaccines: 'Follow sanctuary/vet protocol. Consult vet for herd health.'
    },
    rabbit: {
      name: 'Rabbit',
      emoji: '🐰',
      vitals: {
        temp: '101–104°F',
        hr: '180–250 bpm',
        resp: '30–60 breaths/min'
      },
      emergencies: [
        { sign: 'No droppings for 8-12+ hours (GI stasis)', action: 'CRITICAL: Syringe feed Critical Care formula, provide fluids (vet), pain meds. Requires vet motility drugs.' },
        { sign: 'Head tilt', action: 'Possible infection (E. cuniculi) or parasite. Supportive care, vet diagnosis and treatment.' },
        { sign: 'Difficulty breathing', action: 'Possible respiratory infection (snuffles). Isolate, provide oxygen if available, call vet' },
        { sign: 'Overheating', action: 'Cool ears and body gently, provide cool water and shade, monitor closely' },
        { sign: 'Severe dental malocclusion (drooling)', action: 'Pain and inability to eat. Call vet for possible teeth trimming/extraction.' }
      ],
      commonIssues: [
        'GI stasis',
        'Dental malocclusion',
        'Respiratory disease (snuffles)',
        'Parasites',
        'Ear mites',
        'Overgrown nails'
      ],
      nutrition: 'Unlimited hay (timothy or similar). Limited pellets (1/4 cup per 5 lbs). Fresh greens daily. No iceberg lettuce.',
      handling: 'Always support hindquarters to prevent spinal injury.',
      housing: 'Quiet, cool (60-70°F), well-ventilated. Litter box area.'
    },
    poultry: {
      name: 'Poultry (Chicken/Duck)',
      emoji: '🐔',
      vitals: {
        temp: 'Varies by species (typically 102-104°F)',
        note: 'Monitor flock behavior for signs of distress'
      },
      emergencies: [
        { sign: 'Multiple sudden deaths in flock', action: 'BIOSECURITY ALERT: Isolate remaining birds, check for respiratory signs, disease outbreak. Call vet.' },
        { sign: 'Severe respiratory distress (gasping)', action: 'Improve ventilation, isolate from flock, supportive care, call vet' },
        { sign: 'Prolapse (tissue protruding from vent)', action: 'Clean gently, apply soothing ointment, isolate in quiet dark space, call vet' },
        { sign: 'Egg bound hen (straining, lethargy)', action: 'Warm bath, gentle lubrication, calcium (vet directed), call vet if no improvement' },
        { sign: 'Heat stress (panting, wings spread, lethargy)', action: 'Provide shade, cool water to drink, electrolytes, increase ventilation' }
      ],
      commonIssues: [
        'Respiratory disease (CRD)',
        'Parasites (lice, worms)',
        'Egg binding',
        'Marek\'s disease',
        'Cannibalism',
        'Coccidiosis'
      ],
      nutrition: 'Layer feed for layers, grower feed for young birds. Grit for digestion. Calcium supplement.',
      housing: 'Clean coop (minimize ammonia), predator protection, quarantine new birds 30 days.',
      vaccines: 'Consult vet. Marek\'s vaccine may be used at hatch.'
    }
  })

  const drabcProtocol = {
    title: 'D.R.A.B.C. Protocol',
    steps: [
      {
        letter: 'D',
        word: 'Danger',
        action: 'Ensure scene safety. Protect yourself and others from the animal. Use muzzles, towels, or get help as needed.'
      },
      {
        letter: 'R',
        word: 'Response',
        action: 'Assess if animal is responsive. Call its name, check for reaction.'
      },
      {
        letter: 'A',
        word: 'Airway',
        action: 'Clear mouth/throat of obstructions (vomit, foreign objects). Be cautious of bites.'
      },
      {
        letter: 'B',
        word: 'Breathing',
        action: 'Check chest rise. Listen for breath sounds. If absent, provide rescue breaths (if trained).'
      },
      {
        letter: 'C',
        word: 'Circulation',
        action: 'Check pulse (femoral, carotid, or heart). Assess gum color (pink is normal; pale/blue = emergency). Check capillary refill (<2 seconds normal).'
      }
    ]
  }

  const firstAidKit = {
    core: [
      'Gauze pads, rolls, nonstick bandages',
      'Adhesive tape, cohesive wrap',
      'Antiseptic wipes/solution (chlorhexidine or dilute iodine)',
      'Antibiotic ointment',
      'Saline solution, eyewash',
      'Blunt scissors, tweezers, gloves, flashlight',
      'Thermometer (digital)',
      'Muzzle, leash, collar',
      'Towels/blankets, ice packs',
      'Syringes (for feeding/meds)',
      'Activated charcoal (toxin treatment – vet directed)',
      'Hydrogen peroxide (for inducing vomiting in dogs – vet directed ONLY)',
      'Styptic powder (for nail bleeds)'
    ],
    largeAnimal: [
      'Hoof tools, leg wraps',
      'Nasogastric tube (horses)',
      'Leg splints, sling materials'
    ],
    smallAnimal: [
      'Critical Care formula (rabbits/small mammals)',
      'Electrolyte solution',
      'Hand-feeding supplies'
    ],
    documents: [
      'Vet contacts (local vet, emergency clinic, poison control)',
      'Animal medical records',
      'Consent forms',
      'This manual'
    ]
  }

  /** Returns veterinary reference data including species information and first aid kit. @returns {Object} */
  return {
    species,
    drabcProtocol,
    firstAidKit
  }
})
