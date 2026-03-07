# Force push local state to remote Main branch
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -eq "") { $branch = "Main" }

Write-Host "⚠️  ATTENTION : Cela va écraser l'historique distant sur la branche $branch !" -ForegroundColor Red
Write-Host "Appuyez sur Entrée pour continuer ou Ctrl+C pour annuler..."
Read-Host

git add -A
git commit -m "Clean state for production"
git push origin $branch --force

Write-Host "✅ Poussé avec succès !" -ForegroundColor Green
