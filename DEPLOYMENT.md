# Deployment Guide — SanctuaryBase v2 to Cloudflare Pages

**Status:** Build ready ✅  
**Deploy Target:** sanctuarybase-v2.pages.dev  
**Original App:** sanctuarybase.pages.dev (keep running)

---

## Option 1: Deploy via Wrangler CLI (Recommended)

### Prerequisites
- Wrangler CLI installed: `npm install -g @cloudflare/wrangler`
- Cloudflare account access
- Admin permissions for sanctuarybase Pages project

### Steps

1. **Build the app:**
```bash
cd "C:\Users\lawye\Projects\SB- v2"
npm run build
```
Should output: `✓ built in XXXms`

2. **Deploy to Cloudflare Pages:**
```bash
npx wrangler pages deploy dist --project-name=sanctuarybase-v2
```

3. **Verify deployment:**
- Visit: https://sanctuarybase-v2.pages.dev
- Should see login screen with "Try Demo" button
- Click demo button to test

---

## Option 2: Deploy via Cloudflare Dashboard

### Steps

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com/
   - Select sanctuarybase account

2. **Navigate to Pages**
   - Left sidebar → Pages
   - Click "+ Create a project"

3. **Upload build folder**
   - Choose "Direct upload"
   - Drag & drop `/dist` folder
   - Project name: `sanctuarybase-v2`
   - Deploy

4. **Configure custom domain**
   - Project settings → Custom domain
   - Add: `sanctuarybase-v2.pages.dev`
   - Verify DNS (should auto-configure)

---

## Post-Deployment Checklist

### Verify Deployment
- [ ] App loads at sanctuarybase-v2.pages.dev
- [ ] Login screen appears
- [ ] "Try Demo" button works
- [ ] Dashboard loads with mock data
- [ ] Bottom nav tabs work
- [ ] "More" drawer opens
- [ ] Dark mode toggle works
- [ ] Mobile responsive (open DevTools → toggle device toolbar)

### Test Each Tab
- [ ] Dashboard — Stats visible
- [ ] Animals — List with filters
- [ ] Shifts — Schedule visible
- [ ] People — Volunteer list
- [ ] Vet Chat — Message interface
- [ ] Admin Hub — Settings page

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## URL Configuration

### Current Setup
- **v1 (Original):** https://sanctuarybase.pages.dev
  - Keep running (users can still access)
  - Old admin continues to work
  
- **v2 (New):** https://sanctuarybase-v2.pages.dev
  - Parallel testing
  - Train volunteers on this version
  - Run for 2-3 weeks alongside v1

### Future Migration (Week 8)
1. Switch DNS to point v2.pages.dev to production
2. Keep v1 as archive backup
3. Or: Point sanctuarybase.pages.dev → v2 redirect

---

## Rollback Plan

If v2 has issues:

**Option A: Quick Rollback (DNS)**
```bash
# Point sanctuarybase.pages.dev back to v1
# (via Cloudflare DNS settings)
```

**Option B: Redeploy v1**
```bash
cd "C:\Users\lawye\Projects\SanctuaryBase-Admin"
wrangler pages deploy . --project-name=sanctuarybase
```

**Option C: Delete v2 Project**
```bash
# Via Cloudflare Dashboard:
# Pages → sanctuarybase-v2 → Settings → Delete Project
```

---

## Performance Checks

### Measure Load Time
1. Open https://sanctuarybase-v2.pages.dev
2. Open DevTools → Network tab
3. Reload
4. Check DOMContentLoaded: should be <1 second
5. Check largest resource: should be <50KB

### Expected Sizes
- Index.html: 455 bytes
- CSS: 18.4 KB (gzipped: ~4.4 KB)
- JavaScript: 109.5 KB (gzipped: ~38.9 KB)
- Total: ~120 KB uncompressed, ~43 KB gzipped

### Check with Chrome Lighthouse
1. DevTools → Lighthouse
2. Generate report for Desktop
3. Should see:
   - Performance: 85+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

---

## Environment Variables (Future)

When connecting real Firebase, add secrets via Wrangler:

```bash
# Set test Firebase config
wrangler secret put FIREBASE_API_KEY

# Verify
wrangler secrets list
```

Then update `src/services/firebase.js` to use:
```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
}
```

---

## Monitoring & Analytics

### Enable Cloudflare Analytics
1. Dashboard → Analytics dashboard
2. Review:
   - Page views
   - Unique visitors
   - Requests per day
   - Error rate

### Set up alerts (optional)
1. Notifications → Create Alert
2. Alert type: "Page rules errors"
3. Threshold: 10+ errors in 5 minutes

---

## Security Headers

Cloudflare automatically adds:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection: 1; mode=block

When connecting to Firebase APIs, may need to add CSP header. Update in `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "/*", zone_name = "sanctuarybase-v2.pages.dev" }
]

[env.production.build]
cwd = "./dist"
command = ""
```

---

## Deployment Timeline

### This Week (Week 1)
- ✅ Build complete
- 📅 Deploy to v2.pages.dev
- 📅 Send test URL to core team

### Next Week (Week 2)
- 📅 Firebase setup
- 📅 Connect real data
- 📅 Train volunteers on v2

### Week 3-7
- 📅 Feature development (Inbox, Finance, etc)
- 📅 Ongoing testing
- 📅 Bug fixes

### Week 8
- 📅 Final testing
- 📅 Data migration (if needed)
- 📅 Cut over to v2 as primary

---

## Common Issues & Fixes

### Issue: Deploy fails with "No project found"
**Fix:** Project name must match Cloudflare Pages project name exactly
```bash
# List projects to verify
wrangler pages project list
```

### Issue: App shows blank page
**Fix:** Check browser console (F12 → Console tab)
- Firebase error? → Check credentials in firebase.js
- Missing component? → Check that all imports are correct

### Issue: Styles not loading (unstyled page)
**Fix:** CSS was not minified properly. Rebuild:
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Issue: "Cannot GET /path" when navigating
**Fix:** Cloudflare Pages needs `_redirects` file. Add to root:
```
/* /index.html 200
```
(Should already exist — check `_redirects` file)

---

## After Deployment — Next Steps

1. **Send test URL to team:**
   - Slack: "v2 ready for testing at sanctuarybase-v2.pages.dev"
   - Include demo login instructions

2. **Collect feedback:**
   - Which features are most important?
   - Any design issues?
   - Performance feedback?

3. **Plan Phase 2:**
   - Based on feedback, prioritize features
   - Setup Firebase project
   - Start backend integration

---

## Questions?

- Wrangler CLI help: `wrangler pages help`
- Cloudflare docs: https://developers.cloudflare.com/pages/
- Firebase setup: See `docs/archive/PHASE_1_COMPLETE.md`

---

**Deployment ready!** 🚀

When you're ready, run:
```bash
cd "C:\Users\lawye\Projects\SB- v2"
npm run build
npx wrangler pages deploy dist --project-name=sanctuarybase-v2
```
