# git-sync.ps1

# Navigate to the project directory
Set-Location -Path "C:\Users\Yugesh Nandakumar\Desktop\my-flux-project"

# Stage all changes
git add .

# Get commit message from user
$message = Read-Host "Enter a commit message"

# Commit with message
git commit -m "$message"

# Push to GitHub
git push origin main

Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
