import pandas as pd
import numpy as np
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# 500 companies
NUM_SAMPLES = 500

# Sample company names
company_prefixes = ['Green', 'Eco', 'Future', 'Energy', 'Clean', 'Blue', 'Solar', 'Wind', 'Carbon', 'Smart']
company_suffixes = ['Tech', 'Corp', 'Partners', 'Solutions', 'Holdings', 'Enterprises', 'Group', 'Ltd', 'Systems', 'Fund']

def generate_company_name():
    return f"{random.choice(company_prefixes)} {random.choice(company_suffixes)}"

# Keyword-like features (simulate frequency counts)
def generate_keyword_features():
    return {
        "emissions": np.random.poisson(3),
        "carbon": np.random.poisson(2),
        "diversity": np.random.poisson(2),
        "board": np.random.poisson(2),
        "governance": np.random.poisson(3)
    }

# Normalize raw counts to score (0–100)
def normalize_score(raw_count, max_count=10):
    return min(100, round((raw_count / max_count) * 100))

# Convert overall to grade
def grade_from_score(score):
    if score >= 80: return 'A'
    elif score >= 60: return 'B'
    elif score >= 40: return 'C'
    return 'D'

# Generate synthetic dataset
data = []
for _ in range(NUM_SAMPLES):
    company = generate_company_name()
    keywords = generate_keyword_features()

    e_score = normalize_score(keywords['emissions'] + keywords['carbon'])
    s_score = normalize_score(keywords['diversity'])
    g_score = normalize_score(keywords['board'] + keywords['governance'])
    overall = round((e_score + s_score + g_score) / 3)
    grade = grade_from_score(overall)

    row = {
        "company": company,
        **keywords,
        "e": e_score,
        "s": s_score,
        "g": g_score,
        "overall": overall,
        "grade": grade
    }
    data.append(row)

# Convert to DataFrame
df = pd.DataFrame(data)

# Preview
print(df.head())

# Save to CSV if needed
df.to_csv("synthetic_esg_data.csv", index=False)
print("✅ Saved synthetic_esg_data.csv with 500 rows.")
