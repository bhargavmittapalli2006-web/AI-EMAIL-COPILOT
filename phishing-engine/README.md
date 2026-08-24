# Phishing Engine Service

The Security & Phishing Engine is responsible for:
- Detecting phishing attempt indicators in incoming emails.
- Calculating a normalized phishing risk score.
- Providing human-readable explanations of flagged indicators (e.g., suspicious links, spoofed headers, urgent tone).

## Tech Stack
- **Language:** Python
- **API Framework:** FastAPI & Uvicorn
- **Data Processing:** pandas, NumPy
- **ML Framework:** scikit-learn

## Directory Structure
- `app/`: FastAPI application code, API routes, schemas, and dependencies.
- `ml/`: Model training scripts, feature extraction pipelines, and evaluation utilities.
- `saved_models/`: Serialized model artifacts and feature scalers/vectorizers.
- `tests/`: Unit and integration test suites.
