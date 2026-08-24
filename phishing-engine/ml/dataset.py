import pandas as pd

SAMPLE_EMAILS = [
    # Phishing Emails
    {
        "subject": "URGENT: Your Account Has Been Suspended!",
        "sender": "security-alert@bank-verification-secure.com",
        "reply_to": "hacker88@gmail.com",
        "body": "Dear customer, your bank account has been suspended due to suspicious activity. Click here immediately to verify your identity: http://192.168.1.1/login.php or your account will be permanently closed within 24 hours.",
        "links": ["http://192.168.1.1/login.php", "http://bit.ly/3xY9z0a"],
        "is_phishing": 1
    },
    {
        "subject": "Password Expiration Notice - Immediate Action Required",
        "sender": "IT-Support@company-update-portal.xyz",
        "reply_to": "IT-Support@company-update-portal.xyz",
        "body": "Your corporate email password will expire in 2 hours. Update your password now to avoid losing access to your emails. Visit http://company-login.top/reset.",
        "links": ["http://company-login.top/reset"],
        "is_phishing": 1
    },
    {
        "subject": "Invoice #98412 Overdue - Legal Action Pending",
        "sender": "billing@accounts-dept-online.info",
        "reply_to": "billing@accounts-dept-online.info",
        "body": "Please find attached your overdue invoice #98412. Failure to settle the payment of $4,500 immediately will result in legal escalation. Click to review: http://bit.ly/invoice-pay",
        "links": ["http://bit.ly/invoice-pay"],
        "is_phishing": 1
    },
    {
        "subject": "Congratulations! You won a $1,000 Amazon Gift Card!",
        "sender": "rewards@free-rewards-claim.site",
        "reply_to": "rewards@free-rewards-claim.site",
        "body": "You have been selected as today's lucky winner! Claim your $1000 Amazon gift card immediately before the link expires. Click http://claim-reward.site/win",
        "links": ["http://claim-reward.site/win"],
        "is_phishing": 1
    },
    {
        "subject": "Security Alert: New Sign-in from Unknown Device",
        "sender": "no-reply@account-google-security.net",
        "reply_to": "no-reply@account-google-security.net",
        "body": "Someone just logged into your Google account from Russia. If this was not you, secure your account instantly: http://5.101.0.12/secure-google",
        "links": ["http://5.101.0.12/secure-google"],
        "is_phishing": 1
    },
    {
        "subject": "Wire Transfer Request - Urgent Confidential",
        "sender": "ceo-office@exec-direct-mail.tech",
        "reply_to": "private-exec@yahoo.com",
        "body": "Hi, I need you to initiate an urgent wire transfer of $25,000 to our new supplier. Keep this confidential. Send confirmation once done.",
        "links": [],
        "is_phishing": 1
    },
    {
        "subject": "Tax Refund Approved - Claim Your Money Now",
        "sender": "refunds@irs-gov-tax-portal.online",
        "reply_to": "refunds@irs-gov-tax-portal.online",
        "body": "You are eligible for a tax refund of $1,240.00. Submit your SSN and card details here to receive funds: http://irs-tax-refund.online/claim",
        "links": ["http://irs-tax-refund.online/claim"],
        "is_phishing": 1
    },
    {
        "subject": "Payroll Update: Direct Deposit Failure",
        "sender": "hr-payroll@corporate-hr-service.space",
        "reply_to": "hr-payroll@corporate-hr-service.space",
        "body": "Your salary deposit failed this month due to invalid bank details. Re-enter your banking credentials immediately: http://tinyurl.com/pay-update",
        "links": ["http://tinyurl.com/pay-update"],
        "is_phishing": 1
    },

    # Legitimate Emails
    {
        "subject": "Sprint Planning Meeting Agenda - Q3",
        "sender": "sarah.jenkins@company.com",
        "reply_to": "sarah.jenkins@company.com",
        "body": "Hi Team, please find attached the agenda for our upcoming Q3 sprint planning meeting scheduled for tomorrow at 10:00 AM. Let me know if you have any items to add.",
        "links": ["https://company.atlassian.net/jira/dashboards"],
        "is_phishing": 0
    },
    {
        "subject": "[GitHub] Pull Request #42 Reviewed",
        "sender": "notifications@github.com",
        "reply_to": "noreply@github.com",
        "body": "Alex left a review on pull request #42: 'Looks great! Approved after addressing minor nitpicks.' View the PR on GitHub.",
        "links": ["https://github.com/org/repo/pull/42"],
        "is_phishing": 0
    },
    {
        "subject": "Weekly Tech Newsletter #142",
        "sender": "editor@technewsletter.io",
        "reply_to": "editor@technewsletter.io",
        "body": "Here is this week's breakdown of top AI engineering trends, open-source releases, and frontend design tools. Happy reading!",
        "links": ["https://technewsletter.io/issues/142", "https://technewsletter.io/unsubscribe"],
        "is_phishing": 0
    },
    {
        "subject": "Your Amazon Order #114-8921-9982 Has Shipped",
        "sender": "shipment-tracking@amazon.com",
        "reply_to": "shipment-tracking@amazon.com",
        "body": "Your item 'Wireless Noise Canceling Headphones' has shipped and will arrive by Thursday. Track your package using the link below.",
        "links": ["https://www.amazon.com/gp/your-account/order-history"],
        "is_phishing": 0
    },
    {
        "subject": "Quarterly All-Hands Slides and Recording",
        "sender": "internal-communications@company.com",
        "reply_to": "internal-communications@company.com",
        "body": "Thank you everyone for attending today's all-hands meeting. The recording and slide deck are now available on Google Drive.",
        "links": ["https://drive.google.com/file/d/1a2b3c4d5e/view"],
        "is_phishing": 0
    },
    {
        "subject": "Design Review Feedback for Landing Page",
        "sender": "marcus.vance@company.com",
        "reply_to": "marcus.vance@company.com",
        "body": "Hey team, I reviewed the Figma mockups for the new landing page. The hero section looks great! Just added a few comments regarding mobile responsiveness.",
        "links": ["https://figma.com/file/xyz123/Landing-Page"],
        "is_phishing": 0
    },
    {
        "subject": "Receipt for your recent purchase at Coffee Roasters",
        "sender": "receipts@square.com",
        "reply_to": "receipts@square.com",
        "body": "Thank you for your purchase of $4.50 at Artisan Coffee Roasters on Aug 24, 2026. View your digital receipt online.",
        "links": ["https://squareup.com/receipts/r12345"],
        "is_phishing": 0
    },
    {
        "subject": "Project Status Update & Milestones",
        "sender": "david.chen@company.com",
        "reply_to": "david.chen@company.com",
        "body": "Hi all, Phase 1 of our AI Email Copilot setup is complete. We are on schedule to begin Phase 2 model integration this week.",
        "links": [],
        "is_phishing": 0
    }
]

import os

def get_sample_dataset() -> pd.DataFrame:
    """Returns a pandas DataFrame containing email data for training/evaluation."""
    candidate_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "cleaned_emails.csv")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "processed", "cleaned_emails.csv")),
        os.path.join("data", "processed", "cleaned_emails.csv"),
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            try:
                df = pd.read_csv(p)
                if "body" in df.columns and "subject" in df.columns:
                    if "is_phishing" not in df.columns and "label" in df.columns:
                        df["is_phishing"] = df["label"]
                    return df
            except Exception:
                pass
    return pd.DataFrame(SAMPLE_EMAILS)

