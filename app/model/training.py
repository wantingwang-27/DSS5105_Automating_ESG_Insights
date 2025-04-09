# app/model/training.py
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor
from .preprocessing import standardize_columns, advanced_preprocessing

def train_model(data_path):
    df = pd.read_csv(data_path)
    df = standardize_columns(df)
    df = advanced_preprocessing(df)

    X = df.drop(columns=['esg_score', 'company', 'year'])
    y = df['esg_score']

    model = make_pipeline(
        SimpleImputer(strategy='mean'),
        StandardScaler(),
        XGBRegressor(n_estimators=1000, max_depth=2, learning_rate=0.1, random_state=42)
    )
    model.fit(X, y)

    return model, X.columns.tolist()
