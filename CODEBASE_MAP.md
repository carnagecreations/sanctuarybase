# SanctuaryBase v2 - Codebase Map

A detailed directory tree and explanation of every folder and key file in the project.

---

## Table of Contents

1. [Project Root](#project-root)
2. [Source Code (`/src/`)](#source-code-src)
3. [Components (`/src/components/`)](#components-srccomponents)
4. [Stores (`/src/stores/`)](#stores-srcstores)
5. [Services & Utils (`/src/services/` & `/src/utils/`)](#services--utils)
6. [Public Files (`/public/`)](#public-files-public)
7. [Functions (`/functions/`)](#functions-functions)
8. [Build & Config](#build--config)

---

## Project Root

```
SB- v2/
├── .claude/                    # Claude Code settings
├── .git/                       # Git repository
├── .vscode/                    # VS Code settings
├── .wrangler/                  # Cloudflare Wrangler cache
├── dist/                       # Built output (run: npm run build)
├── node_modules/               # Dependencies (run: npm install)
├── data/                       # Development data files
├── docs/                       # Documentation (markdown files)
├── functions/                  # Cloudflare Worker functions
├── public/                     # Static files
├── scripts/                    # Seed and setup scripts
├── src/                        # Source code
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
├── package-lock.json           # Dependency lock file
├── vite.config.js              # Vite build config
├── DEVELOPER_GUIDE.md          # Quick start for devs
├── ARCHITECTURE.md             # System design
├── CODE_PATTERNS.md            # Code examples
├── CODEBASE_MAP.md             # This file
├── NEW_FEATURE_CHECKLIST.md    # Feature addition steps
├── README.md                   # Project overview
└── DESIGN_SYSTEM.md            # UI design system
```

---

## Source Code (`/src/`)

### Directory Structure

```
src/
├── App.vue                     # Root component (tab routing)
├── main.js                     # Application entry point
├── style.css                   # Global styles & design tokens
├── assets/                     # Images, icons, fonts
├── components/                 # Vue components (organized by feature)
├── services/                   # Backend services (Firebase)
├── stores/                     # Pinia state management
├── utils/                      # Helper functions
└── scripts/                    # Node.js seed scripts
```

### Key Root Files

#### `src/App.vue` (231 lines)
**Purpose:** Root component that routes between pages based on `ui.currentTab`

**Responsibilities:**
- Import all feature pages
- Render correct page based on current tab
- Show login/signup screens
- Render layout (Header, BottomNav, Toast, ConfirmDialog)
- Handle auth initialization
- Handle postMessage events for navigation

**Key Properties:**
```javascript
// Tab-based routing
ui.currentTab === 'dashboard'     → Show Dashboard
ui.currentTab === 'animals'       → Show Animals
ui.currentTab === 'admin-hub'     → Show AdminHub
// ...50+ tabs total
```

**When to Edit:**
- Adding a new page: add `<ComponentName v-else-if="ui.currentTab === 'tab-id'" />`
- Adding new import: `import ComponentName from './components/features/Component.vue'`

#### `src/main.js` (8 lines)
**Purpose:** Initialize Vue app and Pinia store

**Code:**
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

**When to Edit:**
- Never (unless adding global plugins)

#### `src/style.css` (1000+ lines)
**Purpose:** Global styles and design system tokens

**Contains:**
- CSS custom properties (--color-primary, --spacing-*, etc.)
- Theme variables (light/dark mode)
- Global component styles
- Animations and transitions
- Typography system
- Layout utilities

**Key Sections:**
```css
/* Design tokens */
--color-primary: #2563eb;
--color-success: #10b981;
--color-border: #e5e7eb;
--space-4: 1rem;
--radius-md: 0.375rem;

/* Light/Dark mode */
:root[data-theme="dark"] { --color-bg: #000; }
:root[data-theme="light"] { --color-bg: #fff; }

/* Component styles */
.btn-primary { /* button styles */ }
.input { /* input styles */ }
```

**When to Edit:**
- Changing colors/spacing globally
- Adding new design tokens
- Fixing layout issues that affect all pages

---

## Components (`/src/components/`)

### Directory Overview

```
components/
├── features/                    # Page-level components
│   ├── Animals.vue             # Browse/manage animals
│   ├── AnimalDetail.vue        # Single animal detail page
│   ├── Dashboard.vue           # Main dashboard
│   ├── Shifts.vue              # Volunteer shift scheduling
│   ├── People.vue              # Staff directory
│   ├── VetHub.vue              # Veterinary operations
│   ├── AdminHub.vue            # Admin menu (hub)
│   ├── Inbox.vue               # Messages/inbox
│   ├── FosterPortal.vue        # Foster management
│   ├── VolunteerProfile.vue    # User profile
│   ├── SuppliesPage.vue        # Supplies management
│   │
│   ├── animal-detail/          # Tabs for AnimalDetail
│   │   ├── ProfileTab.vue      # Basic info
│   │   ├── HealthTab.vue       # Health status
│   │   ├── MedsTab.vue         # Medications
│   │   ├── WeightTab.vue       # Weight history
│   │   ├── VaccinesTab.vue     # Vaccination records
│   │   ├── MedsTab.vue         # Medicine schedule
│   │   ├── DietAndHealthTab.vue # Diet & health
│   │   ├── TraitsTab.vue       # Behavioral traits
│   │   ├── MemoryTab.vue       # Notes/memories
│   │   ├── AssessTab.vue       # Assessments
│   │   ├── RecordsTab.vue      # Medical records
│   │   ├── DocsTab.vue         # Documents
│   │   ├── SOSTab.vue          # Emergency info
│   │   ├── LogTab.vue          # Activity log
│   │   ├── MetTab.vue          # Metabolic data
│   │   └── VetTab.vue          # Vet notes
│   │
│   ├── admin/                  # Admin-only pages (30+ pages)
│   │   ├── AnnouncementsPage.vue
│   │   ├── TasksPage.vue
│   │   ├── FinanceStatsPage.vue
│   │   ├── BiteReportsPage.vue
│   │   ├── AnimalPipelinePage.vue
│   │   ├── ApplicationsPage.vue
│   │   ├── AdoptionsPage.vue
│   │   ├── LedgerPage.vue
│   │   ├── DonorsPage.vue
│   │   ├── GrantsPage.vue
│   │   ├── GrantFinderPage.vue
│   │   ├── GrantLetterPage.vue
│   │   ├── MedRunPage.vue
│   │   ├── EODReportPage.vue
│   │   ├── FeedingLogPage.vue
│   │   ├── MorningRoundsPage.vue
│   │   ├── RoundsHistoryPage.vue
│   │   ├── OutcomesPage.vue
│   │   ├── QuarantinePage.vue
│   │   ├── SafeHousesPage.vue
│   │   ├── AvailabilityPage.vue
│   │   ├── ShiftCalendarPage.vue
│   │   ├── RemindersPage.vue
│   │   ├── TrainingPage.vue
│   │   ├── ComplianceChecklistPage.vue
│   │   ├── VolunteerHoursPage.vue
│   │   ├── WaiversPage.vue
│   │   ├── MessagesPage.vue
│   │   ├── MessageTeamPage.vue
│   │   ├── PeoplePage.vue
│   │   ├── ActivityLogPage.vue
│   │   └── DataSeedingPage.vue
│   │
│   ├── modals/                 # Modal components
│   │   └── DietModal.vue
│   │
│   └── [Other Features]
│       ├── VetChat.vue         # AI vet chat interface
│       └── ...
│
├── layout/                      # Layout components
│   ├── Header.vue              # Top header with user menu
│   ├── BottomNav.vue           # Bottom navigation tabs
│   └── MoreDrawer.vue          # Side menu/drawer
│
├── auth/                        # Authentication
│   ├── LoginScreen.vue         # Email/password login
│   ├── WelcomeScreen.vue       # Welcome/login selector
│   └── VolunteerSignup.vue     # New volunteer signup
│
├── ui/                          # Reusable UI components
│   ├── AppButton.vue           # Button component
│   ├── AppCard.vue             # Card container
│   ├── AppInput.vue            # Text input
│   ├── AppSelect.vue           # Dropdown select
│   ├── AppBadge.vue            # Status badge
│   ├── AppBadge.vue            # Alert/info box
│   ├── SectionLabel.vue        # Section header
│   ├── PageContainer.vue       # Page wrapper
│   ├── EmptyState.vue          # Empty list state
│   ├── StatCard.vue            # Statistics card
│   ├── UserRow.vue             # User list item
│   ├── SkeletonLoader.vue      # Loading placeholder
│   └── index.js                # Export all components
│
├── shared/                      # Shared utilities
│   ├── Toast.vue               # Toast notifications
│   ├── ConfirmDialog.vue       # Confirm dialog modal
│   └── SkeletonLoader.vue      # Loading skeleton
│
└── HelloWorld.vue              # (Legacy/example component)
```

### Components by Feature Area

#### **User Authentication**
- `auth/LoginScreen.vue` - Email/password login form
- `auth/WelcomeScreen.vue` - Welcome page with login/signup buttons
- `auth/VolunteerSignup.vue` - Volunteer registration form

#### **Animal Management**
- `features/Animals.vue` - List all animals, filter, search
- `features/AnimalDetail.vue` - Single animal profile page
- `features/animal-detail/*.vue` - 13 different tabs for animal data

#### **Daily Operations**
- `features/admin/MorningRoundsPage.vue` - Morning health check
- `features/admin/FeedingLogPage.vue` - Record feedings
- `features/admin/MedRunPage.vue` - Medication administration
- `features/admin/EODReportPage.vue` - End-of-day summary

#### **Animal Journeys**
- `features/admin/IntakeWizardPage.vue` - Intake process
- `features/admin/AdoptionsPage.vue` - Adoption tracking
- `features/admin/AnimalPipelinePage.vue` - Pipeline management
- `features/admin/OutcomesPage.vue` - Animal outcomes
- `features/admin/QuarantinePage.vue` - Quarantine tracking
- `features/admin/SafeHousesPage.vue` - Foster/safe house management

#### **Staff & Volunteers**
- `features/People.vue` - Staff directory (volunteer view)
- `features/admin/PeoplePage.vue` - CRM and staff management
- `features/VolunteerProfile.vue` - Volunteer profile page
- `features/admin/AvailabilityPage.vue` - Shift availability
- `features/admin/VolunteerHoursPage.vue` - Volunteer hours tracking

#### **Finance**
- `features/admin/LedgerPage.vue` - Transaction ledger
- `features/admin/FinanceStatsPage.vue` - Financial dashboard
- `features/admin/DonorsPage.vue` - Donor management
- `features/admin/GrantsPage.vue` - Grant tracking
- `features/admin/GrantFinderPage.vue` - Grant database
- `features/admin/GrantLetterPage.vue` - LOI/letter generator

#### **Operations**
- `features/admin/AnnouncementsPage.vue` - Team announcements
- `features/admin/TasksPage.vue` - Task management
- `features/admin/BiteReportsPage.vue` - Incident reporting
- `features/admin/RemindersPage.vue` - Automated reminders
- `features/admin/ActivityLogPage.vue` - Activity audit log

#### **Compliance**
- `features/admin/WaiversPage.vue` - Release form tracking
- `features/admin/ApplicationsPage.vue` - Foster/adoption applications
- `features/admin/ComplianceChecklistPage.vue` - Compliance checklist

### UI Components

Located in `components/ui/`, these are reusable building blocks:

| Component | Purpose | Props | Usage |
|-----------|---------|-------|-------|
| `AppButton` | Button | `variant`, `size`, `disabled` | `<AppButton variant="primary" @click="...">` |
| `AppCard` | Container | `flat`, `hover` | `<AppCard><h2>Content</h2></AppCard>` |
| `AppInput` | Text input | `placeholder`, `v-model` | `<AppInput v-model="name" />` |
| `AppSelect` | Dropdown | `options`, `v-model` | `<AppSelect v-model="status" :options="opts" />` |
| `AppBadge` | Status tag | `variant` | `<AppBadge variant="success">Active</AppBadge>` |
| `AlertBox` | Alert message | `type`, `title` | `<AlertBox type="warning">Alert text</AlertBox>` |
| `SectionLabel` | Section header | `text` | `<SectionLabel>Section Name</SectionLabel>` |
| `PageContainer` | Page wrapper | (none) | `<PageContainer><h1>Page</h1></PageContainer>` |
| `EmptyState` | Empty list | `title`, `description` | `<EmptyState title="No items" />` |
| `StatCard` | Stat display | `label`, `value` | `<StatCard label="Total" :value="100" />` |

**All UI components are exported in `components/ui/index.js`:**
```javascript
import { AppButton, AppCard, AppInput, ... } from '../ui'
```

---

## Stores (`/src/stores/`)

Pinia stores for state management. One store per feature.

```
stores/
├── ui.js                       # UI state (current tab, theme, dialog)
├── auth.js                     # User authentication & profile
├── animals.js                  # Animal CRUD operations
├── shifts.js                   # Volunteer shift scheduling
├── people.js                   # Staff/volunteer directory
├── messages.js                 # Inbox/messaging
├── vetHub.js                   # Veterinary operations
├── announcements.js            # Team announcements
├── tasks.js                    # Task management
├── applications.js             # Foster/adoption applications
├── adoptions.js                # Adoption tracking
├── safeHouses.js               # Foster/safe house management
├── waivers.js                  # Release form tracking
├── biteReports.js              # Incident/bite reporting
├── rounds.js                   # Morning/evening rounds
├── roundsHistory.js            # Rounds history
├── medicalRecords.js           # Animal medical records
├── healthMetrics.js            # Health tracking data
├── vaccinations.js             # Vaccination records
├── medRuns.js                  # Medication administration
├── feedingLogs.js              # Feeding records
├── eodReports.js               # End-of-day reports
├── ledger.js                   # Financial transactions
├── financeStats.js             # Financial analytics
├── donors.js                   # Donor management
├── outcomes.js                 # Animal outcomes
├── quarantine.js               # Quarantine tracking
├── compliance.js               # Compliance checklist
├── clockIn.js                  # Clock in/out (volunteer hours)
├── animalDiet.js               # Diet management
├── activityLog.js              # Activity audit log
└── signup.js                   # Volunteer signup flow
```

### Store Pattern

Each store follows this pattern:

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const useFeatureStore = defineStore('featureName', () => {
  // STATE
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ACTIONS
  const fetchItems = async () => { /* ... */ }
  const addItem = async (data) => { /* ... */ }
  const updateItem = async (id, data) => { /* ... */ }
  const deleteItem = async (id) => { /* ... */ }

  // RETURN PUBLIC API
  return { items, loading, error, fetchItems, addItem, updateItem, deleteItem }
})
```

### Key Stores

#### `stores/ui.js`
**Manages:** Current page tab, theme, toast messages, confirm dialogs

**State:**
- `currentTab` - Which page is showing
- `isDarkMode` - Dark/light theme
- `toast` - Toast notification object
- `dialog` - Confirm dialog state

**Actions:**
- `setCurrentTab(tab)` - Navigate to different page
- `toggleTheme()` - Switch light/dark mode
- `showToast(message, type, duration)` - Show notification
- `confirm(options)` - Show confirm dialog

**Example:**
```javascript
const ui = useUIStore()
ui.setCurrentTab('admin-announcements')
ui.showToast('Success!', 'success')
```

#### `stores/auth.js`
**Manages:** User login, logout, current user profile

**State:**
- `user` - Current user object
- `isLoggedIn` - Is user authenticated
- `role` - User role (admin, staff, volunteer)

**Actions:**
- `initializeAuth()` - Load user from Firebase
- `login(email, password)` - Email/password login
- `logout()` - Sign out user

#### `stores/animals.js`
**Manages:** Animal list, detail, CRUD operations

**State:**
- `animals` - Array of all animals
- `selectedAnimal` - Currently selected animal
- `loading` - Is loading data

**Actions:**
- `fetchAnimals()` - Get all animals
- `getAnimalById(id)` - Get single animal
- `addAnimal(data)` - Create animal
- `updateAnimal(id, data)` - Update animal
- `deleteAnimal(id)` - Delete animal

---

## Services & Utils

### `/src/services/`

#### `firebase.js`
**Purpose:** Initialize Firebase and export db/auth instances

**Code:**
```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = { /* ... */ }
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

**Usage:** Import in stores to access Firestore:
```javascript
import { db } from '../services/firebase'
const querySnapshot = await getDocs(collection(db, 'animals'))
```

### `/src/utils/`

#### `seedData.js`
**Purpose:** Generate sample data for development

**Functions:**
- `seedAnimals()` - Create sample animals
- `seedUsers()` - Create sample users
- `seedAnnouncements()` - Create announcements
- `seedAll()` - Run all seed functions

**Usage:**
```bash
npm run seed:applications
npm run seed:eod-reports
npm run seed:med-runs
```

#### `csv.js`
**Purpose:** Export/import CSV files

**Functions:**
- `exportToCSV(data, filename)` - Download CSV
- `parseCSV(file)` - Read CSV file

**Usage:**
```javascript
import { exportToCSV } from '../utils/csv'
exportToCSV(store.animals, 'animals.csv')
```

#### Other Utilities
- `date.js` - Date formatting and utilities
- `validators.js` - Form validation functions
- `seedBiteReports.js` - Seed bite report data
- `seedMessages.js` - Seed message data
- `seedAdminCollections.js` - Seed all admin data
- `seedOutcomes.js` - Seed outcome data

---

## Public Files (`/public/`)

Static assets served by Cloudflare Pages.

```
public/
├── index.html                  # Main HTML file (entry point)
├── _headers                    # Cloudflare headers config
├── favicon.ico                 # Browser tab icon
├── images/                     # Static images
├── icons/                      # SVG icons
└── training.html               # Training modules (iframe)
```

### `public/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SanctuaryBase</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

The `<div id="app">` is where Vue mounts the application.

---

## Functions (`/functions/`)

Cloudflare Worker serverless functions for backend operations.

```
functions/
└── api/
    ├── delete-document.js      # Delete from Firestore
    ├── get-documents.js        # Query Firestore
    ├── upload-document.js      # File upload
    ├── send-reminder.js        # Send email reminders
    ├── vet-chat.js             # AI vet chat integration
    └── generate-loi.js         # Generate LOI letters

└── scheduled/
    └── daily-digest.js         # Scheduled daily task (optional)
```

### Calling Functions from Components

```javascript
// In a component or store
const response = await fetch('/api/get-documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ collection: 'animals' })
})
const data = await response.json()
```

---

## Build & Config

### Configuration Files

#### `vite.config.js`
**Purpose:** Vite build tool configuration

**Current Config:**
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
```

#### `package.json`
**Purpose:** Dependencies and build scripts

**Key Scripts:**
```json
{
  "scripts": {
    "dev": "vite",                    // Start dev server
    "build": "vite build",            // Build for production
    "preview": "vite preview",        // Preview build
    "seed:*": "node scripts/*.js"     // Seed various data
  }
}
```

**Dependencies:**
- `vue` - UI framework
- `pinia` - State management
- `firebase` - Backend
- `vite` - Build tool
- `tailwindcss` - CSS framework

#### `.gitignore`
**Purpose:** Files to exclude from git

**Key Entries:**
```
node_modules/
dist/
.env.local
.DS_Store
```

---

## File Organization Summary

### By Responsibility

**Authentication:**
- `src/stores/auth.js` - Auth state
- `src/stores/signup.js` - Signup state
- `src/components/auth/` - Auth screens

**Data Management:**
- `src/stores/[feature].js` - Pinia stores
- `src/services/firebase.js` - Firebase config
- `src/utils/seedData.js` - Sample data

**UI Components:**
- `src/components/ui/` - Reusable components
- `src/components/layout/` - Header, nav
- `src/components/shared/` - Global utilities

**Features:**
- `src/components/features/` - Feature pages
- `src/components/features/admin/` - Admin pages
- `src/components/features/animal-detail/` - Detail tabs

**Styling:**
- `src/style.css` - Global styles
- `.vue` files - Component scoped styles

### By Layer

```
├── Presentation (UI)
│   ├── App.vue
│   ├── components/ui/
│   ├── components/layout/
│   └── components/features/
│
├── State Management
│   └── stores/
│
├── Data Access
│   ├── services/firebase.js
│   └── utils/seedData.js
│
└── Entry Point
    └── main.js
```

---

## Quick Navigation

### "Where is..."

| What | Where |
|------|-------|
| Animal list page | `src/components/features/Animals.vue` |
| Animal detail page | `src/components/features/AnimalDetail.vue` |
| Dashboard | `src/components/features/Dashboard.vue` |
| Admin menu | `src/components/features/AdminHub.vue` |
| Announcements page | `src/components/features/admin/AnnouncementsPage.vue` |
| Animal store | `src/stores/animals.js` |
| Auth store | `src/stores/auth.js` |
| UI store | `src/stores/ui.js` |
| Reusable buttons | `src/components/ui/AppButton.vue` |
| Toast notifications | `src/components/shared/Toast.vue` |
| Confirm dialog | `src/components/shared/ConfirmDialog.vue` |
| Global styles | `src/style.css` |
| Firebase config | `src/services/firebase.js` |
| Seed scripts | `src/utils/seedData.js` |
| Page routing logic | `src/App.vue` (lines 15-62) |
| Tab list | `src/stores/ui.js` (line 17) |

---

## Adding New Files

### New Feature Page

1. Create store: `src/stores/featureName.js`
2. Create component: `src/components/features/FeatureName.vue`
3. Add route in: `src/App.vue` (import + conditional render)
4. Add menu item in: `src/components/features/AdminHub.vue` (if admin)

### New UI Component

1. Create: `src/components/ui/AppComponent.vue`
2. Export in: `src/components/ui/index.js`
3. Use: `import { AppComponent } from '../ui'`

### New Utility Function

1. Create: `src/utils/functionName.js`
2. Export function
3. Import where needed

---

**Last Updated:** June 28, 2026
**Maintained by:** Development Team
