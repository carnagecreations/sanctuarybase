import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDxOOKDrFfCGBRENNSsFTmau0v7U144vrw',
  authDomain: 'sanctuarybasev2.firebaseapp.com',
  projectId: 'sanctuarybasev2',
  storageBucket: 'sanctuarybasev2.firebasestorage.app',
  messagingSenderId: '701865805759',
  appId: '1:701865805759:web:592f9bd6445520018e830a',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const modules = [
  {
    section: 'Getting Started',
    icon: '👋',
    title: 'Welcome to the Sanctuary',
    description: 'Learn about our mission, facility overview, and volunteer code of conduct.',
    order: 1,
    content: `Welcome to Saint Francis Rescue! We're thrilled to have you join our team.

Our Mission
Saint Francis Rescue is dedicated to rescuing, rehabilitating, and rehoming animals in need. We believe every animal deserves a second chance and a loving home.

Facility Overview
Our sanctuary spans 15 acres with modern facilities including:
- Climate-controlled animal housing areas
- Veterinary clinic with surgical suite
- Quarantine zone for new arrivals
- Rehabilitation areas for recovery
- Volunteer common areas and break room

Volunteer Code of Conduct
• Treat all animals with compassion and respect
• Follow all safety protocols without exception
• Maintain confidentiality regarding animal and donor information
• Be on time and communicate if you need to miss a shift
• Dress appropriately and wear required safety gear
• Ask questions when unsure — it keeps you and the animals safe
• Report any concerns to staff immediately
• Represent the sanctuary professionally at all times

Your role as a volunteer is crucial to our mission. Thank you for making a difference!`,
    quiz: [
      {
        question: 'What is the primary mission of Saint Francis Rescue?',
        options: [
          'To breed rare animals',
          'To rescue, rehabilitate, and rehome animals in need',
          'To conduct animal research',
          'To house wild animals'
        ],
        correctIndex: 1
      },
      {
        question: 'What should you do if you\'re unsure about a procedure?',
        options: [
          'Figure it out on your own',
          'Ask another volunteer',
          'Ask a staff member immediately',
          'Skip that task'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    section: 'Getting Started',
    icon: '📅',
    title: 'Your First Shift',
    description: 'What to expect on your first day, check-in procedures, and team introductions.',
    order: 2,
    content: `Your First Shift — What to Expect

Before You Arrive
• Arrive 10-15 minutes early on your first day
• Bring a valid ID and wear closed-toe shoes
• Check the weather and dress in layers — it gets warm in the animal areas!
• Eat a light breakfast and bring water

Check-In Process
1. Report to the front desk in the main building
2. Sign the volunteer log with your name, time, and assigned area
3. Collect your volunteer badge and any required safety gear (gloves, apron)
4. Meet with your assigned staff mentor
5. Receive a quick safety briefing specific to your area

Your First Tasks
You won't be jumping into complex work right away! Your first day includes:
• Facility tour with introduction to each animal area
• Shadow a staff member or experienced volunteer
• Learn how to properly handle equipment and tools
• Practice basic tasks like cleaning and filling water stations
• Meet the animals (from a safe distance at first)

Team Introductions
You'll meet staff members, other volunteers, and of course, the animals! Everyone here is passionate about animal welfare and will help you feel welcome.

Break Time
• Lunch break is typically noon-1pm
• Break room is in the main building with a fridge and microwave
• Bring your lunch or join volunteers at nearby restaurants

End of Shift
• Return all equipment to proper storage
• Wash your hands and clean up
• Sign out on the volunteer log
• Debrief briefly with staff about your experience
• Discuss your next scheduled shift

Don't be nervous! Everyone was new once, and we're here to support you every step of the way.`,
    quiz: [
      {
        question: 'When should you arrive on your first shift?',
        options: [
          'Right at the start time',
          '10-15 minutes early',
          '30 minutes early',
          'Anytime within the first hour'
        ],
        correctIndex: 1
      },
      {
        question: 'What happens during check-in?',
        options: [
          'You go straight to your assigned area',
          'You sign the volunteer log, get your badge, and meet your mentor',
          'You attend a 2-hour orientation',
          'You take a written exam'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    section: 'Getting Started',
    icon: '🚨',
    title: 'Safety Rules',
    description: 'Essential safety protocols, emergency procedures, and proper equipment use.',
    order: 3,
    content: `Safety Rules — Your Protection and the Animals' Protection

Safety is Our Top Priority
Every rule exists because we've learned what keeps people and animals safe. No shortcut is worth risking injury or an animal's wellbeing.

Personal Protective Equipment (PPE)
• Wear gloves when handling animals or anything they've touched
• Aprons protect your clothing and give you pockets for small items
• Safety glasses when cleaning with chemicals or handling dust
• Steel-toed boots when working in heavy-machinery areas
• Wash hands thoroughly with soap for 20 seconds after every animal interaction

Working with Animals
• Never enter an enclosure alone — always have a staff member or trained buddy with you
• Approach animals calmly and slowly — sudden movements startle them and cause injuries
• Know each animal's temperament before you approach (staff will brief you)
• Never corner an animal or block its escape route
• If an animal acts aggressively, back away slowly and alert staff immediately
• Secure all gates and doors after entering or leaving an enclosure
• Never feed animals without explicit permission and instructions

Lifting and Physical Work
• Bend at your knees, not your back, when lifting
• Ask for help with anything over 50 pounds
• Use equipment (dollies, hand trucks) whenever available
• Take breaks — dehydration and exhaustion increase accident risk
• Report any pain or strain immediately to staff

Chemical Safety
• Read all labels before handling cleaning supplies
• Never mix chemicals (especially bleach with anything else)
• Wear gloves and eye protection
• Ensure good ventilation
• Report spills to staff immediately
• Dispose of chemicals only in designated containers

Emergency Procedures
• Know where the first aid kit, AED, and emergency phone are located
• Report all injuries, no matter how minor, to staff immediately
• In case of animal escape, activate the alarm and move to a safe area
• Fire alarm means immediate evacuation — help any animals in immediate danger only if safe
• In case of volunteer injury, get staff help immediately — do NOT minimize the situation

If You're Unsure: ASK
There is no penalty for asking a "basic" question. There IS a penalty for guessing and getting it wrong.`,
    quiz: [
      {
        question: 'What should you never do when entering an animal enclosure?',
        options: [
          'Wear gloves',
          'Enter alone without a staff member',
          'Move calmly',
          'Secure gates behind you'
        ],
        correctIndex: 1
      },
      {
        question: 'What is the correct lifting technique?',
        options: [
          'Bend at your back for leverage',
          'Bend at your knees, not your back',
          'Twist your spine while lifting',
          'Lift quickly to minimize strain'
        ],
        correctIndex: 1
      },
      {
        question: 'What should you do if you\'re unsure about a safety procedure?',
        options: [
          'Figure it out as you go',
          'Ask another volunteer',
          'Ask staff immediately',
          'Skip that task'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    section: 'Care Tasks',
    icon: '🍖',
    title: 'Feeding',
    description: 'Portion sizes, dietary restrictions, feeding schedules, and proper handling of food supplies.',
    order: 1,
    content: `Feeding: Proper Nutrition for Our Animals

Feeding Schedule
• Most animals eat at specific times — check the daily schedule posted in each area
• Morning feeding: 8:00 AM
• Evening feeding: 5:00 PM
• Some animals (medical cases) may have additional meals — staff will brief you
• Consistency is key — animals thrive on routine

Understanding Portions
• Each animal has a specific portion size based on weight, age, and health
• Portions are clearly labeled on feeding containers
• More food is NOT better — overfeeding causes obesity and health problems
• Underfeeding is also dangerous — animals need adequate nutrition for energy and health
• Staff will verify your portions on your first feeding shifts

Dietary Restrictions
• Some animals have allergies or medical conditions requiring special diets
• Review the dietary restrictions board before preparing meals
• Never substitute food without asking staff
• If an animal refuses food, report it immediately — this can indicate illness
• Keep treats separate from regular food

Food Storage and Safety
• Store all food in sealed, labeled containers
• Keep dry food in cool, dry storage away from pests
• Check expiration dates — expired food can sicken animals
• Dispose of uneaten food properly to prevent spoilage
• Wash food bowls daily with hot soapy water
• Never touch food without washing your hands first

Feeding Techniques
• Approach animals calmly with their food
• Place food in appropriate bowls or feeders (not directly on the ground)
• Observe the animal eating to ensure they're healthy
• Remove uneaten food after 15-20 minutes (timing varies by animal type)
• Never hand-feed unless specifically instructed
• Don't disturb animals while they're eating — they can become aggressive

Special Cases
• Nursing mothers need extra calories and water
• Sick or recovering animals may need softer or blended food
• Elderly animals may have dental issues requiring softer meals
• Always ask staff about special feeding needs

Reporting Issues
• Animal refuses food → report immediately
• Food appears contaminated → do not use it
• Animal has digestive upset after eating → notify staff
• Animal acts aggressive at feeding time → alert staff before next feeding`,
    quiz: [
      {
        question: 'If an animal refuses their food, what should you do?',
        options: [
          'Leave it and try again later',
          'Force them to eat',
          'Report it immediately to staff',
          'Give them a different food'
        ],
        correctIndex: 2
      },
      {
        question: 'How long should you leave food out for an animal?',
        options: [
          'Until they finish, even if it takes hours',
          'All day for snacking',
          '15-20 minutes (timing varies by species)',
          'Exactly 1 hour always'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    section: 'Care Tasks',
    icon: '⚕️',
    title: 'Medical Care',
    description: 'Identifying signs of illness, medication administration, wound care, and reporting procedures.',
    order: 2,
    content: `Medical Care: Recognizing and Responding to Health Issues

Signs of Illness
Watch for these warning signs and report immediately:
• Loss of appetite or unusual eating habits
• Lethargy or excessive sleeping
• Vomiting or diarrhea
• Discharge from eyes, nose, or other areas
• Difficulty breathing or excessive panting
• Limping, lameness, or inability to bear weight
• Swelling or lumps
• Behavioral changes (aggression, depression, anxiety)
• Excessive scratching or hair loss
• Difficulty urinating or defecating

Basic Health Checks (What You Can Observe)
• Monitor water intake — animals should drink regularly
• Observe stool consistency — changes can indicate illness
• Check for parasites or external injuries during handling
• Note skin condition — should be clean without excessive oiliness or dryness
• Observe movement — animals should move freely without visible pain
• Listen for unusual breathing sounds

Medication Administration
• ONLY staff administers medications
• Your role is to observe and report the animal's response
• Never handle medications unless specifically trained
• If medication is due but staff is unavailable, notify a supervisor
• Document medication times and animal response on charts

Wound Care
• Never attempt to treat wounds yourself — call staff
• Do NOT apply home remedies
• Keep wound areas clean by gently removing debris if trained to do so
• Report any sign of infection: increased redness, swelling, discharge, or odor
• Observe for animals licking or interfering with wounds

Quarantine Protocols
• Newly arrived animals are in quarantine for health screening
• Follow strict hygiene when working with quarantined animals
• Wear designated gloves and wash hands thoroughly after
• Use separate equipment for quarantine areas
• Report any signs of illness in quarantined animals immediately

Reporting Medical Issues
Always use the incident report system:
1. Note the animal's name, area, and date/time
2. Describe what you observed in detail
3. Note any changes from previous observations
4. Include what the animal was doing (eating, active, resting, etc.)
5. Report to the nearest staff member immediately

Emergency Medical Situations
• Severe injury, inability to move, difficulty breathing = CALL STAFF IMMEDIATELY
• Do not attempt to move the animal unless it's in immediate danger
• Clear the area to give staff space
• Have the incident report ready with details

Prevention is Key
• Clean enclosures reduce disease transmission
• Proper feeding supports immune function
• Stress reduction helps animals stay healthy
• Your observant eye is the first line of defense`,
    quiz: [
      {
        question: 'What is a sign that an animal may be ill?',
        options: [
          'The animal is eating normally',
          'Loss of appetite or unusual eating habits',
          'The animal is active and playful',
          'The animal is sleeping soundly'
        ],
        correctIndex: 1
      },
      {
        question: 'What should you do if you notice a wound on an animal?',
        options: [
          'Apply a home remedy',
          'Call staff immediately',
          'Leave it to heal on its own',
          'Clean it with regular soap and water'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    section: 'Care Tasks',
    icon: '🧹',
    title: 'Cleaning',
    description: 'Enclosure maintenance, disinfection protocols, sanitation standards, and waste management.',
    order: 3,
    content: `Cleaning: Maintaining a Healthy Environment

Daily Cleaning Basics
• Remove visible waste and soiled bedding daily
• Refresh water in all containers — change completely, don't top off
• Wipe down food bowls and feeding areas
• Remove any spoiled food or bedding
• Spot-clean high-traffic areas

Weekly Deep Cleaning
• Change all bedding material completely
• Scrub all surfaces with appropriate disinfectant
• Clean under furniture and in corners
• Inspect for damage that needs repair
• Polish surfaces if applicable to the area

Disinfection Protocols
• Use only approved disinfectants — ask staff if unsure
• NEVER mix cleaning chemicals
• Follow dilution ratios on the label exactly
• Allow proper contact time (usually 10-15 minutes) before rinsing
• Ensure adequate ventilation
• Wear appropriate PPE (gloves, eye protection)
• Rinse thoroughly with clean water after disinfection

Enclosure-Specific Considerations
Different animals need different cleaning approaches:
• Small animal areas: Daily substrate change, weekly enclosure scrub
• Aviary/bird areas: Daily perch wiping, weekly floor cleaning, regular disinfection
• Reptile enclosures: Heat lamp cleaning, substrate inspection, humidity control
• Large animal areas: Daily mucking, weekly stall/pen scrub
• Aquatic areas: Filter maintenance, partial water changes, algae control

Waste Management
• Use designated waste containers for each area type
• Dispose of animal waste in approved compost or waste systems
• Use separate containers for potentially infectious waste
• Never mix animal waste with regular trash
• Wash containers regularly to prevent odor and pests
• Report any unusual waste (blood, parasites, abnormal color/consistency) to staff

Maintaining Hygiene Between Tasks
• Wash hands thoroughly between different animal areas
• Change gloves when moving between enclosures
• Use separate cleaning tools for different areas
• Don't carry items from one area to another without cleaning
• Keep your cleaning supplies organized and clean

Environmental Considerations
• Proper humidity and temperature in each enclosure
• Adequate lighting (natural or supplemental as needed)
• Good air circulation without drafts
• Minimize noise and disturbances during cleaning
• Create a stress-free environment for animals

Signs That Extra Cleaning is Needed
• Visible mold or mildew
• Odor (beyond normal animal smell)
• Pest evidence (insects, rodents)
• Excessive algae or water discoloration
• Damage to surfaces or structures
• Animal behavioral changes related to environment

Quality Over Speed
• Take time to do cleaning properly
• An animal's health depends on cleanliness
• Rushing increases the chance of missing problems
• Staff would rather you clean thoroughly and take longer than rush and miss something`,
    quiz: [
      {
        question: 'How often should you completely change all bedding material?',
        options: [
          'Daily for all animals',
          'Weekly during deep cleaning',
          'Monthly is sufficient',
          'Only when it looks dirty'
        ],
        correctIndex: 1
      },
      {
        question: 'What should you do with old cleaning solutions?',
        options: [
          'Reuse them throughout the day',
          'Pour them down the drain',
          'Mix them with fresh solution',
          'Use new solution for each task'
        ],
        correctIndex: 3
      }
    ]
  },
  {
    section: 'Care Tasks',
    icon: '🆘',
    title: 'Emergency Procedures',
    description: 'Response protocols, evacuation procedures, first aid basics, and incident reporting.',
    order: 4,
    content: `Emergency Procedures: Staying Safe and Helping Others

Types of Emergencies
1. Animal injury or illness
2. Volunteer or staff injury
3. Fire or environmental hazard
4. Animal escape
5. Equipment failure or hazard
6. Severe weather

Animal Injury or Illness
Immediate Response:
• Stay calm — your demeanor affects the animal
• Move the animal to a safe area if possible without risk to yourself
• Do NOT attempt treatment — call staff immediately
• Keep other animals away from the injured animal
• Note the exact time and circumstances
• Prepare to give staff detailed information about what happened
• Do not move the animal unless absolutely necessary

Volunteer or Staff Injury
Immediate Response:
• Call for staff immediately if serious
• Do not move the injured person unless in immediate danger
• Keep area clear of other people and animals
• If trained in first aid, provide basic assistance:
  - Control bleeding with clean cloth
  - Check for consciousness and breathing
  - Keep person calm and warm
• Stay with the person until staff arrives
• Prepare incident report with details

Fire or Environmental Hazard
Immediate Response:
• Alert all nearby staff and volunteers
• Activate fire alarm if fire is present
• Evacuate calmly and quickly
• Move to designated assembly area (ask staff where this is on your first day)
• Do NOT attempt to fight a fire unless trained and fire is small and contained
• Do NOT re-enter building until staff gives all clear
• Account for all people in your area at assembly point
• Report to incident commander when evacuated

Animal Escape
Immediate Response:
• Alert staff immediately — DO NOT attempt to chase the animal
• Activate the escape alert if your facility has one
• Move to a safe area away from the animal
• Help staff by:
  - Not blocking escape routes
  - Keeping other animals contained
  - Being ready to assist with recapture if trained
• Stay calm — panicked humans cause panicked animals

Equipment Failure or Hazard
Immediate Response:
• Stop using the equipment immediately
• Alert others not to use it
• Notify staff of the hazard
• Mark the equipment as "Out of Service"
• Do not attempt repairs unless trained
• Report the hazard in writing on the incident board

Severe Weather
Immediate Response:
• Follow facility weather alert procedures
• Secure all outdoor animals to sheltered areas
• Close windows and doors
• Move to designated shelter area if tornado/severe storm
• Do not leave enclosures unattended
• Check animals for stress or injury after weather passes

First Aid Basics (You Should Know)
If trained or in immediate crisis:
• CPR: 30 chest compressions, 2 rescue breaths, repeat
• Choking: Back blows and abdominal thrusts (alternate)
• Severe bleeding: Apply direct pressure with clean cloth
• Shock: Keep person warm, elevate legs, monitor breathing
• Burns: Cool with water, do not apply ice directly
• Fractures: Immobilize the area, do not move

Incident Reporting
After any emergency, you MUST complete an incident report:
1. Date and exact time of incident
2. Location in facility
3. Who was involved (people and animals)
4. Detailed description of what happened
5. Any injuries sustained
6. Actions taken
7. Staff members notified
8. Your name and signature
9. Witness names if applicable

Never minimize an incident on the report — even minor injuries should be documented.

Recovery and Follow-Up
• Check on injured animals/people regularly
• Document ongoing observations
• Report changes in condition to staff
• Participate in any post-incident debriefs
• Use incidents as learning opportunities

Your Role in Emergency Prevention
• Know exit routes and emergency procedures
• Keep emergency contact numbers readily available
• Report hazards before they cause emergencies
• Maintain focus and attention while working
• Ask questions about procedures you don't understand
• Practice staying calm in stressful situations

Remember: The seconds you save by calling staff immediately could save a life.`,
    quiz: [
      {
        question: 'What should you do immediately if you discover an animal has escaped?',
        options: [
          'Chase after the animal to recapture it',
          'Alert staff immediately and do not attempt to chase',
          'Lock all gates and contain the situation yourself',
          'Document the escape for later report'
        ],
        correctIndex: 1
      },
      {
        question: 'If a volunteer near you is injured, what is your first action?',
        options: [
          'Help them move to the break room',
          'Ask them to describe their injuries',
          'Call for staff immediately',
          'Apply a bandage'
        ],
        correctIndex: 2
      },
      {
        question: 'What is the most important thing to do after any emergency?',
        options: [
          'Return to normal operations immediately',
          'Tell other volunteers what happened',
          'Complete a detailed incident report',
          'Wait for staff to file a report'
        ],
        correctIndex: 2
      }
    ]
  }
];

async function seedContent() {
  try {
    console.log('Seeding training module content...');
    let updated = 0;

    for (const module of modules) {
      const q = query(
        collection(db, 'trainingModules'),
        where('title', '==', module.title),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await updateDoc(doc.ref, {
          content: module.content,
          quiz: module.quiz,
        });
        console.log(`✓ Updated: ${module.title}`);
        updated++;
      } else {
        console.log(`✗ Module not found: ${module.title}`);
      }
    }

    console.log(`\nCompleted! Updated ${updated}/${modules.length} modules.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding content:', error);
    process.exit(1);
  }
}

seedContent();
