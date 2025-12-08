# TillSave Auto-Deploy Script for Windows PowerShell
# Automatically commits and pushes changes to GitHub after fixes

param(
    [string]$Message = "TillSave fixes"
)

function Write-Status {
    param([string]$Status, [string]$Message)
    
    $colors = @{
        'Success' = 'Green'
        'Error' = 'Red'
        'Info' = 'Cyan'
        'Action' = 'Yellow'
    }
    
    Write-Host "[$Status] $Message" -ForegroundColor $colors[$Status]
}

try {
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-Status 'Error' "Not a git repository. Initialize with 'git init' first."
        exit 1
    }

    Write-Status 'Info' "TillSave Auto-Deploy Started"

    # Get current information
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $branch = & git rev-parse --abbrev-ref HEAD

    # Stage all changes
    Write-Status 'Action' "Staging changes..."
    & git add -A

    # Check if there are changes to commit
    $status = & git diff --cached --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Status 'Success' "No changes to commit"
        exit 0
    }

    # Create descriptive commit message
    $commitMsg = "[Auto-Deploy] $Message - $timestamp"

    # Commit changes
    Write-Status 'Action' "Committing changes..."
    & git commit -m $commitMsg

    # Push to remote
    Write-Status 'Action' "Pushing to GitHub ($branch)..."
    & git push origin $branch

    # Get commit hash
    $commitHash = & git rev-parse --short HEAD
    Write-Status 'Success' "Successfully deployed! Commit: $commitHash"
    Write-Host ""
    Write-Host "📊 Recent commits:"
    & git log --oneline -5

}
catch {
    Write-Status 'Error' "Deployment failed: $_"
    exit 1
}
