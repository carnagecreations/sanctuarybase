# Firestore Rules Deployment Guide

## Required Rule Addition

To enable the financeStats collection, add this rule to your Firestore security rules:

```firestore
// ─── FINANCE STATS ─────────────────────────────────────────────────────────
match /financeStats/{docId} { 
  allow read: if isAuth(); 
  allow write: if isPrivileged(); 
}
```

## Where to Add It

Insert the rule in your `firestore.rules` file in this location:

```firestore
    // ─── DONATIONS / SANCTUARY LEDGER ──────────────────────────────────────────
    match /donations/{docId} { allow read: if isAuth(); allow write: if isPrivileged(); }

    // ─── FINANCE STATS ─────────────────────────────────────────────────────────
    match /financeStats/{docId} { allow read: if isAuth(); allow write: if isPrivileged(); }

    // ─── EOD REPORTS ───────────────────────────────────────────────────────────
    match /eodreports/{docId} { allow read: if isAuth(); allow write: if isPrivileged(); }
```

## Deployment Methods

### Method 1: Firebase CLI (Command Line)

```bash
cd "C:\Users\lawye\Projects\SB- v2"

# Deploy only Firestore rules
firebase deploy --only firestore:rules --project sanctuarybasev2
```

**Requirements**:
- Firebase CLI installed: `npm install -g firebase-tools`
- Authenticated Firebase account: `firebase login`
- Project admin permissions

### Method 2: Firebase Console (Web UI)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your Firebase project: **sanctuarybasev2**
3. Navigate to **Firestore Database** section
4. Click on the **Rules** tab
5. Find the current rules and add the financeStats rule:
   - Insert after the `donations` rule
   - Insert before the `eodreports` rule
6. Click the **Publish** button

### Method 3: Manual Deployment with REST API

If you have a service account key, you can deploy rules programmatically:

```bash
# First, create a Cloud Build request or use gcloud CLI
gcloud firestore:rules:deploy firestore.rules --project=sanctuarybasev2
```

## Complete Rules File Example

Here's where the financeStats rule fits in the complete rules file:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function myRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isPrivileged() {
      return isAuth() && (myRole() == 'staff' || myRole() == 'admin');
    }

    // ... other rules ...

    match /donations/{docId} { 
      allow read: if isAuth(); 
      allow write: if isPrivileged(); 
    }

    match /financeStats/{docId} {          // <-- NEW RULE
      allow read: if isAuth(); 
      allow write: if isPrivileged(); 
    }

    match /eodreports/{docId} { 
      allow read: if isAuth(); 
      allow write: if isPrivileged(); 
    }

    // ... more rules ...
  }
}
```

## Rule Explanation

- **`match /financeStats/{docId}`**: Match any document in the financeStats collection
- **`allow read: if isAuth()`**: Any authenticated user can read finance stats
- **`allow write: if isPrivileged()`**: Only staff and admin can write (create/update/delete)

This means:
- ✓ Volunteers can view finance stats (read-only)
- ✓ Staff and admins can manage finance stats (full access)
- ✗ Unauthenticated users cannot access finance stats

## Verification

After deploying the rules, verify they're active:

1. Go to Firebase Console > Firestore Database > Rules tab
2. You should see your financeStats rule listed
3. The "Published" status should be shown
4. The timestamp should reflect when you published

## Troubleshooting Deployment

### "Authentication Error"
- Run `firebase login --reauth` to refresh credentials
- Or use `firebase login:ci` for CI/CD environments (requires interactive setup)

### "Project ID not found"
- Make sure you specify the correct project: `--project sanctuarybasev2`
- Verify project ID in Firebase Console

### "Permission denied"
- Ensure your Firebase account has Editor role on the project
- Check project IAM settings in Google Cloud Console

### Rules Syntax Error
- Check the firestore.rules file for syntax errors
- Use the Firebase Console's inline editor to validate

## After Deployment

Once the rules are deployed:

1. Run the seed script: `npm run seed:finance`
2. Verify data in Firestore Console > financeStats collection
3. Test that the FinanceStatsPage component loads correctly
4. Check that volunteers can view but not edit the stats

## Rollback

If you need to rollback the rules:

1. Go back to your previous rules version
2. Deploy again with Firebase CLI or Console
3. Firebase keeps rule history - you can view and restore previous versions

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/start)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
