"""
RiskLens AI - API
------------------
Exposes POST /score-transaction which:
1. Runs the trained model to get a risk score (0-1)
2. If risky, optionally asks an LLM to explain why in plain English
"""

import os
import json
import joblib
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional


# --------------------------------------------------
# MODEL SETUP
# --------------------------------------------------

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model")

model = joblib.load(
    os.path.join(MODEL_DIR, "risk_model.joblib")
)

encoders = joblib.load(
    os.path.join(MODEL_DIR, "encoders.joblib")
)

with open(
    os.path.join(MODEL_DIR, "feature_columns.json")
) as f:
    FEATURE_COLUMNS = json.load(f)


# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------

app = FastAPI(
    title="RiskLens AI",
    description="AI-powered transaction risk scoring API"
)


# --------------------------------------------------
# CORS
# Allows React frontend to communicate with backend
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# TRANSACTION MODEL
# --------------------------------------------------

class Transaction(BaseModel):

    Cust_Age: int
    Cust_Gender: str
    Cust_Marital_Status: str
    Cust_Dependents: int
    Cust_Education: str
    Cust_Employment_Status: str
    Cust_Occupation_Sector: str
    Cust_Annual_Income_USD: float
    Cust_Home_Ownership: str

    Account_Type: str
    Account_Status: str
    Account_KYC_Tier: str

    Primary_Branch_Region: str

    Total_Assets_Under_Management: float

    Has_Active_Credit_Card: bool
    Has_Active_Loan: bool

    Digital_Banking_Enrollment: bool

    Txn_Type: str
    Txn_Channel: str

    Txn_Amount_USD: float
    Txn_Currency: str

    Counterparty_Type: str

    Merchant_Category_Code_MCC: int

    Txn_Response_Code: str

    Orig_Balance_Before: float
    Orig_Balance_After: float

    Dest_Balance_Before: float
    Dest_Balance_After: float

    Monthly_Avg_Inflow: float
    Monthly_Avg_Outflow: float

    Overdraft_Limit_USD: float

    Days_In_Overdraft_L12M: int

    Credit_Card_Utilization_Rate: float

    Delinquency_Status: str

    Risk_Score_Internal: int

    Bureau_Credit_Score: int

    Device_Type: str

    Device_IP_Country: str

    Is_VPN_Used: bool

    Login_Attempts_Fail_Count: int

    Txn_Velocity_1H: int


# --------------------------------------------------
# ENCODE TRANSACTION
# --------------------------------------------------

def encode_transaction(txn: dict) -> pd.DataFrame:

    row = {}

    for col in FEATURE_COLUMNS:

        val = txn.get(col)

        if col in encoders:

            le = encoders[col]

            val = str(val)

            if val in le.classes_:
                val = le.transform([val])[0]
            else:
                val = 0

        elif isinstance(val, bool):

            val = int(val)

        row[col] = val

    return pd.DataFrame(
        [row]
    )[FEATURE_COLUMNS]


# --------------------------------------------------
# RULE-BASED EXPLANATION
# --------------------------------------------------

def rule_based_explanation(
    txn: dict,
    risk_score: float,
    risk_level: str = "High"
) -> str:

    reasons = []

    if txn.get("Is_VPN_Used"):
        reasons.append(
            "the transaction came through a VPN"
        )

    if txn.get(
        "Login_Attempts_Fail_Count",
        0
    ) >= 2:

        reasons.append(
            "there were multiple failed login attempts beforehand"
        )

    if txn.get(
        "Txn_Velocity_1H",
        0
    ) >= 3:

        reasons.append(
            "an unusually high number of transactions happened in the last hour"
        )

    if (
        txn.get("Counterparty_Type")
        in (
            "Mega_Corporation",
            "Small_Business"
        )
        and txn.get(
            "Txn_Amount_USD",
            0
        ) > 5000
    ):

        reasons.append(
            "the transaction amount is large relative to typical activity"
        )

    if txn.get(
        "Account_Status"
    ) != "Active":

        reasons.append(
            "the account status is not fully active"
        )

    if not reasons:

        reasons.append(
            "the combination of account and transaction signals deviates from normal patterns"
        )

    return (
        f"Flagged as {risk_level.lower()} risk "
        f"(score {risk_score:.0%}) because "
        + ", and ".join(reasons)
        + "."
    )


# --------------------------------------------------
# OPTIONAL LLM EXPLANATION
# --------------------------------------------------

def llm_explanation(
    txn: dict,
    risk_score: float
) -> Optional[str]:

    api_key = os.environ.get(
        "ANTHROPIC_API_KEY"
    )

    if not api_key:
        return None

    try:

        import anthropic

        client = anthropic.Anthropic(
            api_key=api_key
        )

        prompt = (
            f"A transaction risk model flagged this "
            f"transaction with risk score "
            f"{risk_score:.0%}.\n\n"

            f"Transaction details:\n"
            f"{json.dumps(txn, default=str)}\n\n"

            "In 2-3 sentences, explain in plain English "
            "why this transaction looks risky, "
            "as if explaining to a fraud analyst."
        )

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )

        return response.content[0].text

    except Exception:

        return None


# --------------------------------------------------
# SCORE TRANSACTION ENDPOINT
# --------------------------------------------------

@app.post("/score-transaction")
def score_transaction(
    txn: Transaction
):

    txn_dict = txn.dict()

    X = encode_transaction(
        txn_dict
    )

    risk_score = float(
        model.predict_proba(X)[0, 1]
    )

    is_high_risk = (
        risk_score >= 0.5
    )

    explanation = None

    if is_high_risk:

        explanation = (
            llm_explanation(
                txn_dict,
                risk_score
            )
            or rule_based_explanation(
                txn_dict,
                risk_score,
                "High"
            )
        )

    return {

        "risk_score": round(
            risk_score,
            4
        ),

        "is_high_risk": is_high_risk,

        "explanation": explanation,

    }

# --------------------------------------------------
# SIMPLE FRONTEND TRANSACTION MODEL
# --------------------------------------------------

class SimpleTransaction(BaseModel):
    Txn_Amount_USD: float
    Txn_Type: str
    Counterparty_Type: str
    Is_VPN_Used: bool
    Login_Attempts_Fail_Count: int
    Transactions_In_Last_Hour: int
    Account_Status: str


# --------------------------------------------------
# SIMPLE SCORE ENDPOINT FOR REACT FRONTEND
# --------------------------------------------------

@app.post("/analyze-transaction")
def analyze_transaction(txn: SimpleTransaction):

    # Start with default values for all model features
    full_txn = {
        "Cust_Age": 35,
        "Cust_Gender": "Male",
        "Cust_Marital_Status": "Single",
        "Cust_Dependents": 0,
        "Cust_Education": "Bachelor",
        "Cust_Employment_Status": "Employed",
        "Cust_Occupation_Sector": "Technology",
        "Cust_Annual_Income_USD": 60000.0,
        "Cust_Home_Ownership": "Rent",
        "Account_Type": "Savings",
        "Account_Status": txn.Account_Status,
        "Account_KYC_Tier": "Standard",
        "Primary_Branch_Region": "North_America",
        "Total_Assets_Under_Management": 10000.0,
        "Has_Active_Credit_Card": True,
        "Has_Active_Loan": False,
        "Digital_Banking_Enrollment": True,
        "Txn_Type": txn.Txn_Type,
        "Txn_Channel": "Mobile_App",
        "Txn_Amount_USD": txn.Txn_Amount_USD,
        "Txn_Currency": "USD",
        "Counterparty_Type": txn.Counterparty_Type,
        "Merchant_Category_Code_MCC": 5411,
        "Txn_Response_Code": "Approved",
        "Orig_Balance_Before": 5000.0,
        "Orig_Balance_After": max(0, 5000.0 - txn.Txn_Amount_USD),
        "Dest_Balance_Before": 1000.0,
        "Dest_Balance_After": 1000.0 + txn.Txn_Amount_USD,
        "Monthly_Avg_Inflow": 5000.0,
        "Monthly_Avg_Outflow": 3500.0,
        "Overdraft_Limit_USD": 500.0,
        "Days_In_Overdraft_L12M": 0,
        "Credit_Card_Utilization_Rate": 0.30,
        "Delinquency_Status": "No",
        "Risk_Score_Internal": 30,
        "Bureau_Credit_Score": 700,
        "Device_Type": "Mobile",
        "Device_IP_Country": "US",
        "Is_VPN_Used": txn.Is_VPN_Used,
        "Login_Attempts_Fail_Count": txn.Login_Attempts_Fail_Count,
        "Txn_Velocity_1H": txn.Transactions_In_Last_Hour,
    }

    X = encode_transaction(full_txn)

    risk_score = float(model.predict_proba(X)[0, 1])

    # Risk level
    if risk_score < 0.30:
        risk_level = "Low"
    elif risk_score < 0.60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    explanation = rule_based_explanation(full_txn, risk_score, risk_level)

    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "explanation": explanation,
    }


# --------------------------------------------------
# ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def root():

    return {

        "status": "RiskLens AI API is running",

        "docs": "/docs"

    }


# --------------------------------------------------
# LOAD CSV ONCE (for random transaction pulls)
# --------------------------------------------------

TRANSACTIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "transactions.csv")
transactions_df = pd.read_csv(TRANSACTIONS_PATH)


def row_to_frontend_transaction(row) -> dict:
    return {
        "id": row["Txn_ID"],
        "name": f"{row['Txn_Type'].replace('_', ' ')} — {row['Counterparty_Type'].replace('_', ' ')}",
        "Txn_Amount_USD": float(row["Txn_Amount_USD"]),
        "Txn_Type": row["Txn_Type"],
        "Counterparty_Type": row["Counterparty_Type"],
        "Is_VPN_Used": bool(row["Is_VPN_Used"]),
        "Login_Attempts_Fail_Count": int(row["Login_Attempts_Fail_Count"]),
        "Transactions_In_Last_Hour": int(row["Txn_Velocity_1H"]),
        "Account_Status": row["Account_Status"],
        "timestamp": str(row["Txn_Timestamp"]),
        "location": row["Device_IP_Country"],
    }


# --------------------------------------------------
# GET A REAL RANDOM TRANSACTION FROM CSV
# --------------------------------------------------

@app.get("/random-transaction")
def random_transaction():
    row = transactions_df.sample(1).iloc[0]
    return row_to_frontend_transaction(row)


# --------------------------------------------------
# SCORE A REAL TRANSACTION USING ITS FULL CSV ROW
# (all 40+ real features, not fake defaults)
# --------------------------------------------------

class TxnIdRequest(BaseModel):
    id: str

@app.post("/score-by-id")
def score_by_id(req: TxnIdRequest):
    matches = transactions_df[transactions_df["Txn_ID"] == req.id]

    if matches.empty:
        return {"error": "Transaction not found"}

    row = matches.iloc[0].to_dict()

    X = encode_transaction(row)
    risk_score = float(model.predict_proba(X)[0, 1])

    if risk_score < 0.30:
        risk_level = "Low"
    elif risk_score < 0.60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    explanation = rule_based_explanation(row, risk_score, risk_level)

    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "explanation": explanation,
    }


# --------------------------------------------------
# RUN SERVER (sabse last mein — sab endpoints ke define hone ke baad)
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)