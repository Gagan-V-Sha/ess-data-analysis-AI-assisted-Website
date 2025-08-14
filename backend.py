from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import pandas as pd
import statsmodels.formula.api as sm
import google.generativeai as genai
import numpy as np
from pathlib import Path
import os

app = FastAPI(
    title="ESS Data Analysis API",
    description="Backend API for European Social Survey data analysis with AI-powered insights",
    version="1.0.0"
)

# CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class AIRequest(BaseModel):
    message: str
    research_depth: str = "basic"

class DataOverview(BaseModel):
    total_observations: int
    total_variables: int
    total_countries: int
    age_range: str
    completeness: Dict[str, float]

# Global variables to store processed data
df_processed = None
regression_results = None

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif pd.isna(obj):
        return None
    else:
        return obj

def load_and_prepare_data():
    """Load and prepare ESS data with comprehensive preprocessing"""
    global df_processed
    
    if df_processed is not None:
        return df_processed
    
    try:
        # Load the Stata file
        file_path = "ESS11.dta"
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Data file {file_path} not found")
        
        # Read data with convert_categoricals=False to avoid the prtvtbrs error
        df = pd.read_stata(file_path, convert_categoricals=False)
        
        # Check if required variables exist
        required_vars = ['impcntr', 'lrscale', 'hincfel', 'eisced', 'aesfdrk', 'agea', 'gndr', 'cntry']
        missing_vars = [var for var in required_vars if var not in df.columns]
        if missing_vars:
            raise ValueError(f"Missing required variables: {missing_vars}")
        
        # Initial data info
        initial_shape = df.shape
        initial_missing = df.isnull().sum()
        
        # Data cleaning and validation
        # Filter for valid impcntr values (1-4)
        df = df[df['impcntr'].isin([1, 2, 3, 4])]
        
        # Filter for valid lrscale values (0-10)
        df = df[df['lrscale'].isin(range(11))]
        
        # Validate hincfel (1-4)
        df = df[df['hincfel'].isin([1, 2, 3, 4])]
        
        # Validate eisced (1-7)
        df = df[df['eisced'].isin(range(1, 8))]
        
        # Validate agea (16-100)
        df = df[(df['agea'] >= 16) & (df['agea'] <= 100)]
        
        # Validate gender (1-2)
        df = df[df['gndr'].isin([1, 2])]
        
        # Drop rows with missing values in key variables
        df = df.dropna(subset=['impcntr', 'lrscale', 'hincfel', 'eisced', 'agea', 'gndr', 'cntry'])
        
        # Data transformation and feature engineering
        df['gender_female'] = (df['gndr'] == 2).astype(int)
        
        # Create age groups
        df['age_group'] = pd.cut(df['agea'], 
                                bins=[0, 24, 34, 49, 64, 100], 
                                labels=['18-24', '25-34', '35-49', '50-64', '65+'])
        
        # Create education groups
        df['education_group'] = pd.cut(df['eisced'], 
                                     bins=[0, 2, 5, 7], 
                                     labels=['Low', 'Medium', 'High'])
        
        # Create income groups
        df['income_group'] = pd.cut(df['hincfel'], 
                                  bins=[0, 2, 4], 
                                  labels=['Low', 'High'])
        
        # Create political groups
        df['political_group'] = pd.cut(df['lrscale'], 
                                     bins=[-1, 3, 6, 10], 
                                     labels=['Left', 'Center', 'Right'])
        
        # Create immigration groups
        df['immigration_group'] = pd.cut(df['impcntr'], 
                                       bins=[0, 2, 4], 
                                       labels=['Liberal', 'Restrictive'])
        
        df_processed = df
        return df
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")

def run_regression(df):
    """Run regression analysis with comprehensive diagnostics"""
    global regression_results
    
    if regression_results is not None:
        return regression_results
    
    try:
        # Data quality checks
        # Outlier detection using IQR method
        numerical_cols = ['impcntr', 'lrscale', 'hincfel', 'eisced', 'agea']
        outliers_info = {}
        
        for col in numerical_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            outliers_info[col] = len(outliers)
        
        # Correlation matrix
        correlation_matrix = df[numerical_cols].corr().round(3).to_dict()
        
        # Run regression
        model_formula = "impcntr ~ lrscale + hincfel + eisced + aesfdrk + agea + gender_female + C(cntry)"
        
        try:
            model = sm.ols(model_formula, data=df).fit()
        except:
            # Fallback to simpler model if the primary regression fails
            model_formula = "impcntr ~ lrscale + agea + gender_female"
            model = sm.ols(model_formula, data=df).fit()
        
        # Model diagnostics
        diagnostics = {
            'r_squared': round(model.rsquared, 4),
            'adj_r_squared': round(model.rsquared_adj, 4),
            'f_statistic': round(model.fvalue, 2),
            'f_pvalue': round(model.f_pvalue, 4),
            'aic': round(model.aic, 2),
            'bic': round(model.bic, 2)
        }
        
        # Coefficients and p-values
        coefficients = model.params.round(4).to_dict()
        p_values = model.pvalues.round(4).to_dict()
        
        regression_results = {
            'outliers': outliers_info,
            'correlation_matrix': correlation_matrix,
            'diagnostics': diagnostics,
            'coefficients': coefficients,
            'p_values': p_values,
            'model_summary': str(model.summary())
        }
        
        return convert_numpy_types(regression_results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running regression: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "ESS Data Analysis API", "status": "running"}

@app.get("/api/data-overview", response_model=DataOverview)
async def get_data_overview():
    """Get data quality overview and metrics"""
    try:
        df = load_and_prepare_data()
        
        overview = {
            'total_observations': len(df),
            'total_variables': len(df.columns),
            'total_countries': df['cntry'].nunique(),
            'age_range': f"{int(df['agea'].min())}-{int(df['agea'].max())}",
            'completeness': {
                'impcntr': round(df['impcntr'].notna().sum() / len(df) * 100, 1),
                'lrscale': round(df['lrscale'].notna().sum() / len(df) * 100, 1),
                'hincfel': round(df['hincfel'].notna().sum() / len(df) * 100, 1),
                'eisced': round(df['eisced'].notna().sum() / len(df) * 100, 1),
                'agea': round(df['agea'].notna().sum() / len(df) * 100, 1),
                'gndr': round(df['gndr'].notna().sum() / len(df) * 100, 1)
            }
        }
        
        return convert_numpy_types(overview)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/regression-analysis")
async def get_regression_analysis():
    """Get regression results and diagnostics"""
    try:
        df = load_and_prepare_data()
        results = run_regression(df)
        return convert_numpy_types(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data-distributions")
async def get_data_distributions():
    """Get distribution data for charts"""
    try:
        df = load_and_prepare_data()
        
        # Immigration attitudes distribution (1-4)
        immigration_counts = df['impcntr'].value_counts().sort_index()
        immigration_dist = [immigration_counts.get(i, 0) for i in range(1, 5)]
        
        # Political orientation distribution (0-10)
        political_counts = df['lrscale'].value_counts().sort_index()
        political_dist = [political_counts.get(i, 0) for i in range(11)]
        
        # Age distribution (16-100)
        age_counts = df['agea'].value_counts().sort_index()
        age_dist = [age_counts.get(i, 0) for i in range(16, 101)]
        
        # Education distribution (1-7)
        education_counts = df['eisced'].value_counts().sort_index()
        education_dist = [education_counts.get(i, 0) for i in range(1, 8)]
        
        distributions = {
            'immigration': immigration_dist,
            'political': political_dist,
            'age': age_dist,
            'education': education_dist
        }
        
        return convert_numpy_types(distributions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/country-analysis")
async def get_country_analysis():
    """Get country-level statistics"""
    try:
        df = load_and_prepare_data()
        
        country_stats = {}
        for country in sorted(df['cntry'].unique()):
            country_data = df[df['cntry'] == country]
            country_stats[country] = {
                'impcntr': {
                    'mean': round(country_data['impcntr'].mean(), 2),
                    'std': round(country_data['impcntr'].std(), 2),
                    'count': len(country_data)
                },
                'lrscale': {
                    'mean': round(country_data['lrscale'].mean(), 2),
                    'std': round(country_data['lrscale'].std(), 2)
                },
                'agea': {
                    'mean': round(country_data['agea'].mean(), 1),
                    'std': round(country_data['agea'].std(), 1)
                }
            }
        
        return convert_numpy_types(country_stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/demographics-analysis")
async def get_demographics_analysis():
    """Get demographic breakdowns"""
    try:
        df = load_and_prepare_data()
        
        # Gender analysis
        male_data = df[df['gndr'] == 1]
        female_data = df[df['gndr'] == 2]
        
        # Age groups analysis
        age_groups = {
            '18-24': df[df['age_group'] == '18-24'],
            '25-34': df[df['age_group'] == '25-34'],
            '35-49': df[df['age_group'] == '35-49'],
            '50-64': df[df['age_group'] == '50-64'],
            '65+': df[df['age_group'] == '65+']
        }
        
        # Education groups analysis
        education_groups = {
            'Low': df[df['education_group'] == 'Low'],
            'Medium': df[df['education_group'] == 'Medium'],
            'High': df[df['education_group'] == 'High']
        }
        
        # Political groups analysis
        political_groups = {
            'Left': df[df['political_group'] == 'Left'],
            'Center': df[df['political_group'] == 'Center'],
            'Right': df[df['political_group'] == 'Right']
        }
        
        demographics = {
            'gender': {
                'male': {
                    'mean': round(male_data['impcntr'].mean(), 2),
                    'std': round(male_data['impcntr'].std(), 2),
                    'count': len(male_data)
                },
                'female': {
                    'mean': round(female_data['impcntr'].mean(), 2),
                    'std': round(female_data['impcntr'].std(), 2),
                    'count': len(female_data)
                }
            },
            'age_groups': {
                group: {
                    'mean': round(data['impcntr'].mean(), 2),
                    'std': round(data['impcntr'].std(), 2),
                    'count': len(data)
                } for group, data in age_groups.items()
            },
            'education': {
                level: {
                    'mean': round(data['impcntr'].mean(), 2),
                    'std': round(data['impcntr'].std(), 2),
                    'count': len(data)
                } for level, data in education_groups.items()
            },
            'political': {
                orientation: {
                    'mean': round(data['impcntr'].mean(), 2),
                    'std': round(data['impcntr'].std(), 2),
                    'count': len(data)
                } for orientation, data in political_groups.items()
            }
        }
        
        return convert_numpy_types(demographics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scatter-data")
async def get_scatter_data():
    """Get data for scatter plot (sample for performance)"""
    try:
        df = load_and_prepare_data()
        
        # Sample data for better performance (max 2000 points)
        if len(df) > 2000:
            df_sample = df.sample(n=2000, random_state=42)
        else:
            df_sample = df
        
        scatter_data = []
        for _, row in df_sample.iterrows():
            scatter_data.append({
                'x': float(row['lrscale']),
                'y': float(row['impcntr']),
                'age': int(row['agea']),
                'country': str(row['cntry']),
                'gender': str(row['gndr']),
                'education': int(row['eisced'])
            })
        
        return convert_numpy_types({'data': scatter_data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai-assistant")
async def ai_assistant(request: AIRequest):
    """Handle AI chat requests with Gemini"""
    try:
        # Configure Gemini API (you'll need to set your API key)
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return {"response": "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.", "research_depth": request.research_depth}
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Get current data context
        df = load_and_prepare_data()
        regression = run_regression(df)
        
        # Create appropriate prompt based on research depth
        if request.research_depth == 'basic':
            base_prompt = f"""You are an expert data analyst. Based on this ESS dataset analysis, answer the user's question.

Dataset Info:
- Total observations: {len(df)}
- Countries: {df['cntry'].nunique()}
- Age range: {df['agea'].min()}-{df['agea'].max()}

Regression Results:
- R-squared: {regression['diagnostics']['r_squared']}
- F-statistic: {regression['diagnostics']['f_statistic']}

User Question: {request.message}

Provide a clear, data-driven answer based on the analysis results."""
            
        elif request.research_depth == 'enhanced':
            base_prompt = f"""You are an expert European social scientist. Provide enhanced analysis with European context.

Dataset Context:
- European Social Survey Round 11
- {len(df)} respondents from {df['cntry'].nunique()} European countries
- Variables: Immigration attitudes, political orientation, demographics

Key Findings:
- Immigration attitudes range: 1 (Allow many) to 4 (Allow none)
- Political scale: 0 (Left) to 10 (Right)
- R-squared: {regression['diagnostics']['r_squared']}

User Question: {request.message}

Provide enhanced analysis with European social context and policy implications."""
            
        else:  # deep research
            base_prompt = f"""You are an expert researcher. Conduct deep analysis incorporating current social science literature, European policy context, and methodological insights.

Research Context:
- European Social Survey Round 11: {len(df)} respondents, {df['cntry'].nunique()} countries
- Dependent variable: Immigration attitudes (1-4 scale)
- Independent variables: Political orientation, income, education, age, gender, country
- Model performance: R²={regression['diagnostics']['r_squared']}, F={regression['diagnostics']['f_statistic']}

User Question: {request.message}

Provide comprehensive analysis including:
1. Statistical interpretation of results
2. Current European social science literature context
3. Policy implications for European immigration
4. Methodological considerations
5. Future research directions"""
        
        # Generate response
        response = model.generate_content(base_prompt)
        
        return {
            "response": response.text,
            "research_depth": request.research_depth
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "ESS Data Analysis API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

