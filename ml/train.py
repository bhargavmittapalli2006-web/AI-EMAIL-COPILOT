"""
Model Training Pipeline for True Legitimate vs. Phishing Email Classification.

Trains TF-IDF Vectorizer + Logistic Regression pipeline on genuine phishing & legitimate emails.
Saves model to:
- saved_models/phishing_email_pipeline.pkl
- saved_models/phishing_pipeline.joblib
- saved_models/model_metadata.json
"""

import os
import sys
import argparse
import logging
import datetime
import json
import pickle
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DEFAULT_DATA_PATH = os.path.join("data", "processed", "phishing_dataset.csv")
DEFAULT_TEST_SPLIT_PATH = os.path.join("data", "processed", "test_split.csv")
DEFAULT_MODEL_PKL = os.path.join("saved_models", "phishing_email_pipeline.pkl")
DEFAULT_MODEL_JOBLIB = os.path.join("saved_models", "phishing_pipeline.joblib")
DEFAULT_ENGINE_MODEL_JOBLIB = os.path.join("phishing-engine", "saved_models", "phishing_pipeline.joblib")
DEFAULT_METADATA_JSON = os.path.join("saved_models", "model_metadata.json")


def load_processed_data(file_path: str) -> pd.DataFrame:
    """Loads processed dataset and validates required columns."""
    if not os.path.exists(file_path):
        alt_path = os.path.join("data", "processed", "cleaned_emails.csv")
        if os.path.exists(alt_path):
            file_path = alt_path
        else:
            raise FileNotFoundError(f"Processed dataset not found at: {file_path}")

    logger.info("Loading processed dataset from: %s", file_path)
    df = pd.read_csv(file_path)

    required_cols = {"email_text", "label"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset missing required columns: {required_cols - set(df.columns)}")

    df = df.dropna(subset=["email_text", "label"]).copy()
    df["label"] = df["label"].astype(int)
    return df


def build_pipeline(
    max_features: int = 15000,
    ngram_range: tuple = (1, 2),
    sublinear_tf: bool = True,
    c_regularization: float = 1.0,
    random_state: int = 42
) -> Pipeline:
    """Builds and returns standard TF-IDF + Logistic Regression Pipeline."""
    tfidf = TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        sublinear_tf=sublinear_tf,
        strip_accents="unicode",
        lowercase=True,
        stop_words="english"
    )

    clf = LogisticRegression(
        C=c_regularization,
        penalty="l2",
        class_weight="balanced",
        solver="liblinear",
        max_iter=1000,
        random_state=random_state
    )

    return Pipeline([
        ("tfidf", tfidf),
        ("classifier", clf)
    ])


def train_model(
    data_path: str = DEFAULT_DATA_PATH,
    test_size: float = 0.20,
    random_state: int = 42,
    output_pkl: str = DEFAULT_MODEL_PKL,
    output_joblib: str = DEFAULT_MODEL_JOBLIB,
    output_metadata: str = DEFAULT_METADATA_JSON,
    test_split_path: str = DEFAULT_TEST_SPLIT_PATH
):
    """Executes stratified split, trains pipeline, evaluates preliminary metrics, and serializes artifacts."""
    df = load_processed_data(data_path)

    total_samples = len(df)
    phishing_count = int((df["label"] == 1).sum())
    legit_count = int((df["label"] == 0).sum())

    logger.info("Dataset statistics: Total=%d | Legitimate=%d | Phishing=%d", total_samples, legit_count, phishing_count)

    # Stratified Train/Test split
    train_df, test_df = train_test_split(
        df,
        test_size=test_size,
        stratify=df["label"],
        random_state=random_state
    )

    train_df = train_df.reset_index(drop=True)
    test_df = test_df.reset_index(drop=True)

    # Verify no data leakage / overlapping texts between train and test
    overlap = set(train_df["email_text"]).intersection(set(test_df["email_text"]))
    if overlap:
        logger.warning("Found %d overlapping text samples between train and test. Removing from test.", len(overlap))
        test_df = test_df[~test_df["email_text"].isin(overlap)].reset_index(drop=True)

    logger.info(
        "Train set: %d samples (%d legit, %d phish) | Test set: %d samples (%d legit, %d phish)",
        len(train_df),
        int((train_df["label"] == 0).sum()),
        int((train_df["label"] == 1).sum()),
        len(test_df),
        int((test_df["label"] == 0).sum()),
        int((test_df["label"] == 1).sum())
    )

    X_train = train_df["email_text"].values
    y_train = train_df["label"].values

    X_test = test_df["email_text"].values
    y_test = test_df["label"].values

    logger.info("Building TF-IDF + Logistic Regression Pipeline...")
    pipeline = build_pipeline(random_state=random_state)

    logger.info("Fitting pipeline on training data (%d samples)...", len(X_train))
    pipeline.fit(X_train, y_train)

    train_preds = pipeline.predict(X_train)
    train_acc = accuracy_score(y_train, train_preds)
    logger.info("Training complete. Training Accuracy: %.4f (%.2f%%)", train_acc, train_acc * 100)

    # Evaluate on held-out test data
    test_preds = pipeline.predict(X_test)
    test_probs = pipeline.predict_proba(X_test)[:, 1]

    eval_acc = float(accuracy_score(y_test, test_preds))
    eval_prec = float(precision_score(y_test, test_preds, pos_label=1))
    eval_rec = float(recall_score(y_test, test_preds, pos_label=1))
    eval_f1 = float(f1_score(y_test, test_preds, pos_label=1))
    eval_roc_auc = float(roc_auc_score(y_test, test_probs))

    # Save Pickle format
    os.makedirs(os.path.dirname(os.path.abspath(output_pkl)), exist_ok=True)
    with open(output_pkl, "wb") as f:
        pickle.dump(pipeline, f)
    logger.info("Model saved (Pickle) to: %s", output_pkl)

    # Save Joblib format
    joblib.dump(pipeline, output_joblib)
    logger.info("Model saved (Joblib) to: %s", output_joblib)

    # Mirror to phishing-engine if directory exists
    if os.path.exists("phishing-engine/saved_models"):
        joblib.dump(pipeline, DEFAULT_ENGINE_MODEL_JOBLIB)
        logger.info("Model mirrored to: %s", DEFAULT_ENGINE_MODEL_JOBLIB)

    # Save Test Split
    os.makedirs(os.path.dirname(os.path.abspath(test_split_path)), exist_ok=True)
    test_df.to_csv(test_split_path, index=False)
    logger.info("Held-out test split saved to: %s", test_split_path)

    # Save Metadata JSON
    metadata = {
        "model_name": "Phishing Email Detection Pipeline",
        "model_version": "2.0.0-genuine-phishing",
        "dataset_name": "True Legitimate vs. Phishing Dataset (Nazario Phishing + Enron Ham)",
        "dataset_source": "Jose Nazario Phishing Corpus & Enron Corporate Email Corpus",
        "source_urls": [
            "https://raw.githubusercontent.com/Bilal-73/Phishing-and-Spam-Detection/main/data/Nazario.csv",
            "https://raw.githubusercontent.com/MWiechmann/enron_spam_data/master/enron_spam_data.zip"
        ],
        "training_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "random_seed": random_state,
        "sample_counts": {
            "total": total_samples,
            "training_samples": len(train_df),
            "test_samples": len(test_df),
            "train_legitimate": int((train_df["label"] == 0).sum()),
            "train_phishing": int((train_df["label"] == 1).sum()),
            "test_legitimate": int((test_df["label"] == 0).sum()),
            "test_phishing": int((test_df["label"] == 1).sum())
        },
        "class_distribution": {
            "0": "legitimate (Enron corporate ham)",
            "1": "phishing (Jose Nazario genuine attack corpus)"
        },
        "tfidf_configuration": {
            "max_features": 15000,
            "ngram_range": [1, 2],
            "sublinear_tf": True,
            "strip_accents": "unicode",
            "lowercase": True,
            "stop_words": "english"
        },
        "logistic_regression_configuration": {
            "penalty": "l2",
            "C": 1.0,
            "class_weight": "balanced",
            "solver": "liblinear",
            "max_iter": 1000,
            "random_state": random_state
        },
        "evaluation_metrics": {
            "accuracy": round(eval_acc, 4),
            "precision": round(eval_prec, 4),
            "recall": round(eval_rec, 4),
            "f1_score": round(eval_f1, 4),
            "roc_auc": round(eval_roc_auc, 4)
        },
        "data_leakage_checks": {
            "stratified_split": True,
            "train_test_overlap_count": len(overlap),
            "vectorizer_fitted_only_on_train": True,
            "test_data_strictly_held_out": True
        }
    }

    with open(output_metadata, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Metadata saved to: %s", output_metadata)

    print("\n" + "=" * 65)
    print("             TRAINING COMPLETED SUCCESSFULLY")
    print("=" * 65)
    print(f" Model (Pickle)       : {output_pkl}")
    print(f" Model (Joblib)       : {output_joblib}")
    print(f" Metadata             : {output_metadata}")
    print(f" Training Samples     : {len(train_df):,} ({int((train_df['label'] == 0).sum())} Legit / {int((train_df['label'] == 1).sum())} Phish)")
    print(f" Test Set Samples     : {len(test_df):,} (Saved to {test_split_path})")
    print(f" Training Accuracy    : {train_acc*100:.2f}%")
    print(f" Test Set Accuracy    : {eval_acc*100:.2f}%")
    print(f" Test Set Precision   : {eval_prec*100:.2f}%")
    print(f" Test Set Recall      : {eval_rec*100:.2f}%")
    print(f" Test Set F1 Score    : {eval_f1*100:.2f}%")
    print(f" Test Set ROC-AUC     : {eval_roc_auc*100:.2f}%")
    print("=" * 65 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Train True Legitimate vs. Phishing model.")
    parser.add_argument("--data", type=str, default=DEFAULT_DATA_PATH, help="Path to processed dataset CSV")
    parser.add_argument("--test-size", type=float, default=0.20, help="Test split ratio (default: 0.20)")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed (default: 42)")
    parser.add_argument("--output-pkl", type=str, default=DEFAULT_MODEL_PKL, help="Output path for .pkl model")
    parser.add_argument("--output-joblib", type=str, default=DEFAULT_MODEL_JOBLIB, help="Output path for .joblib model")
    parser.add_argument("--output-metadata", type=str, default=DEFAULT_METADATA_JSON, help="Output path for metadata JSON")

    args = parser.parse_args()

    train_model(
        data_path=args.data,
        test_size=args.test_size,
        random_state=args.random_state,
        output_pkl=args.output_pkl,
        output_joblib=args.output_joblib,
        output_metadata=args.output_metadata
    )


if __name__ == "__main__":
    main()
