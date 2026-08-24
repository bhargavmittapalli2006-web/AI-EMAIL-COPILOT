import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardSecurityMetrics } from './components/security/DashboardSecurityMetrics';
import { EmailList } from './components/email/EmailList';
import { EmailDetail } from './components/email/EmailDetail';
import { DEMO_EMAILS } from './data/demoEmails';
import { EmailItem } from './types/email';
import { PhishingAnalysisResponse, SecurityMetricsSummary } from './types/phishing';
import { EmailIntelligence } from './types/intelligence';
import { checkBackendHealth, analyzeEmail } from './services/phishingService';

export const App: React.FC = () => {
  const [emails, setEmails] = useState<EmailItem[]>(DEMO_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(DEMO_EMAILS[0].id);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isScanningAll, setIsScanningAll] = useState<boolean>(false);

  // Check live backend connectivity on mount and periodically
  useEffect(() => {
    const probeBackend = async () => {
      const health = await checkBackendHealth();
      setIsBackendOnline(health.isOnline);
      // If backend is offline on first mount, auto-enable demo mode so user has immediate working experience
      if (!health.isOnline) {
        setIsDemoMode(true);
      }
    };

    probeBackend();
    const interval = setInterval(probeBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null;

  // Handle email security analysis update
  const handleUpdateEmailAnalysis = (emailId: string, analysis: PhishingAnalysisResponse) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, analysis, isRead: true } : e))
    );
  };

  // Handle email AI intelligence update
  const handleUpdateEmailIntelligence = (emailId: string, intelligence: EmailIntelligence) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, intelligence } : e))
    );
  };

  // Toggle email star status
  const handleToggleStar = (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails((prev) =>
      prev.map((item) => (item.id === emailId ? { ...item, isStarred: !item.isStarred } : item))
    );
  };

  // Batch scan all emails in the inbox
  const handleScanAll = async () => {
    setIsScanningAll(true);
    try {
      const updatedEmails = await Promise.all(
        emails.map(async (email) => {
          try {
            const result = await analyzeEmail(
              {
                subject: email.subject,
                sender: email.sender,
                body: email.body,
                reply_to: email.reply_to || '',
                links: email.links || [],
              },
              isDemoMode
            );
            return { ...email, analysis: result };
          } catch {
            return email;
          }
        })
      );
      setEmails(updatedEmails);
    } finally {
      setIsScanningAll(false);
    }
  };

  // Compute live dashboard metrics
  const analyzedEmails = emails.filter((e) => e.analysis !== undefined);
  const threatsDetected = analyzedEmails.filter((e) => e.analysis?.is_phishing).length;
  const safeEmails = analyzedEmails.filter((e) => e.analysis && !e.analysis.is_phishing).length;
  const criticalThreats = analyzedEmails.filter(
    (e) => (e.analysis?.risk_score || 0) >= 80 || e.analysis?.risk_level === 'CRITICAL'
  ).length;
  const totalScore = analyzedEmails.reduce((acc, curr) => acc + (curr.analysis?.risk_score || 0), 0);
  const averageRiskScore = analyzedEmails.length > 0 ? Math.round(totalScore / analyzedEmails.length) : 0;

  const metrics: SecurityMetricsSummary = {
    emailsScanned: analyzedEmails.length,
    threatsDetected,
    safeEmails,
    criticalThreats,
    averageRiskScore,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navigation */}
      <Navbar
        isDemoMode={isDemoMode}
        isBackendOnline={isBackendOnline}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        onScanAll={handleScanAll}
        isScanningAll={isScanningAll}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Sidebar
          threatCount={threatsDetected}
          safeCount={safeEmails}
          totalCount={emails.length}
        />

        {/* Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px', overflow: 'hidden' }}>
          {/* Executive Security Metrics Bar */}
          <DashboardSecurityMetrics metrics={metrics} />

          {/* Split-Pane Inbox & Email Detail */}
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(340px, 420px) 1fr',
              gap: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Left: Email List */}
            <EmailList
              emails={emails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={(e) => {
                setSelectedEmailId(e.id);
                setEmails((prev) =>
                  prev.map((item) => (item.id === e.id ? { ...item, isRead: true } : item))
                );
              }}
              onToggleStar={handleToggleStar}
            />

            {/* Right: Security Inspector & Email View */}
            <EmailDetail
              email={selectedEmail}
              isDemoMode={isDemoMode}
              onUpdateEmailAnalysis={handleUpdateEmailAnalysis}
              onUpdateEmailIntelligence={handleUpdateEmailIntelligence}
              onToggleStar={handleToggleStar}
              onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
