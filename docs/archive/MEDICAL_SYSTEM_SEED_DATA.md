# Medical System Sample Data

## Sample Medical Records

These are example medical records you can add through the UI for testing:

### Record 1: Initial Health Examination
```
Description: Initial health examination - intake
Type: Examination
Veterinarian: Dr. Sarah Chen
Date: 2024-03-01
Notes: Good overall health, all vitals normal. No visible injuries.
Cost: 150
```

### Record 2: Vaccination Series
```
Description: FVRCP and Rabies vaccination
Type: Vaccination
Veterinarian: Dr. Sarah Chen
Date: 2024-03-05
Notes: Both vaccines administered successfully. Animal tolerated well.
Cost: 85
```

### Record 3: Lab Work
```
Description: Bloodwork panel - routine screening
Type: Lab Work
Veterinarian: Dr. James Wilson
Date: 2024-03-10
Notes: Complete blood count and chemistry panel. Results within normal range.
Cost: 200
```

### Record 4: Diagnosis
```
Description: Mild respiratory infection diagnosed
Type: Diagnosis
Veterinarian: Dr. Sarah Chen
Date: 2024-03-15
Notes: Started on antibiotics. Monitor for 10 days and schedule follow-up.
Cost: 0
```

### Record 5: Treatment
```
Description: Antibiotic course - doxycycline
Type: Treatment
Veterinarian: Dr. Sarah Chen
Date: 2024-03-15
Notes: 10-day course of doxycycline 50mg twice daily. Give with food.
Cost: 45
```

### Record 6: Follow-up Examination
```
Description: Follow-up exam post-treatment
Type: Examination
Veterinarian: Dr. James Wilson
Date: 2024-03-25
Notes: Respiratory infection cleared. Animal responsive and healthy.
Cost: 100
```

### Record 7: Procedure
```
Description: Dental cleaning
Type: Procedure
Veterinarian: Dr. Sarah Chen
Date: 2024-04-10
Notes: Under general anesthesia. 2 teeth extracted. Recovery uneventful.
Cost: 450
```

## Sample Vaccinations

### Vaccination 1: FVRCP
```
Vaccine Name: FVRCP
Date Given: 2024-03-05
Next Due: 2025-03-05
Veterinarian: Dr. Sarah Chen
Batch Number: FVRCP-2024-001
```

### Vaccination 2: Rabies
```
Vaccine Name: Rabies
Date Given: 2024-03-05
Next Due: 2026-03-05
Veterinarian: Dr. Sarah Chen
Batch Number: RABIES-2024-015
```

### Vaccination 3: DHPP
```
Vaccine Name: DHPP
Date Given: 2024-02-20
Next Due: 2025-02-20
Veterinarian: Dr. James Wilson
Batch Number: DHPP-2024-042
```

### Vaccination 4: Bordetella
```
Vaccine Name: Bordetella
Date Given: 2024-03-15
Next Due: 2025-03-15
Veterinarian: Dr. Sarah Chen
Batch Number: BORDE-2024-008
```

### Vaccination 5: FVRCP Booster
```
Vaccine Name: FVRCP Booster
Date Given: 2024-06-05
Next Due: 2026-06-05
Veterinarian: Dr. James Wilson
Batch Number: FVRCP-2024-087
```

## Testing Scenarios

### Scenario 1: Current Animal with Complete Medical History
Create records 1-7 and vaccinations 1-5 for a single animal to see:
- Chronological medical history sorted by date (newest first)
- Complete vaccine record with various status indicators
- No medical alerts in ProfileTab (all vaccines current)

### Scenario 2: Animal with Overdue Vaccines
Modify vaccination 1 (FVRCP) to have a past due date:
- Change "Next Due" to a date before today (e.g., 2024-12-05)
- View in VaccinesTab to see red "Overdue" badge
- View ProfileTab to see overdue vaccine alert

### Scenario 3: Animal with Vaccines Due Soon
Modify vaccination 3 (DHPP) to be due within 30 days:
- Change "Next Due" to 15 days from today
- View in VaccinesTab to see yellow "Due Soon" badge
- View ProfileTab to see due soon vaccine alert

### Scenario 4: New Animal with Minimal Records
Add just 1-2 records to see:
- Empty state functionality when switching between animals
- Form validation for required fields
- Fresh animal with no medical history

## Firestore Direct Population (Advanced)

If you prefer to populate data directly in Firestore Console:

### Medical Record Document
```
Collection: animalMedical
Document: {auto-id}

{
  "animalId": "animal-id-here",
  "date": Timestamp (March 1, 2024),
  "type": "examination",
  "description": "Initial health examination - intake",
  "veterinarian": "Dr. Sarah Chen",
  "notes": "Good overall health, all vitals normal. No visible injuries.",
  "cost": 150,
  "prescriptions": [],
  "createdAt": Timestamp (now),
  "updatedAt": Timestamp (now)
}
```

### Vaccination Document
```
Collection: vaccinations
Document: {auto-id}

{
  "animalId": "animal-id-here",
  "vaccineName": "FVRCP",
  "dueDate": Timestamp (March 5, 2024),
  "completedDate": Timestamp (March 5, 2024),
  "nextDueDate": Timestamp (March 5, 2025),
  "veterinarian": "Dr. Sarah Chen",
  "batchNumber": "FVRCP-2024-001",
  "createdAt": Timestamp (now),
  "updatedAt": Timestamp (now)
}
```

## Quick Start Data Script

To quickly test the system with an animal:

1. Go to Animals page and create a test animal (if you haven't already)
2. Click on the animal to open AnimalDetail
3. Click on "Meds" tab
4. Add 2-3 medical records using examples from above
5. Click on "Vaccines" tab
6. Add 3-4 vaccinations using examples from above
7. Go back to "Profile" tab to see medical alerts

## Verification Checklist

After adding data, verify:

- [ ] Medical records appear in chronological order (newest first)
- [ ] Vaccine names and due dates display correctly
- [ ] Icons match record types (🏥, 📋, 💊, etc.)
- [ ] Overdue vaccines show red badge if due date passed
- [ ] Due soon vaccines show yellow badge if due within 30 days
- [ ] Current vaccines show green badge
- [ ] ProfileTab shows medical alerts for overdue/due soon vaccines
- [ ] ProfileTab shows "All vaccinations up to date" when no alerts
- [ ] Edit button allows updating records
- [ ] Delete button removes records after confirmation
- [ ] Form clears after successfully adding new records

