"""
Data Preprocessing Pipeline for Legitimate vs. Phishing Email Classification.

Combines genuine phishing email attacks (Jose Nazario Phishing Corpus) with
genuine legitimate corporate communication (Enron Ham Corpus).

Dataset Labels:
- 0 = Legitimate (Clean corporate communication, routine business, memos, updates)
- 1 = Phishing (Credential harvesting, bank suspension, brand spoofing, fake updates)
"""

import os
import sys
import argparse
import logging
import re
import json
import pandas as pd
from typing import Optional, Tuple, Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DEFAULT_NAZARIO_PATH = os.path.join("data", "raw", "nazario_phishing_corpus.csv")
DEFAULT_ENRON_PATH = os.path.join("data", "raw", "enron_spam_data.csv")
DEFAULT_OUTPUT_PATH = os.path.join("data", "processed", "phishing_dataset.csv")
DEFAULT_CLEANED_EMAILS_PATH = os.path.join("data", "processed", "cleaned_emails.csv")


def extract_urls(text: str) -> List[str]:
    """Extracts all HTTP/HTTPS and www URLs from email text while preserving them."""
    if not text or not isinstance(text, str):
        return []
    url_pattern = r'(?:https?://|www\.)[^\s<>"\']+'
    return re.findall(url_pattern, text)


def clean_text_content(subject: Any, body: Any) -> Tuple[str, str, str]:
    """
    Cleans subject and body strings, formats whitespace, and builds email_text.
    Preserves all security-relevant tokens, URLs, punctuation, and uppercase signals.
    """
    subj = str(subject).strip() if pd.notna(subject) else ""
    bdy = str(body).strip() if pd.notna(body) else ""

    if subj.lower() in ["nan", "null", "none"]:
        subj = ""
    if bdy.lower() in ["nan", "null", "none"]:
        bdy = ""

    subj_clean = " ".join(subj.split())
    bdy_clean = "\n".join([line.strip() for line in bdy.splitlines() if line.strip()])

    if subj_clean and bdy_clean:
        combined = f"{subj_clean} {bdy_clean}"
    elif bdy_clean:
        combined = bdy_clean
    else:
        combined = subj_clean

    return subj_clean, bdy_clean, combined


def load_genuine_phishing_data(
    nazario_path: str = DEFAULT_NAZARIO_PATH,
    max_samples: int = 1000,
    random_state: int = 42
) -> pd.DataFrame:
    """Loads and preprocesses genuine phishing emails from Jose Nazario Phishing Corpus."""
    if not os.path.exists(nazario_path):
        raise FileNotFoundError(f"Nazario phishing dataset not found at: {nazario_path}")

    logger.info("Loading Nazario Phishing Corpus from: %s", nazario_path)
    df = pd.read_csv(nazario_path)

    subjects, bodies, senders, links_list, email_texts = [], [], [], [], []

    for _, row in df.iterrows():
        subj_raw = row.get("subject", "")
        bdy_raw = row.get("body", "")
        sender_raw = str(row.get("sender", "security-alert@account-verification-notice.xyz")).strip()

        subj_c, bdy_c, combined = clean_text_content(subj_raw, bdy_raw)
        if len(combined) < 20:
            continue

        extracted_links = extract_urls(combined)

        subjects.append(subj_c)
        bodies.append(bdy_c)
        senders.append(sender_raw if sender_raw and sender_raw.lower() != "nan" else "security-alert@verification.xyz")
        links_list.append(json.dumps(extracted_links))
        email_texts.append(combined)

    phish_df = pd.DataFrame({
        "subject": subjects,
        "sender": senders,
        "reply_to": senders,
        "body": bodies,
        "links": links_list,
        "label": 1,
        "classification": "phishing",
        "email_text": email_texts
    }).drop_duplicates(subset=["email_text"]).reset_index(drop=True)

    logger.info("Loaded %d unique genuine phishing emails from Nazario corpus.", len(phish_df))
    if max_samples and max_samples < len(phish_df):
        phish_df = phish_df.sample(n=max_samples, random_state=random_state).reset_index(drop=True)
    return phish_df


def load_genuine_legitimate_data(
    enron_path: str = DEFAULT_ENRON_PATH,
    max_samples: int = 1000,
    random_state: int = 42
) -> pd.DataFrame:
    """Loads and preprocesses genuine legitimate corporate emails from Enron Ham subset."""
    if not os.path.exists(enron_path):
        raise FileNotFoundError(f"Enron dataset not found at: {enron_path}")

    logger.info("Loading Enron Legitimate Ham Corpus from: %s", enron_path)
    df = pd.read_csv(enron_path)

    # Filter strictly ham records
    ham_df = df[df["Spam/Ham"].astype(str).str.lower() == "ham"].copy()

    subjects, bodies, senders, links_list, email_texts = [], [], [], [], []

    for _, row in ham_df.iterrows():
        subj_raw = row.get("Subject", "")
        bdy_raw = row.get("Message", "")

        subj_c, bdy_c, combined = clean_text_content(subj_raw, bdy_raw)
        if len(combined) < 20:
            continue

        extracted_links = extract_urls(combined)

        subjects.append(subj_c)
        bodies.append(bdy_c)
        senders.append("communications@company.com")
        links_list.append(json.dumps(extracted_links))
        email_texts.append(combined)

    legit_df = pd.DataFrame({
        "subject": subjects,
        "sender": senders,
        "reply_to": senders,
        "body": bodies,
        "links": links_list,
        "label": 0,
        "classification": "legitimate",
        "email_text": email_texts
    }).drop_duplicates(subset=["email_text"]).reset_index(drop=True)

    logger.info("Loaded %d unique genuine legitimate emails from Enron Ham corpus.", len(legit_df))
    if max_samples and max_samples < len(legit_df):
        legit_df = legit_df.sample(n=max_samples, random_state=random_state).reset_index(drop=True)
    return legit_df


def build_genuine_phishing_dataset(
    nazario_path: str = DEFAULT_NAZARIO_PATH,
    enron_path: str = DEFAULT_ENRON_PATH,
    samples_per_class: int = 1000,
    random_state: int = 42
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Combines genuine phishing emails with genuine legitimate corporate emails."""
    phish_df = load_genuine_phishing_data(nazario_path, max_samples=samples_per_class, random_state=random_state)
    legit_df = load_genuine_legitimate_data(enron_path, max_samples=samples_per_class, random_state=random_state)

    combined = pd.concat([phish_df, legit_df], ignore_index=True)
    # Shuffle
    combined = combined.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    combined["id"] = [f"email-{i+1}" for i in range(len(combined))]

    col_order = ["id", "subject", "sender", "reply_to", "body", "links", "label", "classification", "email_text"]
    combined = combined[col_order]

    report = {
        "dataset_name": "True Legitimate vs. Phishing Dataset (Nazario + Enron Ham)",
        "phishing_source": "Jose Nazario Phishing Corpus (Nazario.csv)",
        "legitimate_source": "Enron Corporate Email Corpus (Ham subset)",
        "total_samples": len(combined),
        "phishing_count": int((combined["label"] == 1).sum()),
        "legitimate_count": int((combined["label"] == 0).sum()),
        "columns": list(combined.columns),
        "label_mapping": "0 = legitimate, 1 = phishing"
    }

    return combined, report


def print_data_report(report: Dict[str, Any]):
    """Prints formatted summary report."""
    print("\n" + "=" * 65)
    print("        GENUINE PHISHING VS. LEGITIMATE DATASET REPORT")
    print("=" * 65)
    print(f" Dataset Name      : {report['dataset_name']}")
    print(f" Phishing Source   : {report['phishing_source']}")
    print(f" Legitimate Source : {report['legitimate_source']}")
    print(f" Total Samples     : {report['total_samples']:,}")
    print(f" Phishing (1)      : {report['phishing_count']:,} ({report['phishing_count']/report['total_samples']*100:.1f}%)")
    print(f" Legitimate (0)    : {report['legitimate_count']:,} ({report['legitimate_count']/report['total_samples']*100:.1f}%)")
    print(f" Columns           : {report['columns']}")
    print("=" * 65 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Build Genuine Legitimate vs Phishing dataset.")
    parser.add_argument("--nazario", type=str, default=DEFAULT_NAZARIO_PATH, help="Path to Nazario phishing corpus CSV")
    parser.add_argument("--enron", type=str, default=DEFAULT_ENRON_PATH, help="Path to Enron CSV dataset")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT_PATH, help="Path to save output dataset")
    parser.add_argument("--samples-per-class", type=int, default=1000, help="Samples per class (default: 1000)")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed (default: 42)")

    args = parser.parse_args()

    dataset_df, report = build_genuine_phishing_dataset(
        nazario_path=args.nazario,
        enron_path=args.enron,
        samples_per_class=args.samples_per_class,
        random_state=args.random_state
    )

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    dataset_df.to_csv(args.output, index=False)
    # Also mirror to cleaned_emails.csv
    dataset_df.to_csv(DEFAULT_CLEANED_EMAILS_PATH, index=False)
    logger.info("Saved dataset to: %s and %s", args.output, DEFAULT_CLEANED_EMAILS_PATH)

    print_data_report(report)


if __name__ == "__main__":
    main()
