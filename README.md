
## RiskLens AI 🛡️

AI-powered transaction risk intelligence platform. Detects potentially fraudulent or high-risk financial transactions in real time using a machine learning model trained on real transaction data.
---

## 🔍 Overview

Fraud and risk teams get flooded with flagged transactions but very little context on *why* something was flagged, which slows down review and manual decision-making. RiskLens AI solves this by scoring every transaction for risk using a trained ML model, then generating a human-readable explanation of exactly which signals made it risky — along with a recommended action (approve, monitor, or send for manual review). This turns a raw risk score into something an analyst can act on immediately.

The model is a Random Forest classifier trained on 5,000+ real transaction records, achieving a ROC-AUC of 0.92 on held-out test data.

---

## ✨ Features

- **Real-time transaction risk scoring** using a Random Forest classifier trained on 5,000+ real transactions
- **Pull Random Transaction** — fetches an actual row from the dataset and scores it using all 47 real features, not placeholder defaults
- **Manual Entry mode** — enter custom transaction parameters and see how the model responds to different risk signals
- **Plain-English explanations** for exactly why a transaction was flagged as risky
- **Risk signal breakdown** — VPN usage, failed logins, transaction velocity, account status, and counterparty type all factored in

---

## 🚦 Risk Level Thresholds

Every transaction is scored between 0% and 100% by the model, then classified into one of three risk bands:

| Risk Level | Score Range | Color | Recommended Action |
|---|---|---|---|
| 🟢 **Low Risk** | 0% – 30% | Green | Approve Transaction |
| 🟡 **Medium Risk** | 30% – 60% | Orange/Amber | Monitor Transaction |
| 🔴 **High Risk** | 60% – 100% | Red | Send for Manual Review |

These thresholds are configurable in `main.py` and can be tuned based on an organization's risk appetite.

---

## 🏗️ Architecture Features

- **Real-time transaction risk scoring** using a Random Forest classifier trained on 5,000+ real transactions
- **Pull Random Transaction** — fetches an actual row from the dataset and scores it using all 47 real features, not placeholder defaults
- **Manual Entry mode** — enter custom transaction parameters and see how the model responds to different risk signals
- **Plain-English explanations** for exactly why a transaction was flagged as risky
- **Risk signal breakdown** — VPN usage, failed logins, transaction velocity, account status, and counterparty type all factored in

---

## 🚦 Risk Level Thresholds

Every transaction is scored between 0% and 100% by the model, then classified into one of three risk bands:

| Risk Level | Score Range | Color | Recommended Action |
|---|---|---|---|
| 🟢 **Low Risk** | 0% – 30% | Green | Approve Transaction |
| 🟡 **Medium Risk** | 30% – 60% | Orange/Amber | Monitor Transaction |
| 🔴 **High Risk** | 60% – 100% | Red | Send for Manual Review |

These thresholds are configurable in `main.py` and can be tuned based on an organization's risk appetite.

---

## 🏗️ Architecture
transactions.csv → train_model.py → risk_model.joblib
│
▼
React Frontend ⇄ FastAPI Backend ⇄ ML Model (scikit-learn)
(Vite + TS) (Python)


- Frontend fetches a real transaction from the backend (`GET /random-transaction`)
- Backend scores it using the full feature set (`POST /score-by-id`)
- A separate simplified endpoint (`POST /analyze-transaction`) supports the manual entry form
- Model was trained on a combined **High_Risk** label (confirmed fraud + behavioral anomaly + credit default flags) to address extreme class imbalance in the raw fraud labels (only 3 confirmed fraud cases out of 5,000 transactions)

---

## 🛠️ Tech Stack

**Frontend**
- React, TypeScript, Vite
- Tailwind CSS
- Lucide Icons

**Backend**
- FastAPI (Python)
- Pydantic for request validation
- Pandas for data handling

**Machine Learning**
- scikit-learn — Random Forest Classifier (`class_weight="balanced"`)
- Feature encoding via LabelEncoder, saved with `joblib`

---

## 📁 Project Structure
Grisklens-ai/
├── Backend/
│ ├── api/
│ │ ├── main.py # FastAPI app + all endpoints
│ │ └── requirements.txt
│ ├── data/
│ │ └── transactions.csv # 5,000+ transaction dataset
│ └── model/
│ ├── train_model.py # Model training script
│ ├── risk_model.joblib
│ ├── encoders.joblib
│ └── feature_columns.json
├── src/
│ ├── App.tsx # Main UI logic
│ ├── components/
│ ├── types.ts
│ └── utils/
├── .env.example
└── README.md



---

## 🚀 Running Locally

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/rathodbhumika01/risklens-ai.git
cd risklens-ai
```

### 2. Backend setup
```bash
cd Backend/api
pip install -r requirements.txt
python main.py
```
Backend runs on `http://localhost:8000`

### 3. (Optional) Retrain the model
```bash
cd Backend/model
python train_model.py
```

### 4. Frontend setup
Open a new terminal, from the project root:
```bash
npm install
```

Create a `.env` file in the root (copy from `.env.example`):
VITE_API_URL=http://127.0.0.1:8000


Then:
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/random-transaction` | Fetch a real random transaction from the dataset |
| `POST` | `/score-by-id` | Score a specific transaction using its full real feature set |
| `POST` | `/analyze-transaction` | Score a manually-entered transaction (simplified fields) |
| `POST` | `/score-transaction` | Score a transaction with all 47 raw fields directly |

---

## 📊 Model Performance

| Metric | Score |
|---|---|
| ROC-AUC | 0.92 |
| Weighted F1-score | 0.96 |

**Top features by importance:** Counterparty Type, Account Status, Transaction Amount, Transaction Response Code, Balance Change

---

## 👤 Author

**Bhumika Rathod**
B.Tech CSE, Sanjivani University


