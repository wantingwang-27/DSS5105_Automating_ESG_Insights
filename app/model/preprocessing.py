# app/model/preprocessing.py
import pandas as pd
import numpy as np

def standardize_columns(df):
    return df.rename(columns={col: col.strip().lower().replace('&', 'and') for col in df.columns})

def advanced_preprocessing(df):
    df = df[df['esg_score'].notna()].copy()
    df['year'] = pd.to_numeric(df['year'], errors='coerce')

    df['years_active'] = df.groupby('company')['year'].transform(lambda x: x - x.min() + 1)
    df['year_diff'] = df.groupby('company')['year'].transform(lambda x: x.diff().fillna(1))

    num_cols = df.select_dtypes(include=np.number).columns.tolist()
    for col in num_cols:
        df[col] = df.groupby('company')[col].transform(
            lambda x: x.fillna(x.mean() if x.mean() > 0 else 0)
        )
    
    return df
