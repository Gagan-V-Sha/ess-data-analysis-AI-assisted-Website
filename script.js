// Global variables
let currentData = null;
let currentRegressionResults = null;

// Backend API configuration
const API_BASE_URL = 'http://localhost:3000';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTabs();
    initializeChat();
    loadData();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Chat functionality
function initializeChat() {
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input-field');
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Send chat message
async function sendMessage() {
    const input = document.getElementById('chat-input-field');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    input.value = '';
    
    try {
        const researchDepth = document.getElementById('research-depth').value;
        
        // Call FastAPI backend AI endpoint
        const response = await fetch(`${API_BASE_URL}/api/ai-assistant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                research_depth: researchDepth
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const aiResponse = await response.json();
        addMessageToChat('ai', aiResponse.response);
    } catch (error) {
        console.error('Error calling AI:', error);
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again. You may need to check if the backend is running.');
    }
}

// Add message to chat
function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (sender === 'ai') {
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<p>${content}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// AI response generation now handled by FastAPI backend

// Load and process data from FastAPI backend
async function loadData() {
    showLoading();
    
    try {
        // Load data overview from FastAPI backend
        const overviewResponse = await fetch(`${API_BASE_URL}/api/data-overview`);
        if (!overviewResponse.ok) throw new Error('Failed to load data overview');
        const overview = await overviewResponse.json();
        
        // Load regression analysis
        const regressionResponse = await fetch(`${API_BASE_URL}/api/regression-analysis`);
        if (!regressionResponse.ok) throw new Error('Failed to load regression analysis');
        const regression = await regressionResponse.json();
        
        // Load distributions
        const distributionsResponse = await fetch(`${API_BASE_URL}/api/data-distributions`);
        if (!distributionsResponse.ok) throw new Error('Failed to load distributions');
        const distributions = await distributionsResponse.json();
        
        // Load country analysis
        const countryResponse = await fetch(`${API_BASE_URL}/api/country-analysis`);
        if (!countryResponse.ok) throw new Error('Failed to load country analysis');
        const countryStats = await countryResponse.json();
        
        // Load demographics analysis
        const demographicsResponse = await fetch(`${API_BASE_URL}/api/demographics-analysis`);
        if (!demographicsResponse.ok) throw new Error('Failed to load demographics analysis');
        const demographics = await demographicsResponse.json();
        
        // Load scatter data
        const scatterResponse = await fetch(`${API_BASE_URL}/api/scatter-data`);
        if (!scatterResponse.ok) throw new Error('Failed to load scatter data');
        const scatterData = await scatterResponse.json();
        
        // Process the real data
        currentData = {
            ...overview,
            distributions: distributions,
            countryStats: countryStats,
            demographics: demographics,
            scatterData: scatterData.data,
            regression: regression
        };
        
        // Update UI
        updateMetrics();
        createCharts();
        performAnalysis();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading data:', error);
        hideLoading();
        showError(`Failed to load data: ${error.message}. Please ensure the FastAPI backend is running on port 8000.`);
    }
}

// Data processing functions removed - now handled by FastAPI backend

// Update metrics display
function updateMetrics() {
    if (!currentData) return;
    
    document.getElementById('total-observations').textContent = currentData.total_observations.toLocaleString();
    document.getElementById('total-variables').textContent = currentData.total_variables;
    document.getElementById('total-countries').textContent = currentData.total_countries;
    document.getElementById('age-range').textContent = currentData.age_range;
    
    // Create completeness chart
    createCompletenessChart();
}

// Create completeness chart
function createCompletenessChart() {
    const ctx = document.getElementById('completenessChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(currentData.completeness),
            datasets: [{
                label: 'Completeness (%)',
                data: Object.values(currentData.completeness),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Create all charts
function createCharts() {
    if (!currentData) return;
    
    createDistributionCharts();
    createCountryCharts();
    createDemographicsCharts();
    createScatterPlot();
}

// Create distribution charts
function createDistributionCharts() {
    // Immigration attitudes distribution
    const immigrationData = [{
        x: currentData.distributions.immigration,
        type: 'histogram',
        name: 'Immigration Attitudes',
        marker: {
            color: 'rgba(99, 102, 241, 0.8)',
            line: {
                color: 'rgba(99, 102, 241, 1)',
                width: 1
            }
        }
    }];
    
    const immigrationLayout = {
        title: 'Distribution of Immigration Attitudes',
        xaxis: { title: 'Immigration Attitude (1=Allow Many, 4=Allow None)' },
        yaxis: { title: 'Frequency' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('immigration-dist', immigrationData, immigrationLayout, {responsive: true});
    
    // Political orientation distribution
    const politicalData = [{
        x: currentData.distributions.political,
        type: 'histogram',
        name: 'Political Orientation',
        marker: {
            color: 'rgba(139, 92, 246, 0.8)',
            line: {
                color: 'rgba(139, 92, 246, 1)',
                width: 1
            }
        }
    }];
    
    const politicalLayout = {
        title: 'Distribution of Political Orientation',
        xaxis: { title: 'Political Scale (0=Left, 10=Right)' },
        yaxis: { title: 'Frequency' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('political-dist', politicalData, politicalLayout, {responsive: true});
    
    // Age distribution
    const ageData = [{
        x: Array.from({length: 74}, (_, i) => i + 16),
        y: currentData.distributions.age,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Age Distribution',
        line: {
            color: 'rgba(16, 185, 129, 0.8)',
            width: 3
        },
        marker: {
            color: 'rgba(16, 185, 129, 0.6)',
            size: 4
        }
    }];
    
    const ageLayout = {
        title: 'Age Distribution',
        xaxis: { title: 'Age' },
        yaxis: { title: 'Frequency' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('age-dist', ageData, ageLayout, {responsive: true});
    
    // Education distribution
    const educationData = [{
        x: ['1', '2', '3', '4', '5', '6', '7'],
        y: currentData.distributions.education,
        type: 'bar',
        name: 'Education Level',
        marker: {
            color: 'rgba(245, 158, 11, 0.8)',
            line: {
                color: 'rgba(245, 158, 11, 1)',
                width: 1
            }
        }
    }];
    
    const educationLayout = {
        title: 'Education Level Distribution',
        xaxis: { title: 'Education Level (1=Low, 7=High)' },
        yaxis: { title: 'Frequency' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('education-dist', educationData, educationLayout, {responsive: true});
}

// Create country charts
function createCountryCharts() {
    // Country statistics table
    const countryStatsTable = document.getElementById('country-stats-table');
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">';
    tableHTML += '<thead><tr><th style="padding: 12px; border: 1px solid #ddd; background: #f8f9fa;">Country</th><th style="padding: 12px; border: 1px solid #ddd; background: #f8f9fa;">Immigration Mean</th><th style="padding: 12px; border: 1px solid #ddd; background: #f8f9fa;">Political Mean</th><th style="padding: 12px; border: 1px solid #ddd; background: #f8f9fa;">Age Mean</th><th style="padding: 12px; border: 1px solid #ddd; background: #f8f9fa;">Count</th></tr></thead><tbody>';
    
    Object.entries(currentData.countryStats).forEach(([country, stats]) => {
        tableHTML += `<tr><td style="padding: 12px; border: 1px solid #ddd;">${country}</td><td style="padding: 12px; border: 1px solid #ddd;">${stats.impcntr.mean}</td><td style="padding: 12px; border: 1px solid #ddd;">${stats.lrscale.mean}</td><td style="padding: 12px; border: 1px solid #ddd;">${stats.agea.mean}</td><td style="padding: 12px; border: 1px solid #ddd;">${stats.impcntr.count}</td></tr>`;
    });
    
    tableHTML += '</tbody></table>';
    countryStatsTable.innerHTML = tableHTML;
    
    // Country boxplot
    const countryData = Object.entries(currentData.countryStats).map(([country, stats]) => ({
        y: Array.from({length: stats.impcntr.count}, () => parseFloat(stats.impcntr.mean) + (Math.random() - 0.5) * 2),
        type: 'box',
        name: country,
        boxpoints: false
    }));
    
    const countryLayout = {
        title: 'Immigration Attitudes by Country',
        yaxis: { title: 'Immigration Attitude' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('country-boxplot', countryData, countryLayout, {responsive: true});
}

// Create demographics charts
function createDemographicsCharts() {
    // Gender boxplot
    const genderData = [
        {
            y: Array.from({length: 1000}, () => currentData.demographics.gender.male.mean + (Math.random() - 0.5) * 2),
            type: 'box',
            name: 'Male',
            boxpoints: false
        },
        {
            y: Array.from({length: 1000}, () => currentData.demographics.gender.female.mean + (Math.random() - 0.5) * 2),
            type: 'box',
            name: 'Female',
            boxpoints: false
        }
    ];
    
    const genderLayout = {
        title: 'Immigration Attitudes by Gender',
        yaxis: { title: 'Immigration Attitude' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('gender-boxplot', genderData, genderLayout, {responsive: true});
    
    // Age group boxplot
    const ageGroupData = Object.entries(currentData.demographics.age_groups).map(([group, stats]) => ({
        y: Array.from({length: 1000}, () => stats.mean + (Math.random() - 0.5) * 2),
        type: 'box',
        name: group,
        boxpoints: false
    }));
    
    const ageGroupLayout = {
        title: 'Immigration Attitudes by Age Group',
        yaxis: { title: 'Immigration Attitude' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('age-group-boxplot', ageGroupData, ageGroupLayout, {responsive: true});
    
    // Education boxplot
    const educationData = Object.entries(currentData.demographics.education).map(([level, stats]) => ({
        y: Array.from({length: 8000}, () => stats.mean + (Math.random() - 0.5) * 2),
        type: 'box',
        name: level,
        boxpoints: false
    }));
    
    const educationLayout = {
        title: 'Immigration Attitudes by Education',
        yaxis: { title: 'Immigration Attitude' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('education-boxplot', educationData, educationLayout, {responsive: true});
    
    // Political boxplot
    const politicalData = Object.entries(currentData.demographics.political).map(([orientation, stats]) => ({
        y: Array.from({length: 8000}, () => stats.mean + (Math.random() - 0.5) * 2),
        type: 'box',
        name: orientation,
        boxpoints: false
    }));
    
    const politicalLayout = {
        title: 'Immigration Attitudes by Political Orientation',
        yaxis: { title: 'Immigration Attitude' },
        margin: { t: 50, b: 50, l: 50, r: 20 }
    };
    
    Plotly.newPlot('political-boxplot', politicalData, politicalLayout, {responsive: true});
}

// Create scatter plot with real data
function createScatterPlot() {
    if (!currentData.scatterData) return;
    
    const scatterData = currentData.scatterData.map(point => ({
        x: point.x,
        y: point.y,
        mode: 'markers',
        type: 'scatter',
        name: point.country,
        marker: {
            size: point.age / 10,
            opacity: 0.7,
            color: Math.random() * 360
        },
        text: `Country: ${point.country}<br>Age: ${point.age}<br>Political: ${point.x}<br>Immigration: ${point.y}`,
        hoverinfo: 'text'
    }));
    
    const scatterLayout = {
        title: 'Political Orientation vs Immigration Attitudes by Country',
        xaxis: { title: 'Political Scale (0=Left, 10=Right)' },
        yaxis: { title: 'Immigration Attitude (1=Allow Many, 4=Allow None)' },
        margin: { t: 50, b: 50, l: 50, r: 20 },
        showlegend: true
    };
    
    Plotly.newPlot('scatter-plot', scatterData, scatterLayout, {responsive: true});
}

// Perform analysis
function performAnalysis() {
    if (!currentData) return;
    
    // Outlier detection
    performOutlierDetection();
    
    // Correlation matrix
    createCorrelationMatrix();
    
    // Model diagnostics
    createModelDiagnostics();
    
    // Regression results
    createRegressionResults();
}

// Perform outlier detection
function performOutlierDetection() {
    const outlierInfo = document.getElementById('outlier-info');
    
    if (!currentData.regression.outliers) return;
    
    let html = '<div style="display: grid; gap: 10px;">';
    Object.entries(currentData.regression.outliers).forEach(([variable, count]) => {
        html += `<div style="display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 8px;">
                    <span><strong>${variable}:</strong></span>
                    <span style="color: #dc3545;">${count} outliers detected</span>
                 </div>`;
    });
    html += '</div>';
    
    outlierInfo.innerHTML = html;
}

// Create correlation matrix
function createCorrelationMatrix() {
    const matrixContainer = document.getElementById('correlation-matrix');
    
    if (!currentData.regression.correlation_matrix) return;
    
    const variables = Object.keys(currentData.regression.correlation_matrix);
    
    let html = '<table>';
    html += '<thead><tr><th></th>';
    variables.forEach(variable => {
        html += `<th>${variable}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    variables.forEach(variable => {
        html += '<tr>';
        html += `<td>${variable}</td>`;
        variables.forEach(var2 => {
            const corr = currentData.regression.correlation_matrix[variable][var2];
            const color = Math.abs(corr) > 0.8 ? '#dc3545' : Math.abs(corr) > 0.5 ? '#ffc107' : '#28a745';
            html += `<td style="color: ${color}; font-weight: bold;">${corr.toFixed(3)}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    matrixContainer.innerHTML = html;
}

// Create model diagnostics
function createModelDiagnostics() {
    const diagnosticsGrid = document.getElementById('model-diagnostics');
    
    if (!currentData.regression.diagnostics) return;
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">';
    Object.entries(currentData.regression.diagnostics).forEach(([metric, value]) => {
        html += `<div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: #6366f1; margin-bottom: 5px;">${value}</div>
                    <div style="color: #666; font-size: 0.9rem;">${metric}</div>
                 </div>`;
    });
    html += '</div>';
    
    diagnosticsGrid.innerHTML = html;
}

// Create regression results
function createRegressionResults() {
    const regressionSummary = document.getElementById('regression-summary');
    
    if (!currentData.regression.model_summary) return;
    
    regressionSummary.textContent = currentData.regression.model_summary;
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showLoading() {
    document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('show');
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        z-index: 10000;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Handle window resize for responsive charts
window.addEventListener('resize', function() {
    // Trigger Plotly resize for all charts
    const chartContainers = document.querySelectorAll('[id$="-dist"], [id$="-boxplot"], [id$="-plot"]');
    chartContainers.forEach(container => {
        if (container.data) {
            Plotly.relayout(container.id, {
                'width': container.offsetWidth
            });
        }
    });
});
