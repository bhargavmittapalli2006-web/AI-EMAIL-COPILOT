"""
Comprehensive Unit & Integration Test Suite for ML Phishing Pipeline.
"""

import os
import sys
import json
import tempfile
import pickle
import joblib
import pytest
import pandas as pd
import numpy as np


# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.preprocessing import (
    clean_text_content,
    extract_urls,
    load_genuine_phishing_data,
    load_genuine_legitimate_data,
    build_genuine_phishing_dataset
)
from ml.train import build_pipeline, train_model, load_processed_data
from ml.evaluate import load_model, predict_email, evaluate_final_phishing_model


def test_dataset_loading_and_structure():
    """Tests loading the processed phishing dataset and verifies schema."""
    data_path = os.path.join("data", "processed", "phishing_dataset.csv")
    assert os.path.exists(data_path), f"Processed dataset not found at {data_path}"

    df = load_processed_data(data_path)
    assert len(df) >= 1000
    assert "email_text" in df.columns
    assert "label" in df.columns
    assert set(df["label"].unique()).issubset({0, 1})
    assert df["email_text"].isna().sum() == 0


def test_label_normalization():
    """Tests that all labels in processed dataset are strictly binary 0 or 1."""
    data_path = os.path.join("data", "processed", "phishing_dataset.csv")
    df = pd.read_csv(data_path)

    assert df["label"].isin([0, 1]).all()
    assert (df["label"] == 0).sum() == 1000
    assert (df["label"] == 1).sum() == 1000


def test_missing_subject_handling():
    """Tests email text combination when subject is missing or null."""
    s, b, comb = clean_text_content(None, "This is the body content.")
    assert s == ""
    assert b == "This is the body content."
    assert comb == "This is the body content."

    s_nan, b_nan, comb_nan = clean_text_content("NaN", "Valid message text.")
    assert s_nan == ""
    assert comb_nan == "Valid message text."


def test_missing_body_handling():
    """Tests email text combination when body is missing or null."""
    s, b, comb = clean_text_content("Subject only alert", None)
    assert s == "Subject only alert"
    assert b == ""
    assert comb == "Subject only alert"


def test_empty_email_handling():
    """Tests that whitespace-only and empty strings produce empty combined text."""
    s, b, comb = clean_text_content("   ", "")
    assert comb == ""

    s2, b2, comb2 = clean_text_content(None, None)
    assert comb2 == ""


def test_duplicate_removal():
    """Tests that identical duplicate text rows are eliminated during preprocessing."""
    df = pd.DataFrame({
        "subject": ["Duplicate Test", "Duplicate Test", "Unique Email"],
        "body": ["Same body text", "Same body text", "Different body text"],
        "label": [1, 1, 0]
    })
    df["email_text"] = df["subject"] + " " + df["body"]
    deduped = df.drop_duplicates(subset=["email_text"])
    assert len(deduped) == 2


def test_url_preservation():
    """Tests that URL extraction captures multiple types of links without mutilating text."""
    sample = "Click http://auth-portal.com or https://company.internal/login or www.verify.org"
    links = extract_urls(sample)
    assert len(links) == 3
    assert "http://auth-portal.com" in links
    assert "https://company.internal/login" in links
    assert "www.verify.org" in links


def test_train_test_split_stratification():
    """Verifies that the held-out test split preserves equal class representation and no duplicates."""
    test_path = os.path.join("data", "processed", "test_split.csv")
    assert os.path.exists(test_path)
    test_df = pd.read_csv(test_path)

    assert len(test_df) == 400
    assert (test_df["label"] == 0).sum() == 200
    assert (test_df["label"] == 1).sum() == 200
    assert test_df["email_text"].duplicated().sum() == 0


def test_tfidf_transformation_and_vocabulary():
    """Tests TF-IDF Vectorizer feature generation with unigrams and bigrams."""
    texts = [
        "account password reset request",
        "quarterly team financial review meeting",
        "urgent verification required immediately"
    ]
    pipe = build_pipeline(max_features=50, random_state=42)
    pipe.fit(texts, [1, 0, 1])

    tfidf_step = pipe.named_steps["tfidf"]
    transformed = tfidf_step.transform(texts)
    assert transformed.shape[0] == 3
    assert transformed.shape[1] <= 50


def test_model_training_and_accuracy():
    """Tests that pipeline can train and achieve expected convergence on training data."""
    train_texts = [
        "Hi team, meeting tomorrow at 9 AM for sprint demo.",
        "Weekly status report and project timeline attached.",
        "URGENT: Your bank account is suspended. Click http://scam.xyz to verify now.",
        "Security Alert: Submit your password and PIN at http://192.168.1.1/auth immediately."
    ]
    train_labels = [0, 0, 1, 1]

    pipe = build_pipeline(max_features=100, random_state=42)
    pipe.fit(train_texts, train_labels)

    preds = pipe.predict(train_texts)
    assert np.array_equal(preds, train_labels)


def test_predict_and_predict_proba():
    """Tests predict() and predict_proba() contracts."""
    pipe = build_pipeline(max_features=100, random_state=42)
    pipe.fit(["Clean update", "Urgent phish"], [0, 1])

    test_input = ["Clean update"]
    pred = pipe.predict(test_input)
    prob = pipe.predict_proba(test_input)

    assert pred[0] == 0
    assert len(prob[0]) == 2
    assert 0.0 <= prob[0][0] <= 1.0
    assert 0.0 <= prob[0][1] <= 1.0
    assert np.isclose(prob[0].sum(), 1.0)


def test_saved_model_files_exist_and_loadable():
    """Tests loading from saved_models (.pkl and .joblib) and validates metadata.json."""
    pkl_path = os.path.join("saved_models", "phishing_email_pipeline.pkl")
    joblib_path = os.path.join("saved_models", "phishing_pipeline.joblib")
    meta_path = os.path.join("saved_models", "model_metadata.json")

    assert os.path.exists(pkl_path), f"Missing {pkl_path}"
    assert os.path.exists(joblib_path), f"Missing {joblib_path}"
    assert os.path.exists(meta_path), f"Missing {meta_path}"

    # Load PKL
    with open(pkl_path, "rb") as f:
        model_pkl = pickle.load(f)
    assert hasattr(model_pkl, "predict")
    assert hasattr(model_pkl, "predict_proba")

    # Load Joblib
    model_joblib = joblib.load(joblib_path)
    assert hasattr(model_joblib, "predict")

    # Check metadata fields
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert "model_name" in meta
    assert "dataset_name" in meta
    assert "training_date" in meta
    assert "sample_counts" in meta
    assert "evaluation_metrics" in meta


def test_new_email_inference_scenarios():
    """Tests inference on diverse fictional legitimate and phishing emails."""
    model, _ = load_model()

    test_scenarios = [
        ("Hi team, please find the quarterly performance slides attached.", 0),
        ("Let's schedule a 30-minute sync regarding the API redesign.", 0),
        ("Reminder: Lunch and learn session on Friday at noon.", 0),
        ("URGENT: Your account will be closed in 24 hours. Verify here: http://fake-login.xyz", 1),
        ("Security Notice: Unauthorized access detected. Reset password immediately: http://192.168.1.50/login", 1),
        ("Your PayPal invoice is ready. Download attachment and confirm credentials at http://portal.xyz", 1)
    ]

    for email_text, expected_label in test_scenarios:
        res = predict_email(model, email_text)
        assert res["prediction"] == expected_label, f"Failed for: {email_text} (Expected {expected_label}, got {res['prediction']})"
        if expected_label == 1:
            assert res["phishing_probability"] >= 0.50
        else:
            assert res["phishing_probability"] < 0.50
