# Quick Start - Seeding Applications

## TL;DR

Add 5 realistic adoption applications to Firestore in 3 ways:

### Method 1: Browser Console (Fastest)
```javascript
// Open browser console (F12) and paste:
import { seedApplicationsCollection } from './src/utils/seedData.js'
seedApplicationsCollection()
```

### Method 2: Command Line
```bash
npm run seed:applications
```

### Method 3: Admin UI (Easiest)
1. Log in as admin
2. Go to `/admin/data-seeding`
3. Click "Seed Applications"
4. Done!

## What Gets Added?

5 adoption applications with different statuses:

| Applicant | Animal | Status | Type |
|-----------|--------|--------|------|
| Sarah Mitchell | Bearded Dragon | Pending | Permanent |
| Marcus Johnson | Ball Python | Approved | Permanent |
| Emily Rodriguez | Leopard Gecko | Pending | Foster |
| David & Lisa Chen | Boa Constrictor | Under Review | Permanent |
| Rebecca Thompson | Corn Snake | Rejected | Permanent |

## After Seeding

1. Check **Applications Page** to see all new applications
2. Test approval/rejection workflows
3. Filter by status to see different application stages
4. View contact details and applicant information

## Requirements

- Logged in as admin (admin@yumareptiles.com)
- Firestore database accessible
- Database permissions allow writes

## Troubleshooting

**"Permission Denied" error?**
- Make sure you're authenticated
- Check Firestore security rules allow your user

**Data not appearing?**
- Refresh the page
- Check browser console for errors
- Verify collection name is "applications"

## Full Documentation

See `SEED_DATA.md` for:
- Complete schema documentation
- Sample data details
- Firestore rules
- Troubleshooting tips

## Files

- `src/utils/seedData.js` - Data and functions
- `src/scripts/seedApplications.js` - CLI script
- `src/components/features/admin/DataSeedingPage.vue` - UI component
- `SEED_DATA.md` - Full documentation
