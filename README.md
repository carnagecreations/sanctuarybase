# SanctuaryBase Admin v2

Modern, maintainable admin dashboard for Saint Francis Rescue. Built with Vue 3, Vite, and Tailwind CSS.

**Status:** Phase 1 Complete ✅  
**Live URL:** Coming to sanctuarybase-v2.pages.dev  
**Original:** sanctuarybase.pages.dev

---

## Quick Start

### Development
```bash
npm install
npm run dev
```
Opens http://localhost:5173

### Build
```bash
npm run build
```

### Deploy to Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name=sanctuarybase-v2
```

---

## Features (Phase 1 ✅)

✅ Dashboard with stats & activity  
✅ Animal management (browse, filter)  
✅ Volunteer shift scheduling  
✅ Staff directory (People/CRM)  
✅ AI Vet Chat interface  
✅ Admin settings hub  
✅ Responsive mobile design  
✅ Dark mode support  

---

## Project Structure

```
src/
├── components/      # Vue components (layout, features, shared)
├── stores/         # Pinia state management
├── services/       # Firebase config
├── App.vue        # Main component
└── main.js        # Entry point
```

---

## Key Documentation

- **[PHASE_1_COMPLETE.md](docs/archive/PHASE_1_COMPLETE.md)** — Detailed feature list, tech stack, next steps
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Component hierarchy, data flow, patterns
- **[EDITING_GUIDE.md](EDITING_GUIDE.md)** — How to add features, edit components

---

## Technology

- Vue 3 (Composition API)
- Vite (build tool)
- Tailwind CSS v4 (styling)
- Pinia (state management)
- Firebase (auth + firestore)

---

## Build Size

- **JS:** 109.5 KB (minified)
- **CSS:** 18.4 KB (minified)
- **Total gzipped:** ~39 KB (vs 2.5MB original!)

---

## Next Phase (Week 2-3)

🚧 Connect real Firebase  
🚧 Implement Google OAuth  
🚧 Build Inbox (website contacts)  
🚧 Finance dashboard  
🚧 Daily care tools  

See [PHASE_1_COMPLETE.md](docs/archive/PHASE_1_COMPLETE.md) for full roadmap.
