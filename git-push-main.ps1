param(
    [Parameter(Mandatory = $true)]
    [string]$Message
)

# Vérifie que l'on est dans un dépôt git
git rev-parse --is-inside-work-tree > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ce dossier n'est pas un dépôt Git. Place-toi à la racine du projet avant de lancer ce script." -ForegroundColor Red
    exit 1
}

Write-Host "Ajout de tous les fichiers modifiés..." -ForegroundColor Cyan
git add -A

Write-Host "`nRésumé des modifications :" -ForegroundColor Cyan
git status

$confirmation = Read-Host "`nPoursuivre le commit et le push vers origin/Main ? (o/N)"
if ($confirmation -ne "o" -and $confirmation -ne "O") {
    Write-Host "Opération annulée." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nCommit en cours..." -ForegroundColor Cyan
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "Le commit a échoué (souvent parce qu'il n'y a aucun changement à valider)." -ForegroundColor Red
    exit 1
}

Write-Host "`nPush vers origin/Main..." -ForegroundColor Cyan
git push origin Main
