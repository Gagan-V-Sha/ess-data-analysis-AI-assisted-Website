@echo off
echo ========================================
echo    ESS Data Analysis - GitHub Deploy
echo ========================================
echo.

echo This script will help you deploy your project to GitHub
echo.

echo Step 1: Make sure you have:
echo - GitHub account created
echo - Git installed on your computer
echo - Repository created on GitHub
echo.

echo Step 2: Enter your GitHub details when prompted
echo.

set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter your repository name: "

echo.
echo Step 3: Initializing Git repository...
git init

echo.
echo Step 4: Adding all files...
git add .

echo.
echo Step 5: Making first commit...
git commit -m "Initial commit: ESS Data Analysis Project"

echo.
echo Step 6: Setting main branch...
git branch -M main

echo.
echo Step 7: Adding remote origin...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo Step 8: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo           DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your project is now on GitHub!
echo.
echo Next steps:
echo 1. Go to your repository on GitHub
echo 2. Click Settings ^> Pages
echo 3. Select "Deploy from a branch"
echo 4. Choose "main" branch and "/ (root)" folder
echo 5. Click Save
echo.
echo Your website will be available at:
echo https://%GITHUB_USERNAME%.github.io/%REPO_NAME%
echo.
echo Press any key to exit...
pause > nul
