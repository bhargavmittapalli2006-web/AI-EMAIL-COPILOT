import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toolbar } from './components/layout/Toolbar';
import { EmailList } from './components/email/EmailList';
import { EmailDetail } from './components/email/EmailDetail';
import { SecurityContextSidePanel } from './components/email/SecurityContextSidePanel';
import { MOCK_EMAILS, FOLDERS } from './data/mockInboxData';
import { checkBackendHealth, analyzeEmailWithML } from './services/phishingService';
import { fetchEmailIntelligence } from './services/geminiService';
import { fetchReplySuggestions } from './services/replyService';

/**
 * AI Email Copilot — Complete Phase 4 Integration:
 * - Phase 1: Classical Gmail-Style Frontend Shell
 * - Phase 2: Real ML-10 Scanner Integration
 * - Phase 3: Real ML-11 Gemini Email Intelligence
 * - Phase 4: Real ML-12 AI Reply Suggestions + Security Gate
 */
export function App() {
  // Theme state persisted in localStorage
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('ai_email_copilot_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Navigation & View state
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [activeCategory, setActiveCategory] = useState('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);

  // Sidebar & Security Context Panel toggle states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSecurityPanelOpen, setIsSecurityPanelOpen] = useState(false);

  // Email Presentation fixtures
  const [emails, setEmails] = useState(MOCK_EMAILS);

  // Backend Health State
  const [backendHealth, setBackendHealth] = useState({
    isOnline: false,
    status: 'connecting',
    modelLoaded: false,
    geminiAvailable: false,
    version: '1.0.0',
  });

  // Real ML-10 Analysis State Map: Record<emailId, { status: 'idle'|'analyzing'|'completed'|'error', data?: Object, error?: string }>
  const [analysisMap, setAnalysisMap] = useState({});

  // Real Gemini Intelligence State Map: Record<emailId, { status: 'idle'|'loading'|'completed'|'error', data?: Object, error?: string }>
  const [intelligenceMap, setIntelligenceMap] = useState({});

  // Real AI Reply Suggestions State Map: Record<emailId, { status: 'idle'|'loading'|'completed'|'error', data?: Object, error?: string }>
  const [replyMap, setReplyMap] = useState({});

  const [isScanningAll, setIsScanningAll] = useState(false);

  // Sync theme class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ai_email_copilot_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ai_email_copilot_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Probe Backend Health on Mount & recurring interval
  const probeHealth = useCallback(async () => {
    const health = await checkBackendHealth();
    setBackendHealth(health);
  }, []);

  useEffect(() => {
    probeHealth();
    const interval = setInterval(probeHealth, 20000);
    return () => clearInterval(interval);
  }, [probeHealth]);

  /**
   * Triggers real Gemini intelligence for an email
   */
  const triggerEmailIntelligence = useCallback(async (email, mlAnalysis = null) => {
    if (!email) return;

    setIntelligenceMap((prev) => ({
      ...prev,
      [email.id]: { status: 'loading' },
    }));

    try {
      const intelResult = await fetchEmailIntelligence(email, mlAnalysis);
      setIntelligenceMap((prev) => ({
        ...prev,
        [email.id]: {
          status: 'completed',
          data: intelResult,
        },
      }));
    } catch (err) {
      setIntelligenceMap((prev) => ({
        ...prev,
        [email.id]: {
          status: 'error',
          error: err.message || 'Failed to generate AI intelligence',
        },
      }));
    }
  }, []);

  /**
   * Triggers real AI reply suggestions for an email
   */
  const triggerEmailReplies = useCallback(async (email, mlAnalysis = null) => {
    if (!email) return;

    setReplyMap((prev) => ({
      ...prev,
      [email.id]: { status: 'loading' },
    }));

    try {
      const replyResult = await fetchReplySuggestions(email, mlAnalysis);
      setReplyMap((prev) => ({
        ...prev,
        [email.id]: {
          status: 'completed',
          data: replyResult,
        },
      }));
    } catch (err) {
      setReplyMap((prev) => ({
        ...prev,
        [email.id]: {
          status: 'error',
          error: err.message || 'Failed to generate reply suggestions',
        },
      }));
    }
  }, []);

  /**
   * Triggers complete pipeline for a single email: ML-10 Scan -> Gemini Intel -> AI Replies
   */
  const triggerEmailScan = useCallback(async (email) => {
    if (!email) return;

    setAnalysisMap((prev) => ({
      ...prev,
      [email.id]: { status: 'analyzing' },
    }));

    let realMlResult = null;

    try {
      realMlResult = await analyzeEmailWithML(email);
      setAnalysisMap((prev) => ({
        ...prev,
        [email.id]: {
          status: 'completed',
          data: realMlResult,
        },
      }));
    } catch (err) {
      setAnalysisMap((prev) => ({
        ...prev,
        [email.id]: {
          status: 'error',
          error: err.message || 'Analysis failed',
        },
      }));
    }

    // Trigger downstream AI services with authoritative ML context
    await Promise.all([
      triggerEmailIntelligence(email, realMlResult),
      triggerEmailReplies(email, realMlResult),
    ]);
  }, [triggerEmailIntelligence, triggerEmailReplies]);

  /**
   * Scans all emails in the inbox with real ML inference
   */
  const handleScanAll = useCallback(async () => {
    setIsScanningAll(true);
    for (const email of emails) {
      await triggerEmailScan(email);
    }
    setIsScanningAll(false);
  }, [emails, triggerEmailScan]);

  // When an email is selected/opened, trigger analysis and services if not already completed
  const handleSelectEmail = useCallback((emailId) => {
    setSelectedEmailId(emailId);

    // Mark as read
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isUnread: false } : e))
    );

    const targetEmail = emails.find((e) => e.id === emailId);
    if (targetEmail) {
      const existingScan = analysisMap[emailId];
      const existingIntel = intelligenceMap[emailId];
      const existingReply = replyMap[emailId];

      if (!existingScan || existingScan.status === 'idle' || existingScan.status === 'error') {
        triggerEmailScan(targetEmail);
      } else {
        if (!existingIntel || existingIntel.status === 'idle' || existingIntel.status === 'error') {
          triggerEmailIntelligence(targetEmail, existingScan.data || null);
        }
        if (!existingReply || existingReply.status === 'idle' || existingReply.status === 'error') {
          triggerEmailReplies(targetEmail, existingScan.data || null);
        }
      }
    }
  }, [emails, analysisMap, intelligenceMap, replyMap, triggerEmailScan, triggerEmailIntelligence, triggerEmailReplies]);

  // Filtered emails based on folder and search query
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const analysis = analysisMap[email.id]?.data;

      // Folder filtering
      if (activeFolder === 'starred' && !email.isStarred) return false;
      if (activeFolder === 'important' && !email.isImportant) return false;

      // Security folders filtered strictly on real ML results
      if (activeFolder === 'threats') {
        if (!analysis || (!analysis.is_phishing && analysis.risk_level !== 'CRITICAL' && analysis.risk_level !== 'HIGH')) {
          return false;
        }
      }
      if (activeFolder === 'critical') {
        if (!analysis || analysis.risk_level !== 'CRITICAL') return false;
      }
      if (activeFolder === 'high-risk') {
        if (!analysis || analysis.risk_level !== 'HIGH') return false;
      }

      if (activeFolder === 'spam' && email.folder !== 'spam') return false;
      if (activeFolder === 'trash' && email.folder !== 'trash') return false;
      if (activeFolder === 'work' && email.category !== 'work') return false;
      if (activeFolder === 'finance' && email.category !== 'finance') return false;
      if (activeFolder === 'updates' && email.category !== 'updates') return false;
      if (activeFolder === 'personal' && email.category !== 'personal') return false;
      if (activeFolder === 'inbox' && email.folder === 'spam') return false;
      if (activeFolder === 'inbox' && email.folder === 'trash') return false;

      // Category tab filtering (when in primary folder)
      if (activeFolder === 'inbox') {
        if (activeCategory === 'work' && email.category !== 'work') return false;
        if (activeCategory === 'finance' && email.category !== 'finance') return false;
        if (activeCategory === 'updates' && email.category !== 'updates') return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSubject = email.subject.toLowerCase().includes(query);
        const matchesSender = email.senderName.toLowerCase().includes(query) || email.senderEmail.toLowerCase().includes(query);
        const matchesBody = email.preview.toLowerCase().includes(query);
        if (!matchesSubject && !matchesSender && !matchesBody) return false;
      }

      return true;
    });
  }, [emails, activeFolder, activeCategory, searchQuery, analysisMap]);

  // Selected email object for detail view
  const currentEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  // Folder label title
  const activeFolderObj = FOLDERS.find((f) => f.id === activeFolder);
  const folderTitle = activeFolderObj ? activeFolderObj.label : 'Inbox';

  // Unread count
  const unreadCount = useMemo(() => {
    return emails.filter((e) => e.isUnread && e.folder !== 'spam' && e.folder !== 'trash').length;
  }, [emails]);

  // Real Threat count from ML backend results
  const realThreatCount = useMemo(() => {
    let count = 0;
    Object.values(analysisMap).forEach((st) => {
      if (st?.status === 'completed' && (st.data?.is_phishing || st.data?.risk_level === 'CRITICAL' || st.data?.risk_level === 'HIGH')) {
        count += 1;
      }
    });
    return count;
  }, [analysisMap]);

  // Real Clean count from ML backend results
  const realCleanCount = useMemo(() => {
    let count = 0;
    Object.values(analysisMap).forEach((st) => {
      if (st?.status === 'completed' && !st.data?.is_phishing && (st.data?.risk_level === 'LOW' || st.data?.risk_level === 'MEDIUM')) {
        count += 1;
      }
    });
    return count;
  }, [analysisMap]);

  // Total scanned count
  const realScannedCount = useMemo(() => {
    return Object.values(analysisMap).filter((st) => st?.status === 'completed').length;
  }, [analysisMap]);

  // Navigation Handlers
  const handleSelectFolder = (folderId) => {
    setActiveFolder(folderId);
    setSelectedEmailId(null);
    setSelectedEmailIds([]);
  };

  const handleBackToList = () => {
    setSelectedEmailId(null);
  };

  const handleToggleStar = (emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isStarred: !e.isStarred } : e))
    );
  };

  const handleToggleImportant = (emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isImportant: !e.isImportant } : e))
    );
  };

  const handleToggleRead = (emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isUnread: !e.isUnread } : e))
    );
  };

  const handleDeleteEmail = (emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'trash' } : e))
    );
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
    }
  };

  const handleArchiveEmail = (emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'archive' } : e))
    );
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
    }
  };

  const handleSpamEmail = (emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'spam' } : e))
    );
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
    }
  };

  // Batch Selection Handlers
  const handleToggleCheckbox = (emailId) => {
    setSelectedEmailIds((prev) =>
      prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEmailIds(filteredEmails.map((e) => e.id));
  };

  const handleDeselectAll = () => {
    setSelectedEmailIds([]);
  };

  const handleSelectRead = () => {
    setSelectedEmailIds(filteredEmails.filter((e) => !e.isUnread).map((e) => e.id));
  };

  const handleSelectUnread = () => {
    setSelectedEmailIds(filteredEmails.filter((e) => e.isUnread).map((e) => e.id));
  };

  const handleSelectStarred = () => {
    setSelectedEmailIds(filteredEmails.filter((e) => e.isStarred).map((e) => e.id));
  };

  const handleBatchDelete = () => {
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'trash' } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchArchive = () => {
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'archive' } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchSpam = () => {
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'spam' } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchMarkRead = () => {
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, isUnread: false } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchMarkUnread = () => {
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, isUnread: true } : e))
    );
    setSelectedEmailIds([]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F6F8FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      {/* Top Application Header */}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isSecurityPanelOpen={isSecurityPanelOpen}
        onToggleSecurityPanel={() => setIsSecurityPanelOpen((prev) => !prev)}
        backendHealth={backendHealth}
      />

      {/* Main App Body: Sidebar + Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeFolder={activeFolder}
          onSelectFolder={handleSelectFolder}
          isCollapsed={isSidebarCollapsed}
          unreadCount={unreadCount}
          threatCount={realThreatCount}
          onCompose={() => alert('Compose feature available in full messaging suite')}
        />

        {/* Center Content Container (Rounded Card Canvas) */}
        <main className="flex-1 flex flex-col my-2 mr-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-w-0">
          {/* Action Toolbar */}
          {!selectedEmailId && (
            <Toolbar
              totalEmails={filteredEmails.length}
              selectedCount={selectedEmailIds.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onSelectRead={handleSelectRead}
              onSelectUnread={handleSelectUnread}
              onSelectStarred={handleSelectStarred}
              onRefresh={() => {
                probeHealth();
                setEmails([...MOCK_EMAILS]);
              }}
              onMarkRead={handleBatchMarkRead}
              onMarkUnread={handleBatchMarkUnread}
              onDeleteSelected={handleBatchDelete}
              onSpamSelected={handleBatchSpam}
              onArchiveSelected={handleBatchArchive}
              folderTitle={folderTitle}
            />
          )}

          {/* View Switcher: Email List vs Email Detail View */}
          {selectedEmailId ? (
            <EmailDetail
              email={currentEmail}
              analysisState={analysisMap[selectedEmailId] || { status: 'idle' }}
              intelligenceState={intelligenceMap[selectedEmailId] || { status: 'idle' }}
              replyState={replyMap[selectedEmailId] || { status: 'idle' }}
              onScanNow={() => triggerEmailScan(currentEmail)}
              onRetryIntelligence={() => triggerEmailIntelligence(currentEmail, analysisMap[selectedEmailId]?.data || null)}
              onRetryReply={() => triggerEmailReplies(currentEmail, analysisMap[selectedEmailId]?.data || null)}
              onBack={handleBackToList}
              onDelete={handleDeleteEmail}
              onArchive={handleArchiveEmail}
              onToggleStar={handleToggleStar}
              onToggleRead={handleToggleRead}
              onSpam={handleSpamEmail}
            />
          ) : (
            <EmailList
              emails={filteredEmails}
              analysisMap={analysisMap}
              selectedEmailIds={selectedEmailIds}
              activeEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              onToggleCheckbox={handleToggleCheckbox}
              onToggleStar={handleToggleStar}
              onToggleImportant={handleToggleImportant}
              onDeleteEmail={handleDeleteEmail}
              onArchiveEmail={handleArchiveEmail}
              onToggleRead={handleToggleRead}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              folderTitle={folderTitle}
            />
          )}
        </main>

        {/* Right Security Context Side Panel */}
        <SecurityContextSidePanel
          isOpen={isSecurityPanelOpen}
          onClose={() => setIsSecurityPanelOpen(false)}
          backendHealth={backendHealth}
          totalEmails={emails.length}
          scannedCount={realScannedCount}
          cleanCount={realCleanCount}
          threatCount={realThreatCount}
          selectedEmail={currentEmail}
          selectedEmailAnalysis={selectedEmailId ? analysisMap[selectedEmailId] : {}}
          onScanAll={handleScanAll}
          isScanningAll={isScanningAll}
        />
      </div>
    </div>
  );
}

export default App;
