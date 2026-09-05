"""
RiskLens AI - Model Training Script
------------------------------------
Trains a transaction risk classifier on the Financial Ecosystem dataset.

Why a combined label?
The raw dataset has only 3 confirmed fraud cases (Target_Is_Fraud_AML) out of
5000 rows - far too few to train a reliable model on (a model could predict
"not fraud" every time and still score 99.9% accuracy while missing every
real case). Real-world risk teams handle this by combining a narrow "confirmed
fraud" label with broader risk signals (behavioral anomalies, credit default)
to build a model that flags *risky* transactions for human/AI review - not
just the handful of already-confirmed cases. That's the approach here.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import json
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "transactions.csv")
MODEL_OUT = os.path.join(os.path.dirname(__file__), "risk_model.joblib")
ENCODERS_OUT = os.path.join(os.path.dirname(__file__), "encoders.joblib")
FEATURES_OUT = os.path.join(os.path.dirname(__file__), "feature_columns.json")


def load_data():
    df = pd.read_csv(DATA_PATH)
    return df


def build_label(df):
    """Combine confirmed fraud + behavioral anomaly + credit default into
    one 'High_Risk' label, since confirmed fraud alone is too rare to train on."""
    df["High_Risk"] = (
        df["Target_Is_Fraud_AML"]
        | df["Behavioral_Anomaly_Flag"]
        | df["Target_Credit_Default"]
    ).astype(int)
    return df


# Columns that would leak the answer or are pure identifiers - drop these
DROP_COLS = [
    "Cust_ID", "Account_ID", "Txn_ID", "Counterparty_ID", "Account_Open_Date",
    "Txn_Timestamp", "Target_Is_Fraud_AML", "Target_Credit_Default",
    "Behavioral_Anomaly_Flag", "High_Risk",
]

CATEGORICAL_COLS = [
    "Cust_Gender", "Cust_Marital_Status", "Cust_Education", "Cust_Employment_Status",
    "Cust_Occupation_Sector", "Cust_Home_Ownership", "Account_Type", "Account_Status",
    "Account_KYC_Tier", "Primary_Branch_Region", "Txn_Type", "Txn_Channel",
    "Txn_Currency", "Counterparty_Type", "Txn_Response_Code", "Delinquency_Status",
    "Device_Type", "Device_IP_Country",
]


def prepare_features(df):
    X = df.drop(columns=[c for c in DROP_COLS if c in df.columns])

    encoders = {}
    for col in CATEGORICAL_COLS:
        if col in X.columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = le

    # bool columns -> int
    for col in X.columns:
        if X[col].dtype == bool:
            X[col] = X[col].astype(int)

    return X, encoders


def main():
    print("Loading data...")
    df = load_data()
    df = build_label(df)
    print(f"High_Risk positive rate: {df['High_Risk'].mean():.2%} "
          f"({df['High_Risk'].sum()} of {len(df)})")

    X, encoders = prepare_features(df)
    y = df["High_Risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training RandomForest (class_weight=balanced to handle imbalance)...")
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n--- Evaluation on held-out test set ---")
    print(classification_report(y_test, y_pred, target_names=["Low Risk", "High Risk"]))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_proba):.3f}")

    # Feature importance - useful for your pitch video / README
    importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
    print("\nTop 10 most important features:")
    print(importances.head(10))

    # Save everything the API needs
    joblib.dump(model, MODEL_OUT)
    joblib.dump(encoders, ENCODERS_OUT)
    with open(FEATURES_OUT, "w") as f:
        json.dump(list(X.columns), f, indent=2)

    print(f"\nSaved model to {MODEL_OUT}")
    print(f"Saved encoders to {ENCODERS_OUT}")
    print(f"Saved feature column order to {FEATURES_OUT}")


if __name__ == "__main__":
    main()
