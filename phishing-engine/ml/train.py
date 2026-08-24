import os
import sys

# Ensure ml package imports resolve properly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.dataset import get_sample_dataset
from ml.model import PhishingModel

def train_and_save_model():
    print("=" * 60)
    print("Training Security/Phishing Engine Machine Learning Model...")
    print("=" * 60)

    df = get_sample_dataset()
    print(f"Loaded dataset with {len(df)} samples ({df['is_phishing'].sum()} phishing, {(df['is_phishing'] == 0).sum()} legitimate).")

    model = PhishingModel()
    metrics = model.train(df)
    print(f"Training Accuracy: {metrics['training_accuracy'] * 100:.2f}%")

    model.save()
    print("Model successfully trained and saved to saved_models/phishing_model.joblib!")
    print("=" * 60)

if __name__ == "__main__":
    train_and_save_model()
