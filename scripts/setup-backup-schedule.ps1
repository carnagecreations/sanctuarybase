# Registers a daily 2:00 AM Windows scheduled task that backs up Firestore.
# Run once (after saving serviceAccountKey.json in the project root):
#   powershell -ExecutionPolicy Bypass -File scripts/setup-backup-schedule.ps1
$projectRoot = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node).Source
$action = New-ScheduledTaskAction -Execute $node -Argument "scripts/backupFirestore.mjs" -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "SanctuaryBase Firestore Backup" -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "Scheduled: daily Firestore backup at 2:00 AM (runs missed backups at next boot)."
