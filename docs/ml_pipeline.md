# ML Pipeline & Dataset Upgrade Documentation

## 1. Dataset Overview & Source

- **Dataset Name**: Enron Spam & Legitimate Email Corpus
- **Primary Source**: `MWiechmann/enron_spam_data` (Martin Wiechmann Enron Corpus)
- **Source URL**: `https://raw.githubusercontent.com/MWiechmann/enron_spam_data/master/enron_spam_data.zip`
- **Original Size**: 33,716 raw emails (17,171 spam/phishing, 16,545 legitimate ham)
- **License / Usage**: Open Academic Research & Public Benchmark
- **Target Cleaned Sample Count**: **2,012 samples** (1,006 legitimate, 1,006 phishing)
- **Label Mapping**:
  - `0` / `legitimate` = Legitimate email (Enron corporate ham + seed templates)
  - `1` / `phishing` = Phishing / Spam email

---

## 2. Standardized Dataset Schema

The processed dataset is saved at `data/processed/cleaned_emails.csv` with the following columns:

| Column | Type | Description |
|---|---|---|
| `id` | `str` | Unique sample identifier (`email-1`, `email-2`, ...) |
| `subject` | `str` | Cleaned subject line |
| `sender` | `str` | Sender email address |
| `reply_to` | `str` | Reply-To header address |
| `body` | `str` | Full cleaned email body text |
| `links` | `str` (JSON) | Extracted list of URLs |
| `label` | `int` | Binary class label (`0` = legitimate, `1` = phishing) |
| `classification` | `str` | Text class label (`legitimate` or `phishing`) |
| `email_text` | `str` | Clean concatenation of subject and body for TF-IDF vectorization |

---

## 3. Data Cleaning & Quality Report

```text
============================================================
                 DATA QUALITY REPORT
============================================================
 Dataset source             : Enron Spam & Legitimate Email Corpus (MWiechmann/enron_spam_data)
 Total raw samples          : 33,716
 Total cleaned samples      : 2,012
 Phishing                   : 1,006 (50.0%)
 Legitimate                 : 1,006 (50.0%)
 Duplicates removed         : 3,199
 Invalid records removed    : 0
 Missing/empty records      : 28
============================================================
```

### Preprocessing Steps:
1. Multi-encoding fallback loader (`utf-8`, `utf-8-sig`, `latin1`, `cp1252`, `iso-8859-1`).
2. Label normalization across 20+ synonyms.
3. Whitespace normalization while preserving structural line breaks.
4. Regex URL extraction into structured JSON arrays.
5. Minimum length filtering (< 15 characters dropped).
6. Exact and near-duplicate removal across `email_text`.
7. Stratified balanced sampling (50% legitimate, 50% phishing).

---

## 4. Train / Test Split & Data Leakage Prevention

- **Split Ratio**: Stratified 80% Train / 20% Test with fixed seed `random_state=42`.
- **Training Set**: 1,609 samples (804 legitimate, 805 phishing)
- **Test Set**: 403 samples (202 legitimate, 201 phishing)
- **Leakage Prevention**: Deduplication is performed prior to splitting. The test split is held out in `data/processed/test_split.csv` and never accessed during vectorizer fitting or model training.

---

## 5. Model Architecture & Pipeline

- **Feature Extraction**: `TfidfVectorizer`
  - `max_features`: 15,000
  - `ngram_range`: (1, 2) (unigrams and bigrams)
  - `sublinear_tf`: True (applies sublinear logarithmic term frequency scaling)
  - `strip_accents`: "unicode"
  - `stop_words`: "english"
  - `lowercase`: True
- **Classifier**: `LogisticRegression`
  - `C`: 1.0 (L2 Regularization)
  - `class_weight`: "balanced"
  - `solver`: "liblinear"
  - `max_iter`: 1,000
  - `random_state`: 42

---

## 6. Performance Evaluation & Old vs. New Comparison

Evaluated on unseen test set (403 samples):

```text
=================================================================
            OLD MODEL VS. UPGRADED MODEL COMPARISON
=================================================================
 Metric             | Old Model (12 samples) | New Model (2,000 samples)
-----------------------------------------------------------------
 Accuracy           | 71.96%                 | 96.28%
 Precision (Phish)  | 68.97%                 | 93.46%
 Recall (Phish)     | 79.60%                 | 99.50%
 F1 Score           | 73.90%                 | 96.39%
=================================================================
```

### Confusion Matrix (Test Set):
- **True Negatives (Legitimate correctly identified)**: 188
- **False Positives (Legitimate flagged as Phishing)**: 14
- **False Negatives (Phishing missed)**: **1** (0.5% miss rate)
- **True Positives (Phishing correctly caught)**: **200** (99.5% catch rate)

---

## 7. Model Serialization & Verification

- **Production Artifact**: `saved_models/phishing_pipeline.joblib`
- **Engine Mirror**: `phishing-engine/saved_models/phishing_pipeline.joblib`
- **Backup of Old Model**: `saved_models/phishing_pipeline_old_baseline.joblib`

---

## 8. Reproduction Commands

```bash
# 1. Preprocess raw dataset
python ml/preprocessing.py --input data/raw/enron_spam_data.csv --output data/processed/cleaned_emails.csv --samples 2000

# 2. Train model pipeline
python ml/train.py

# 3. Evaluate performance
python ml/evaluate.py

# 4. Run full backend test suite
python -m pytest phishing-engine/tests -v
```
