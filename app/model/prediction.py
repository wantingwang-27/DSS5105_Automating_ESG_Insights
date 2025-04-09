# app/model/prediction.py
import pandas as pd
from .preprocessing import standardize_columns, advanced_preprocessing

def load_latest_row(filepath):
    df = pd.read_csv(filepath)
    df = standardize_columns(df)
    latest_row = df.iloc[-1].to_dict()
    latest_df = pd.DataFrame([latest_row])
    if 'year' not in latest_df.columns:
        latest_df['year'] = 2024
    return latest_df

def load_esg_scores(filepath):
    esg_df = pd.read_csv(filepath)
    last_row = esg_df.iloc[-1]
    return last_row.iloc[-2], last_row.iloc[-1]

def predict_esg(model, current_data, feature_cols):
    current_data = current_data.copy()
    current_data['years_active'] = current_data['year'] - current_data['year'].min() + 1
    current_data['year_diff'] = 1

    missing_features = set(feature_cols) - set(current_data.columns)
    for feat in missing_features:
        current_data[feat] = 0

    return model.predict(current_data[feature_cols])

def convert_grade(score):
    if pd.isna(score): return None
    if score < 30: return 'D'
    elif score < 40: return 'C-'
    elif score < 50: return 'C'
    elif score < 60: return 'C+'
    elif score < 67: return 'B-'
    elif score < 73: return 'B'
    elif score < 78: return 'B+'
    elif score < 83: return 'A-'
    elif score < 88: return 'A'
    else: return 'A+'
