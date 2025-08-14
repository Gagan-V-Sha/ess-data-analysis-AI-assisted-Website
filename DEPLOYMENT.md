# 🚀 Deployment Guide

This guide will help you deploy your ESS Data Analysis project to GitHub and host it for free!

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Your project files ready

## 🌐 Step 1: Create GitHub Repository

### 1.1 Go to GitHub
- Visit [github.com](https://github.com)
- Sign in to your account

### 1.2 Create New Repository
- Click the "+" icon in the top right
- Select "New repository"
- Fill in the details:
  - **Repository name**: `ess-data-analysis` (or your preferred name)
  - **Description**: `AI-Powered European Social Survey Data Analysis`
  - **Visibility**: Choose Public or Private
  - **Initialize with**: Don't check any boxes
- Click "Create repository"

## 💻 Step 2: Upload Your Project

### 2.1 Open Terminal/Command Prompt
Navigate to your project folder:
```bash
cd "C:\Users\shrus\OneDrive\Desktop\GaganProject\Project For Wzb"
```

### 2.2 Initialize Git and Upload
```bash
# Initialize Git repository
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: ESS Data Analysis Project"

# Set main branch
git branch -M main

# Add remote origin (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repository name!**

## 🌍 Step 3: Enable GitHub Pages (Free Hosting!)

### 3.1 Go to Repository Settings
- In your GitHub repository, click "Settings" tab
- Scroll down to "Pages" section (left sidebar)

### 3.2 Configure GitHub Pages
- **Source**: Select "Deploy from a branch"
- **Branch**: Choose "main"
- **Folder**: Select "/ (root)"
- Click "Save"

### 3.3 Wait for Deployment
- GitHub will show "Your site is being built"
- Wait a few minutes for deployment
- You'll see: "Your site is published at [URL]"

## 🔗 Step 4: Update Your Website

### 4.1 Your Website URL
Your website will be available at:
```
https://YOUR_USERNAME.github.io/REPO_NAME
```

### 4.2 Update README
- Go to your repository
- Click on `README.md`
- Click the pencil icon to edit
- Replace `[Your GitHub Pages URL will be here]` with your actual URL
- Commit the changes

## 🔄 Step 5: Update Backend URL (Optional)

If you want to deploy the backend separately:

### 5.1 Edit script.js
```javascript
// Change this line in script.js
const API_BASE_URL = 'https://your-backend-url.com';
```

### 5.2 Deploy Backend
You can deploy the backend to:
- **Render** (Free tier)
- **Railway** (Free tier)
- **Heroku** (Paid)

## 📱 Step 6: Test Your Website

1. **Visit your GitHub Pages URL**
2. **Test all features**:
   - Data overview
   - Charts and visualizations
   - AI assistant (if backend is deployed)
3. **Check mobile responsiveness**
4. **Test different browsers**

## 🎯 Step 7: Share Your Project

### 7.1 Add to Portfolio
- Include the GitHub repository link
- Add the live website URL
- Mention the technologies used

### 7.2 Social Media
- Share on LinkedIn
- Post on Twitter/X
- Add to your resume

## 🚨 Troubleshooting

### Website Not Loading
- Check if GitHub Pages is enabled
- Wait a few minutes for deployment
- Check repository settings

### Charts Not Working
- Open browser console (F12)
- Look for JavaScript errors
- Check if all files are uploaded

### Backend Issues
- Ensure backend is running
- Check API endpoints
- Verify CORS settings

## 🎉 Congratulations!

You now have:
- ✅ **GitHub repository** with your project
- ✅ **Free hosted website** on GitHub Pages
- ✅ **Professional portfolio piece**
- ✅ **Shareable project link**

## 🔗 Useful Links

- [GitHub Pages Documentation](https://pages.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Your ESS Data Analysis project is now live on the web! 🌟**
