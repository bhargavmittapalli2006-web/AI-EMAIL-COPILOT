# Dataset Directory

## Structure

```
data/
├── raw/
│   ├── enron_spam_data.csv        # Full public raw Enron spam/ham corpus (33,716 samples)
│   └── emails.csv                 # Seed modern corporate/phishing templates
└── processed/
    ├── cleaned_emails.csv         # Cleaned, balanced dataset (2,012 samples: 1,006 phish, 1,006 legit)
    └── test_split.csv             # Held-out 20% test partition (403 samples)
```

## Dataset Specifications

- **Source**: `MWiechmann/enron_spam_data` (Martin Wiechmann Enron Corpus)
- **URL**: `https://raw.githubusercontent.com/MWiechmann/enron_spam_data/master/enron_spam_data.zip`
- **Total Samples**: 2,012
- **Class Balance**: 1,006 Legitimate (0) / 1,006 Phishing (1)
- **Format**: `id,subject,sender,reply_to,body,links,label,classification,email_text`
