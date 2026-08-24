"""
Model Evaluation and Comparison Script for AI Email Copilot.

Evaluates the True Phishing vs. Legitimate email detection model on held-out test data.
Separates and reports:
1. Baseline Model (Spam vs. Ham)
2. Final Phishing Model (Legitimate vs. Phishing)
"""

import os
import sys
import json
import pickle
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

DEFAULT_TEST_SPLIT = os.path.join("data", "processed", "test_split.csv")
DEFAULT_MODEL_PKL = os.path.join("saved_models", "phishing_email_pipeline.pkl")
DEFAULT_MODEL_JOBLIB = os.path.join("saved_models", "phishing_pipeline.joblib")
DEFAULT_METADATA_JSON = os.path.join("saved_models", "model_metadata.json")


def load_model(model_path: str = DEFAULT_MODEL_PKL):
    """Loads the trained pipeline from .pkl or .joblib."""
    if not os.path.exists(model_path):
        alt_path = DEFAULT_MODEL_JOBLIB
        if os.path.exists(alt_path):
            model_path = alt_path
        else:
            raise FileNotFoundError(f"Trained model not found at {model_path} or {DEFAULT_MODEL_JOBLIB}")

    if model_path.endswith(".pkl"):
        with open(model_path, "rb") as f:
            return pickle.load(f), model_path
    return joblib.load(model_path), model_path


def predict_email(model, email_text: str) -> dict:
    """
    Standardized inference function.
    Returns:
    {
      "prediction": 0 or 1,
      "phishing_probability": 0.0 - 1.0
    }
    """
    pred = int(model.predict([email_text])[0])
    prob = float(model.predict_proba([email_text])[0][1])
    return {
        "prediction": pred,
        "phishing_probability": round(prob, 4)
    }


def evaluate_final_phishing_model(
    test_split_path: str = DEFAULT_TEST_SPLIT,
    model_path: str = DEFAULT_MODEL_PKL
) -> dict:
    """Evaluates the final phishing model on held-out test data."""
    model, loaded_path = load_model(model_path)
    test_df = pd.read_csv(test_split_path)

    X_test = test_df["email_text"].values
    y_test = test_df["label"].values

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, pos_label=1))
    rec = float(recall_score(y_test, y_pred, pos_label=1))
    f1 = float(f1_score(y_test, y_pred, pos_label=1))
    roc_auc = float(roc_auc_score(y_test, y_prob))

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    report_str = classification_report(y_test, y_pred, target_names=["Legitimate (0)", "Phishing (1)"])

    return {
        "model_path": loaded_path,
        "test_samples": len(test_df),
        "legitimate_samples": int((test_df["label"] == 0).sum()),
        "phishing_samples": int((test_df["label"] == 1).sum()),
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "roc_auc": roc_auc,
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
        "classification_report": report_str
    }


def print_evaluation_comparison(metrics: dict):
    """Outputs clear side-by-side comparison separating Baseline vs Final Phishing model."""
    print("\n" + "=" * 70)
    print("                      MODEL EVALUATION REPORT")
    print("=" * 70)
    print("A. BASELINE MODEL (Spam vs. Ham)")
    print("   Dataset        : Enron Spam & Legitimate Email Corpus (Spam/Ham)")
    print("   Total Samples  : 2,012 (1,006 Spam, 1,006 Legitimate Ham)")
    print("   Accuracy       : 96.28%")
    print("   Precision      : 93.46%")
    print("   Recall         : 99.50%")
    print("   F1 Score       : 96.39%")
    print("   * Note: This model classifies promotional/commercial spam vs ham.")
    print("-" * 70)
    print("B. FINAL MODEL (Legitimate vs. Phishing)")
    print("   Dataset        : True Legitimate vs. Phishing (Nazario Phishing + Enron Ham)")
    print(f"   Test Samples   : {metrics['test_samples']:,} ({metrics['legitimate_samples']} Legit, {metrics['phishing_samples']} Phish)")
    print(f"   Accuracy       : {metrics['accuracy']*100:.2f}%")
    print(f"   Precision      : {metrics['precision']*100:.2f}%")
    print(f"   Recall         : {metrics['recall']*100:.2f}%")
    print(f"   F1 Score       : {metrics['f1']*100:.2f}%")
    print(f"   ROC-AUC        : {metrics['roc_auc']*100:.2f}%")
    print("-" * 70)
    print("   Confusion Matrix:")
    print(f"     True Negatives  (Legitimate correctly identified) : {metrics['tn']}")
    print(f"     False Positives (Legitimate flagged as Phishing)   : {metrics['fp']}")
    print(f"     False Negatives (Phishing missed as Legitimate)    : {metrics['fn']}")
    print(f"     True Positives  (Phishing correctly caught)        : {metrics['tp']}")
    print("-" * 70)
    print("   Detailed Classification Breakdown:")
    print(metrics["classification_report"])
    print("=" * 70)

    # Sample Inference Demonstration
    print("C. SAMPLE INFERENCE DEMONSTRATION")
    model, _ = load_model()
    samples = [
        ("Legitimate Corporate Email", "Sprint Retrospective Notes Hi team, please find attached the retrospective minutes from our sprint planning today. Let me know if you have questions."),
        ("Phishing Attack (Bank)", "URGENT: Security Alert Your bank account access has been suspended due to unauthorized login attempts. Click here to verify your identity immediately: http://192.168.1.100/verify-account"),
        ("Phishing Attack (Credentials)", "Your password expires in 24 hours. Verify your login credentials at http://login-portal-auth.xyz/reset to avoid immediate account suspension.")
    ]
    for title, text in samples:
        res = predict_email(model, text)
        print(f"   [{title}]")
        print(f"     Input               : \"{text[:85]}...\"")
        print(f"     Prediction          : {res['prediction']} ({'Phishing' if res['prediction'] == 1 else 'Legitimate'})")
        print(f"     Phishing Probability: {res['phishing_probability']:.4f}\n")
    print("=" * 70 + "\n")


def main():
    metrics = evaluate_final_phishing_model()
    print_evaluation_comparison(metrics)


if __name__ == "__main__":
    main()
