# RiskLens AI

AI-powered transaction risk intelligence platform. Detects potentially fraudulent or high-risk financial transactions in real time using a trained machine learning model.

## Features

- Real-time transaction risk scoring using a Random Forest classifier trained on 5,000+ transactions
- Pull random real transactions from the dataset and see live risk analysis
- Manually enter transaction details to test how the model responds
- Plain-English explanations for why a transaction was flagged
- ROC-AUC of 0.92 on held-out test data

## 🚦 Risk Level Thresholds

Every transaction is scored between 0% and 100% by the model, then classified into one of three risk bands:

| Risk Level | Score Range | Color | Recommended Action |
|---|---|---|---|
| 🟢 **Low Risk** | 0% – 30% | Green | Approve Transaction |
| 🟡 **Medium Risk** | 30% – 60% | Orange/Amber | Monitor Transaction |
| 🔴 **High Risk** | 60% – 100% | Red | Send for Manual Review |

These thresholds are configurable in `main.py` and can be tuned based on an organization's risk appetite.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** FastAPI (Python)
- **ML:** scikit-learn (Random Forest Classifier)

## Running Locally

### Backend
