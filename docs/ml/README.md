# Machine Learning Phishing Detection Engine

## 1. Why Spam != Phishing

A critical distinction in email security and machine learning is understanding that **spam and phishing are fundamentally different threat vectors**:

| Characteristic | Promotional / Commercial Spam | Phishing Attacks |
|---|---|---|
| **Intent** | Unsolicited marketing, affiliate links, mass advertisements | Deception, credential harvesting, financial fraud, impersonation |
| **Tactics** | Promotional discounts, product pitches, sales blasts | Social engineering, artificial urgency, security panic, spoofed domains |
| **Danger Level** | Low/Annoyance (inbox clutter) | High/Critical (account takeover, corporate breach, monetary theft) |
| **Language Features**| `deal`, `discount`, `unsubscribe`, `free shipping` | `suspended`, `unauthorized login`, `verify credentials`, `password expires` |

*Training a model solely on Spam vs. Ham produces an advertisement filter rather than a cybersecurity defense.* This project explicitly preserves the baseline spam filter while developing a genuine **Legitimate vs. Phishing** detector.

---

## 2. Baseline Model (Spam vs. Ham)

- **Dataset**: Enron Spam & Legitimate Email Corpus (`MWiechmann/enron_spam_data`)
- **Total Samples**: 2,012 emails (1,006 Spam, 1,006 Legitimate Ham)
- **Objective**: Commercial spam vs. legitimate corporate ham
- **Baseline Metrics (Held-out Test Split)**:
  - **Accuracy**: 96.28%
  - **Precision**: 93.46%
  - **Recall**: 99.50%
  - **F1 Score**: 96.39%
- **Preservation Status**: Preserved in documentation and archive (`saved_models/phishing_pipeline_old_baseline.joblib`).

---

## 3. Final Model (Legitimate vs. Phishing)

- **Objective**: Identify authentic cyber attacks and deceptive phishing emails from legitimate corporate business communication.
- **Dataset Composition**:
  - **Phishing (Label 1)**: Jose Nazario Phishing Corpus (`Nazario.csv`), consisting of real archived phishing campaigns (banking alerts, credential harvests, eBay/PayPal spoofing, cPanel attacks).
  - **Legitimate (Label 0)**: Authentic corporate business emails from the Enron Ham corpus (project updates, sprint planning, client communications, executive notes).
- **Total Samples**: 2,000 samples (1,000 Legitimate, 1,000 Phishing).

---

## 4. Dataset Sources & Licensing

| Component | Source / Origin | URL / Identifier |
|---|---|---|
| **Phishing Attacks (Class 1)** | Jose Nazario Phishing Corpus | `https://raw.githubusercontent.com/Bilal-73/Phishing-and-Spam-Detection/main/data/Nazario.csv` |
| **Legitimate Corporate (Class 0)** | Enron Ham Corpus | `https://raw.githubusercontent.com/MWiechmann/enron_spam_data/master/enron_spam_data.zip` |
| **License** | Open Access Academic & Research Usage | Public Cybersecurity Benchmark |

---

## 5. Dataset Composition & Label Definitions

- **Processed File**: `data/processed/phishing_dataset.csv`
- **Schema**:
  - `id`: Unique identifier (`email-1`, `email-2`, ...)
  - `subject`: Cleaned subject line
  - `sender`: Sender address
  - `reply_to`: Reply-To address
  - `body`: Full email body text
  - `links`: Extracted JSON array of embedded URLs
  - `label`: Binary integer (`0` = Legitimate, `1` = Phishing)
  - `classification`: Human-readable label (`legitimate` / `phishing`)
  - `email_text`: Clean concatenation of subject and body

---

## 6. Preprocessing Pipeline (`ml/preprocessing.py`)

1. **Text Combination**: Concatenates subject and body while handling missing/null subjects or bodies gracefully.
2. **Whitespace Cleaning**: Strips extraneous whitespace while preserving structural paragraph breaks.
3. **URL Preservation**: Extracts and preserves HTTP/HTTPS and raw IP URLs without modifying core vocabulary.
4. **Deduplication**: Eliminates duplicate emails to avoid memorization.
5. **Length Filtering**: Filters out uninformative records (< 20 characters).
6. **Class Balancing**: Balanced 1:1 ratio (1,000 Legitimate, 1,000 Phishing).

---

## 7. Feature Extraction (TF-IDF Vectorizer)

- **N-Gram Range**: (1, 2) — captures single terms (`password`, `suspended`) and key phishing phrases (`verify account`, `unauthorized access`, `action required`).
- **Sublinear TF**: `True` — applies logarithmic scaling $1 + \log(\text{tf})$ to prevent high-frequency words from overpowering signals.
- **Max Features**: 15,000 terms.
- **Stop Words**: English stop words removed to focus on semantic and domain tokens.
- **Accents**: Unicode normalized.

---

## 8. Classification Model (Logistic Regression)

- **Regularization**: L2 regularization ($C = 1.0$) for robust generalization.
- **Class Weighting**: `balanced` to ensure equal importance across classes.
- **Solver**: `liblinear` (fast, deterministic convergence on sparse TF-IDF matrices).
- **Random State**: `42` for exact reproducibility.

---

## 9. Evaluation Metrics & Comparison

Evaluated on held-out 20% test partition (400 samples: 200 Legitimate, 200 Phishing):

```text
======================================================================
                      MODEL EVALUATION REPORT
======================================================================
A. BASELINE MODEL (Spam vs. Ham)
   Dataset        : Enron Spam & Legitimate Email Corpus (Spam/Ham)
   Total Samples  : 2,012 (1,006 Spam, 1,006 Legitimate Ham)
   Accuracy       : 96.28%
   Precision      : 93.46%
   Recall         : 99.50%
   F1 Score       : 96.39%
----------------------------------------------------------------------
B. FINAL MODEL (Legitimate vs. Phishing)
   Dataset        : True Legitimate vs. Phishing (Nazario Phishing + Enron Ham)
   Test Samples   : 400 (200 Legit, 200 Phish)
   Accuracy       : 99.50%
   Precision      : 99.50%
   Recall         : 99.50%
   F1 Score       : 99.50%
   ROC-AUC        : 99.99%
----------------------------------------------------------------------
   Confusion Matrix:
     True Negatives  (Legitimate correctly identified) : 199
     False Positives (Legitimate flagged as Phishing)   : 1
     False Negatives (Phishing missed as Legitimate)    : 1
     True Positives  (Phishing correctly caught)        : 199
======================================================================
```

---

## 10. Data Leakage Prevention

1. **Strict Train/Test Split**: Stratified 80/20 split executed prior to any feature extraction.
2. **Vocabulary Isolation**: `TfidfVectorizer` is fitted exclusively on the 1,600 training samples. The test set is only transformed.
3. **No Overlap**: Automated assertion validates zero text overlap between train and test splits (`overlap_count = 0`).
4. **Held-Out Test Partition**: Saved independently to `data/processed/test_split.csv`.

---

## 11. Model Limitations

- **Obfuscation**: Heavily obfuscated zero-day URLs or QR-code based phishing (quishing) require visual or OCR multi-modal analysis.
- **Spear Phishing**: Hyper-targeted spear phishing with no urgency language or links may have lower probabilities and benefits from heuristic rule fusion and LLM deep inspection.

---

## 12. Model Loading & Inference

### Option A: Using the `ml.predict` module

```python
from ml.predict import predict, predict_proba

# Run prediction on email
subject = "Team Sprint Planning Tomorrow"
body = "Hi team, please review the sprint backlog before tomorrow's meeting."

result = predict(subject=subject, body=body)
print(result)
# Output:
# {
#     "prediction": 0,
#     "label": "legitimate",
#     "phishing_probability": 0.0512,
#     "confidence": 0.9488
# }

# Or get raw phishing probability
prob = predict_proba(subject=subject, body=body)
print(f"Phishing probability: {prob:.4f}")
```

### Option B: Direct Pipeline Loading

```python
import pickle
from ml.preprocessing import clean_text_content

# 1. Load the trained pipeline
with open("saved_models/phishing_email_pipeline.pkl", "rb") as f:
    pipeline = pickle.load(f)

# 2. Preprocess input text
_, _, combined_text = clean_text_content(
    subject="URGENT: Verify your bank account immediately!",
    body="Your account has been suspended. Confirm credentials at http://192.168.1.1/login"
)

# 3. Predict class and probability
pred = int(pipeline.predict([combined_text])[0])
prob = float(pipeline.predict_proba([combined_text])[0][1])

result = {
    "prediction": pred,                                   # 1 for Phishing, 0 for Legitimate
    "label": "phishing" if pred == 1 else "legitimate",
    "phishing_probability": round(prob, 4)
}
print(result)
```

---

## 13. Running Reproduction & Test Commands

```bash
# 1. Run inference CLI test
python ml/predict.py

# 2. Preprocess genuine phishing and legitimate dataset
python ml/preprocessing.py

# 3. Train model pipeline and save model artifacts
python ml/train.py

# 4. Evaluate model performance and print reports
python ml/evaluate.py

# 5. Run automated unit and integration tests
python -m pytest ml/test_pipeline.py -v
```

