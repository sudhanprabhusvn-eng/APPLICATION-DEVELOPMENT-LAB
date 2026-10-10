@echo off
echo ========================================
echo   Auto-Push to GitHub
echo ========================================
git add .
set /p msg="Enter commit message (press Enter for default): "
if "%msg%"=="" set msg=Update experiments
git commit -m "%msg%"
git push origin main
echo ========================================
echo   Push completed successfully!
echo ========================================
pause
