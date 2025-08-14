# 🤖 AI-Powered European Social Survey Data Analysis

A modern web application that combines advanced data preprocessing, statistical analysis, and AI-powered insights using the European Social Survey (ESS) Round 11 dataset.

## ✨ Features

- **📊 Advanced Data Preprocessing**: Comprehensive data cleaning, validation, and feature engineering
- **📈 Statistical Analysis**: OLS regression with diagnostics, outlier detection, correlation analysis
- **🤖 AI Integration**: Gemini AI-powered research assistant with multiple research depth levels
- **🎨 Modern UI**: Responsive web interface with interactive charts and visualizations
- **🌍 European Context**: Specialized analysis for European social science research

## 🚀 Live Demo

**Website**: (https://gagan-v-sha.github.io/ess-data-analysis-AI-assisted-Website/)

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)** - Interactive functionality and data visualization
- **Chart.js** - Beautiful data charts and graphs
- **Plotly.js** - Interactive scientific plotting

### Backend
- **FastAPI** - Modern, fast Python web framework
- **Pandas** - Data manipulation and analysis
- **Statsmodels** - Statistical modeling and regression analysis
- **Google Generative AI** - AI-powered insights and research assistance

## 📁 Project Structure

```
Project For Wzb/
├── index.html              # Main frontend file
├── styles.css              # CSS styling
├── script.js               # Frontend JavaScript
├── backend.py              # FastAPI backend server
├── requirements.txt        # Python dependencies
├── start_backend.bat      # Windows startup script
├── start_backend.sh       # Linux/Mac startup script
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.8+
- Modern web browser

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Gemini API Key
```bash
# Windows
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY=your_api_key_here
```

### 3. Start Backend Server
```bash
# Windows
start_backend.bat

# Linux/Mac
chmod +x start_backend.sh
./start_backend.sh
```

### 4. Open Frontend
Open `index.html` in your web browser

## 🌐 Deployment & Hosting

### Option 1: GitHub Pages (Free Frontend Hosting)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ESS Data Analysis Project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your website will be available at**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

### Option 2: Full Stack Hosting (Render, Railway, or Heroku)

For the backend API, you can deploy to:
- **Render** (Free tier available)
- **Railway** (Free tier available)
- **Heroku** (Paid)

Update the `API_BASE_URL` in `script.js` to point to your deployed backend.

## 📊 Dataset Information

The application analyzes the **European Social Survey Round 11** dataset, focusing on:
- **Immigration attitudes** (impcntr)
- **Political orientation** (lrscale)
- **Demographics** (age, gender, education, income)
- **Country-level analysis** across European nations

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Generative AI API key

### Backend Configuration
- **Port**: 3000 (configurable in `backend.py`)
- **Host**: 0.0.0.0 (accessible from any IP)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **European Social Survey** for providing the dataset
- **Google Generative AI** for AI capabilities
- **FastAPI** team for the excellent web framework
- **Chart.js** and **Plotly.js** for data visualization

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues) page
2. Create a new issue with detailed description
3. Include your system information and error messages

---

**Made with ❤️ for European social science research**
