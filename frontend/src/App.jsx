import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toolbar } from './components/layout/Toolbar';
import { EmailList } from './components/email/EmailList';
import { EmailDetail } from './components/email/EmailDetail';
import { SecurityContextSidePanel } from './components/email/SecurityContextSidePanel';
import { ComposeModal } from './components/modals/ComposeModal';
import { ScanCustomEmailModal } from './components/modals/ScanCustomEmailModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { HelpModal } from './components/modals/HelpModal';
import { Login } from './pages/Login';
import { MOCK_EMAILS, FOLDERS } from './data/mockInboxData';
import { checkBackendHealth, analyzeEmailWithML } from './services/phishingService';
import { fetchEmailIntelligence } from './services/geminiService';
import { fetchReplySuggestions } from './services/replyService';
import { authService } from './services/authService';


/**
 * AI Email Copilot — Complete Phase 12 Application Coordinator:
 * - Entry / Login Experience & Session State (Frontend Auth Shell)
 * - Navigation, Search, Folders & Settings
 * - Phase 2: Real ML-10 Scanner Integration
 * - Phase 3: Real ML-11 Gemini Email Intelligence
 * - Phase 4: Real ML-12 AI Reply Suggestions + Security Gate
 */
export function App() {
  // Frontend Session State (Persisted in localStorage)
  const [userSession, setUserSession] = useState(() => {
    const savedSession = localStorage.getItem('ai_email_copilot_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (_) {}
    }
    return null;
  });

  const isAuthenticated = Boolean(userSession);

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

  // Sidebar, Modal & Security Context Panel toggle states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSecurityPanelOpen, setIsSecurityPanelOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isCustomScanOpen, setIsCustomScanOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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

  // Auth actions
  const handleLoginSuccess = (sessionData) => {
    const session = {
      ...sessionData,
      authenticatedAt: new Date().toISOString(),
    };
    setUserSession(session);
    localStorage.setItem('ai_email_copilot_session', JSON.stringify(session));
  };

  const handleSignOut = () => {
    setUserSession(null);
    localStorage.removeItem('ai_email_copilot_session');
    setSelectedEmailId(null);
  };

  // Centralized email refresh mechanism strictly synchronizing with backend database
  const refreshEmails = useCallback(async () => {
    if (!userSession?.token) return;
    try {
      const remoteEmails = await authService.getEmails(userSession.token);
      if (Array.isArray(remoteEmails)) {
        setEmails(remoteEmails);
      }
    } catch (err) {
      console.warn('Failed to refresh emails from backend database:', err);
      if (err.message && (err.message.includes('401') || err.message.includes('Authentication required') || err.message.includes('Invalid or expired'))) {
        handleSignOut();
      }
    }
  }, [userSession?.token]);

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

  // Restore authenticated session & synchronize emails from database on mount / token change
  useEffect(() => {
    if (userSession?.token) {
      authService
        .getCurrentUser(userSession.token)
        .then((userData) => {
          if (userData) {
            setUserSession((prev) => ({
              ...prev,
              ...userData,
              name: userData.display_name || prev.name,
              role: userData.role || prev.role,
            }));
            return authService.getEmails(userSession.token);
          } else {
            handleSignOut();
            return null;
          }
        })
        .then((remoteEmails) => {
          if (Array.isArray(remoteEmails)) {
            setEmails(remoteEmails);
          }
        })
        .catch((err) => {
          console.warn('Session restoration / email sync error:', err);
          if (err.message && (err.message.includes('401') || err.message.includes('Authentication required'))) {
            handleSignOut();
          }
        });
    }
  }, [userSession?.token]);


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

    if (userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { isUnread: false }).catch(() => {});
    }

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
  }, [emails, analysisMap, intelligenceMap, replyMap, userSession?.token, triggerEmailScan, triggerEmailIntelligence, triggerEmailReplies]);

  /**
   * Handles custom payload submission from ScanCustomEmailModal
   */
  const handleCustomScanSubmit = async (customPayload) => {
    const customId = `custom-msg-${Date.now()}`;
    const newCustomEmail = {
      id: customId,
      senderName: customPayload.sender.split('@')[0] || 'Custom Sender',
      senderEmail: customPayload.sender,
      recipient: 'user@enterprise.com',
      replyTo: customPayload.reply_to || customPayload.sender,
      subject: customPayload.subject,
      preview: customPayload.body.substring(0, 90) + '...',
      body: customPayload.body,
      links: customPayload.links || [],
      timestamp: 'Just Now',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isUnread: false,
      isStarred: false,
      isImportant: true,
      folder: 'inbox',
      category: 'work',
      hasAttachment: false,
      avatarColor: 'bg-indigo-600',
    };

    setEmails((prev) => [newCustomEmail, ...prev]);
    setSelectedEmailId(customId);

    if (userSession?.token) {
      authService.createEmail(userSession.token, newCustomEmail).catch(() => {});
    }

    await triggerEmailScan(newCustomEmail);
  };

  /**
   * Compose actions: Send & Save Draft
   */
  const handleSendCompose = (data) => {
    const sentId = `sent-${Date.now()}`;
    const newSentEmail = {
      id: sentId,
      senderName: 'Me (You)',
      senderEmail: userSession?.email || 'user@enterprise.com',
      recipient: data.recipient,
      replyTo: userSession?.email || 'user@enterprise.com',
      subject: data.subject,
      preview: data.body.substring(0, 90) + '...',
      body: data.body,
      links: [],
      timestamp: 'Just Now',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isUnread: false,
      isStarred: false,
      isImportant: false,
      folder: 'sent',
      category: 'work',
      hasAttachment: false,
      avatarColor: 'bg-blue-600',
    };
    setEmails((prev) => [newSentEmail, ...prev]);

    if (userSession?.token) {
      authService.createEmail(userSession.token, newSentEmail).catch(() => {});
    }
  };

  const handleSaveDraftCompose = (data) => {
    const draftId = `draft-${Date.now()}`;
    const newDraftEmail = {
      id: draftId,
      senderName: 'Draft',
      senderEmail: userSession?.email || 'user@enterprise.com',
      recipient: data.recipient || 'Draft',
      replyTo: userSession?.email || 'user@enterprise.com',
      subject: data.subject || '(No Subject)',
      preview: data.body.substring(0, 90) + '...',
      body: data.body,
      links: [],
      timestamp: 'Just Now',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isUnread: false,
      isStarred: false,
      isImportant: false,
      folder: 'drafts',
      category: 'work',
      hasAttachment: false,
      avatarColor: 'bg-slate-600',
    };
    setEmails((prev) => [newDraftEmail, ...prev]);

    if (userSession?.token) {
      authService.createEmail(userSession.token, newDraftEmail).catch(() => {});
    }
  };


  // Filtered emails based on folder, category tabs, and search query
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const analysis = analysisMap[email.id]?.data;

      // Folder filtering
      if (activeFolder === 'starred' && !email.isStarred) return false;
      if (activeFolder === 'important' && !email.isImportant) return false;
      if (activeFolder === 'sent' && email.folder !== 'sent') return false;
      if (activeFolder === 'drafts' && email.folder !== 'drafts') return false;

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

      if (activeFolder === 'inbox' && (email.folder === 'spam' || email.folder === 'trash' || email.folder === 'sent' || email.folder === 'drafts')) {
        return false;
      }

      // Category tab filtering (when in primary folder view)
      if (activeFolder === 'inbox') {
        if (activeCategory === 'work' && email.category !== 'work') return false;
        if (activeCategory === 'finance' && email.category !== 'finance') return false;
        if (activeCategory === 'updates' && email.category !== 'updates') return false;
      }

      // Search query filtering across complete body, subject, and sender
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSubject = (email.subject || '').toLowerCase().includes(query);
        const matchesSender =
          (email.senderName || '').toLowerCase().includes(query) ||
          (email.senderEmail || '').toLowerCase().includes(query) ||
          (email.sender || '').toLowerCase().includes(query);
        const matchesBody =
          (email.body || '').toLowerCase().includes(query) ||
          (email.preview || '').toLowerCase().includes(query);
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

  // Dynamic Folder Counts for all folders based on synchronized state & ML verdicts
  const folderCounts = useMemo(() => {
    const counts = {
      inbox: emails.filter((e) => e.folder === 'inbox' && e.isUnread).length,
      starred: emails.filter((e) => e.isStarred).length,
      important: emails.filter((e) => e.isImportant).length,
      sent: emails.filter((e) => e.folder === 'sent').length,
      drafts: emails.filter((e) => e.folder === 'drafts').length,
      all: emails.length,
      spam: emails.filter((e) => e.folder === 'spam').length,
      trash: emails.filter((e) => e.folder === 'trash').length,
      archive: emails.filter((e) => e.folder === 'archive').length,
      threats: 0,
      'high-risk': 0,
      critical: 0,
      work: emails.filter((e) => e.category === 'work').length,
      finance: emails.filter((e) => e.category === 'finance').length,
      updates: emails.filter((e) => e.category === 'updates').length,
      personal: emails.filter((e) => e.category === 'personal').length,
    };

    Object.values(analysisMap).forEach((st) => {
      if (st?.status === 'completed') {
        if (st.data?.is_phishing || st.data?.risk_level === 'CRITICAL' || st.data?.risk_level === 'HIGH') {
          counts.threats += 1;
        }
        if (st.data?.risk_level === 'HIGH') {
          counts['high-risk'] += 1;
        }
        if (st.data?.risk_level === 'CRITICAL') {
          counts.critical += 1;
        }
      }
    });

    return counts;
  }, [emails, analysisMap]);

  // Real Threat count from ML backend results
  const realThreatCount = folderCounts.threats;

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
    if (folderId === 'security-overview') {
      setIsSecurityPanelOpen(true);
    }
  };

  const handleBackToList = () => {
    setSelectedEmailId(null);
  };

  const handleToggleStar = (emailId) => {
    const target = emails.find((e) => e.id === emailId);
    if (target && userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { isStarred: !target.isStarred }).catch(() => {});
    }
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isStarred: !e.isStarred } : e))
    );
  };

  const handleToggleImportant = (emailId) => {
    const target = emails.find((e) => e.id === emailId);
    if (target && userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { isImportant: !target.isImportant }).catch(() => {});
    }
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isImportant: !e.isImportant } : e))
    );
  };

  const handleToggleRead = (emailId) => {
    const target = emails.find((e) => e.id === emailId);
    if (target && userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { isUnread: !target.isUnread }).catch(() => {});
    }
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, isUnread: !e.isUnread } : e))
    );
  };

  const handleRestoreEmail = (emailId) => {
    if (userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { folder: 'inbox' }).catch(() => {});
    }
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'inbox' } : e))
    );
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
    }
  };

  const handleBatchRestore = () => {
    if (userSession?.token) {
      selectedEmailIds.forEach((id) => {
        authService.updateEmail(userSession.token, id, { folder: 'inbox' }).catch(() => {});
      });
    }
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'inbox' } : e))
    );
    setSelectedEmailIds([]);
  };


  const handleDeleteEmail = (emailId) => {
    if (userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { folder: 'trash' }).catch(() => {});
    }
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'trash' } : e))
    );
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
    }
  };

  const handleArchiveEmail = (emailId) => {
    if (userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { folder: 'archive' }).catch(() => {});
    }
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, folder: 'archive' } : e))
    );
    if (selectedEmailId === emailId) {
      setSelectedEmailId(null);
    }
  };

  const handleSpamEmail = (emailId) => {
    if (userSession?.token) {
      authService.updateEmail(userSession.token, emailId, { folder: 'spam' }).catch(() => {});
    }
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
    if (userSession?.token) {
      selectedEmailIds.forEach((id) => {
        authService.updateEmail(userSession.token, id, { folder: 'trash' }).catch(() => {});
      });
    }
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'trash' } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchArchive = () => {
    if (userSession?.token) {
      selectedEmailIds.forEach((id) => {
        authService.updateEmail(userSession.token, id, { folder: 'archive' }).catch(() => {});
      });
    }
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'archive' } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchSpam = () => {
    if (userSession?.token) {
      selectedEmailIds.forEach((id) => {
        authService.updateEmail(userSession.token, id, { folder: 'spam' }).catch(() => {});
      });
    }
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, folder: 'spam' } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchMarkRead = () => {
    if (userSession?.token) {
      selectedEmailIds.forEach((id) => {
        authService.updateEmail(userSession.token, id, { isUnread: false }).catch(() => {});
      });
    }
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, isUnread: false } : e))
    );
    setSelectedEmailIds([]);
  };

  const handleBatchMarkUnread = () => {
    if (userSession?.token) {
      selectedEmailIds.forEach((id) => {
        authService.updateEmail(userSession.token, id, { isUnread: true }).catch(() => {});
      });
    }
    setEmails((prev) =>
      prev.map((e) => (selectedEmailIds.includes(e.id) ? { ...e, isUnread: true } : e))
    );
    setSelectedEmailIds([]);
  };


  // If not authenticated, render Animated Entry / Login Page
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateLanding={() => {}}
        theme={isDark ? 'dark' : 'light'}
        onToggleTheme={toggleTheme}
      />
    );
  }

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
        userSession={userSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenNotifications={() => setIsSecurityPanelOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main App Body: Sidebar + Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeFolder={activeFolder}
          onSelectFolder={handleSelectFolder}
          isCollapsed={isSidebarCollapsed}
          folderCounts={folderCounts}
          onCompose={() => setIsComposeOpen(true)}
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
                refreshEmails();
              }}
              onMarkRead={handleBatchMarkRead}
              onMarkUnread={handleBatchMarkUnread}
              onDeleteSelected={handleBatchDelete}
              onSpamSelected={handleBatchSpam}
              onArchiveSelected={handleBatchArchive}
              onRestoreSelected={handleBatchRestore}
              activeFolder={activeFolder}
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
              onRestore={handleRestoreEmail}
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
              activeFolder={activeFolder}
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
          onOpenCustomScan={() => setIsCustomScanOpen(true)}
        />
      </div>

      {/* Compose Email Dialog Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendCompose}
        onSaveDraft={handleSaveDraftCompose}
      />

      {/* Scan Custom Payload Modal */}
      <ScanCustomEmailModal
        isOpen={isCustomScanOpen}
        onClose={() => setIsCustomScanOpen(false)}
        onAnalyze={handleCustomScanSubmit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        backendHealth={backendHealth}
        userSession={userSession || {}}
        onSignOut={handleSignOut}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
