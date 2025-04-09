# app/runner.py
from model.training import train_model
from model.prediction import (
    load_latest_row, load_esg_scores, predict_esg, convert_grade
)
from model.preprocessing import advanced_preprocessing

def main():
    model, feature_cols = train_model("app/data/data1.csv")
    
    latest_data = load_latest_row("app/data/consolidated_esg_single_row.csv")
    esg_score_1, esg_score_2 = load_esg_scores("app/data/esg_scored_result.csv")

    latest_data['esg_score'] = esg_score_1
    latest_data['grade'] = esg_score_2

    processed_latest = advanced_preprocessing(latest_data)
    pred_score = predict_esg(model, processed_latest, feature_cols)
    predicted_grade = convert_grade(pred_score[0])

    print(f"Predicted ESG Score: {pred_score[0]:.2f}")
    print(f"Predicted Grade: {predicted_grade}")

if __name__ == "__main__":
    main()
