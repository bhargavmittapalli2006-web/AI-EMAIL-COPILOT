import React, { useState, useMemo } from 'react';
import {
  X,
  Bell,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListTodo,
  Server,
  Sparkles,
  CheckCheck,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * Enterprise Notification Center Panel
 * Displays real-time Security, Productivity, and System alerts derived from actual ML/AI analysis and backend state.
 */
export function NotificationCenter({
  isOpen,
  onClose,
  emails = [],
  analysisMap = {},
  intelligenceMap = {},
  backendHealth = {},
  reminders = [],
  onSelectEmail,
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const stored = localStorage.getItem('read_notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markAsRead = (id) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem('read_notifications', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const next = new Set(allIds);
    setReadNotificationIds(next);
    try {
      localStorage.setItem('read_notifications', JSON.stringify([...next]));
    } catch {}
  };

  // Derive real dynamic notifications from emails, ML analysis, and backend health
  const notifications = useMemo(() => {
    const list = [];

    // 1. Security Alerts from ML-10 Scans
    for (const email of emails) {
      const scan = analysisMap[email.id]?.data;
      if (scan && scan.is_phishing) {
        list.push({
          id: `sec-${email.id}`,
          type: 'security',
          category: 'SECURITY',
          title: `Critical Threat Detected: ${email.subject || 'Untitled'}`,
          description: `Phishing probability ${(scan.confidence * 100).toFixed(1)}% (Risk: ${Math.round(scan.risk_score)}/100). Flagged reasons: ${(scan.flagged_reasons || []).slice(0, 2).join(', ') || 'Suspicious payload signals'}.`,
          timestamp: email.date || 'Recent',
          severity: 'critical',
          emailId: email.id,
          icon: ShieldAlert,
        });
      } else if (scan && (scan.risk_level === 'HIGH' || scan.risk_score >= 60)) {
        list.push({
          id: `sec-high-${email.id}`,
          type: 'security',
          category: 'SECURITY',
          title: `High-Risk Email Flagged: ${email.subject || 'Untitled'}`,
          description: `Threat score ${Math.round(scan.risk_score)}/100. Sender header or content indicators require analyst review.`,
          timestamp: email.date || 'Recent',
          severity: 'high',
          emailId: email.id,
          icon: AlertTriangle,
        });
      }
    }

    // 2. Productivity Alerts from Action Items & Reminders
    for (const reminder of reminders) {
      list.push({
        id: `rem-${reminder.id}`,
        type: 'productivity',
        category: 'PRODUCTIVITY',
        title: `Reminder: ${reminder.title}`,
        description: reminder.description || 'Scheduled user action item reminder.',
        timestamp: reminder.due_at || reminder.time || 'Upcoming',
        severity: reminder.priority === 'high' ? 'high' : 'medium',
        emailId: reminder.email_id || reminder.emailId,
        icon: Clock,
      });
    }


    for (const email of emails) {
      const intel = intelligenceMap[email.id]?.data;
      if (intel && Array.isArray(intel.action_items)) {
        const highPriority = intel.action_items.filter((item) => (item.priority || '').toLowerCase() === 'high');
        if (highPriority.length > 0) {
          list.push({
            id: `prod-${email.id}`,
            type: 'productivity',
            category: 'PRODUCTIVITY',
            title: `High-Priority Action Item: ${email.subject || 'Task'}`,
            description: highPriority[0].text || 'Action required.',
            timestamp: email.date || 'Recent',
            severity: 'medium',
            emailId: email.id,
            icon: ListTodo,
          });
        }
      }
    }

    // 3. System Alerts from Backend Health
    if (backendHealth.isOnline && backendHealth.modelLoaded) {
      list.push({
        id: 'sys-ml-ready',
        type: 'system',
        category: 'SYSTEM',
        title: 'ML Phishing Pipeline Online',
        description: 'Scikit-Learn TF-IDF classification engine is active and validated (703KB pipeline).',
        timestamp: 'System Ready',
        severity: 'info',
        icon: Server,
      });
    } else if (!backendHealth.isOnline) {
      list.push({
        id: 'sys-offline',
        type: 'system',
        category: 'SYSTEM',
        title: 'Security Engine Disconnected',
        description: 'Unable to reach backend microservice at 127.0.0.1:8000.',
        timestamp: 'Offline',
        severity: 'high',
        icon: AlertTriangle,
      });
    }

    if (backendHealth.geminiAvailable) {
      list.push({
        id: 'sys-gemini-ready',
        type: 'system',
        category: 'SYSTEM',
        title: 'Gemini Intelligence Service Ready',
        description: 'Email summarization and reply suggestion models are connected.',
        timestamp: 'System Ready',
        severity: 'info',
        icon: Sparkles,
      });
    }

    return list;
  }, [emails, analysisMap, intelligenceMap, backendHealth, reminders]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readNotificationIds.has(n.id)).length;
  }, [notifications, readNotificationIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-right-4 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-sky-950 text-blue-600 dark:text-sky-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notification Center
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Security, Productivity, and System events
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title="Mark all as read"
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-[11px] font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'security', label: 'Security' },
            { id: 'productivity', label: 'Productivity' },
            { id: 'system', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                activeFilter === tab.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-sky-950/80 dark:text-sky-300 font-bold border border-blue-200 dark:border-sky-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium">No notifications in this category.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const IconComp = notif.icon;
              const isRead = readNotificationIds.has(notif.id);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.emailId && onSelectEmail) {
                      onSelectEmail(notif.emailId);
                      onClose();
                    }
                  }}
                  className={`pt-2 pb-2 px-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 select-none ${
                    isRead
                      ? 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      : 'bg-blue-50/40 dark:bg-slate-850/80 text-slate-900 dark:text-white hover:bg-blue-50/70 dark:hover:bg-slate-800 border border-blue-100/60 dark:border-slate-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      notif.severity === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        : notif.severity === 'high'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : notif.severity === 'info'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-100 dark:bg-sky-950 text-blue-600 dark:text-sky-400'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {notif.description}
                    </p>

                    {notif.emailId && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-sky-400">
                        <span>View email details</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400 shrink-0 mt-1" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center text-[10px] text-slate-400">
          Notifications update in real-time as ML threat scans complete.
        </div>
      </div>
    </div>
  );
}
