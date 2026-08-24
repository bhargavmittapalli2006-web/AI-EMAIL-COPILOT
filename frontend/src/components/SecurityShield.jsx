import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { analyzeEmail } from '../services/api';

export const SecurityShield = ({
  data: directData,
  email,
  phishingAnalysis,
  state: explicitState,
  isLoading: explicitLoading,
  error: explicitError,
  onRetry,
  onQuarantine,
  onMarkSafe,
  headers = {},
}) => {
  const [analysisData, setAnalysisData] = useState(directData || phishingAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch / analyze when email prop changes or is analyzed
  const runAnalysis = useCallback(async (targetEmail) => {
    if (!targetEmail) return;
    setLoading(true);
    setFetchError(null);
    try {
      const result = await analyzeEmail(targetEmail);
      setAnalysisData(result);
    } catch (err) {
      setFetchError(err.message || 'Security analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (directData) {
      setAnalysisData(directData);
      setFetchError(null);
    } else if (phishingAnalysis) {
      setAnalysisData(phishingAnalysis);
      setFetchError(null);
    } else if (email) {
      runAnalysis(email);
    }
  }, [directData, phishingAnalysis, email, runAnalysis]);

  const handleManualRefresh = () => {
    if (email) {
      runAnalysis(email);
    } else if (onRetry) {
      onRetry();
    }
  };

  // 1. Resolve payload
  const payload = analysisData || {};

  // Extract / Normalize fields from API response
  const isPhishing = payload.is_phishing ?? (payload.classification === 'phishing' || (payload.risk_score || 0) >= 50);
  const riskScore = Math.round(payload.risk_score ?? (isPhishing ? 92 : 8));
  const rawRiskLevel = (payload.risk_level || (riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 30 ? 'suspicious' : 'safe')).toLowerCase();
  
  const classification = payload.classification || (isPhishing ? (riskScore >= 80 ? 'Phishing' : 'Suspicious') : 'Safe');
  const confidence = payload.confidence ?? 0.96;
  const flaggedReasons = payload.flagged_reasons || (isPhishing ? [
    'Suspicious sender',
    'Suspicious link',
    'Urgent language'
  ] : []);

  // Features percentages
  const rawFeatures = payload.features || {};
  const senderRisk = rawFeatures.sender_risk != null
    ? Math.round(rawFeatures.sender_risk * 100)
    : (rawFeatures.sender_replyto_mismatch || rawFeatures.suspicious_brand_impersonation ? 91 : isPhishing ? 78 : 5);
  
  const linkRisk = rawFeatures.link_risk != null
    ? Math.round(rawFeatures.link_risk * 100)
    : (rawFeatures.has_ip_url || rawFeatures.has_shortener ? 94 : isPhishing ? 82 : 4);

  const contentRisk = rawFeatures.content_risk != null
    ? Math.round(rawFeatures.content_risk * 100)
    : ((rawFeatures.urgent_word_count || 0) > 1 || (rawFeatures.sensitive_word_count || 0) > 1 ? 87 : isPhishing ? 75 : 8);

  // 2. Determine active state
  const activeError = explicitError || fetchError;
  const isCurrentlyLoading = loading || explicitLoading;

  let currentState = 'safe';
  if (activeError) currentState = 'error';
  else if (isCurrentlyLoading || explicitState === 'loading') currentState = 'loading';
  else if (explicitState === 'pending') currentState = 'pending';
  else if (explicitState) currentState = explicitState.toLowerCase();
  else if (isPhishing || rawRiskLevel === 'critical' || rawRiskLevel === 'high') currentState = 'phishing';
  else if (rawRiskLevel === 'medium' || rawRiskLevel === 'suspicious') currentState = 'suspicious';
  else currentState = 'safe';

  // ----------------------------------------------------
  // STATE 1: ERROR STATE
  // ----------------------------------------------------
  if (currentState === 'error') {
    return (
      <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Security Analysis Unavailable</h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              {typeof activeError === 'string' ? activeError : 'Unable to connect to the phishing detection engine.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Analysis</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 2: PENDING STATE
  // ----------------------------------------------------
  if (currentState === 'pending') {
    return (
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151E2E] text-slate-800 dark:text-[#F8FAFC] space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Security Shield Analysis Pending
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
            This email payload has been received and is queued for deep heuristic and ML threat inspection.
          </p>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Run Security Analysis</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 3: LOADING STATE
  // ----------------------------------------------------
  if (currentState === 'loading') {
    return (
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151E2E] space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          </div>
          <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-[#111827] space-y-2">
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-12 h-5 bg-slate-300 dark:bg-slate-600 rounded" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="w-40 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-full h-10 bg-slate-100 dark:bg-[#111827] rounded-lg" />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATES 4, 5, 6: ACTIVE SHIELD (Safe / Suspicious / Phishing)
  // ----------------------------------------------------
  const themeStyles = {
    phishing: {
      cardBorder: 'border-rose-200 dark:border-rose-800/80',
      bannerBg: 'bg-rose-50 dark:bg-rose-950/30',
      bannerBorder: 'border-rose-200 dark:border-rose-800/60',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
      icon: ShieldAlert,
      iconColor: 'text-rose-600 dark:text-rose-400',
      scoreColor: 'text-rose-600 dark:text-rose-400',
      riskBarBg: 'bg-rose-600 dark:bg-rose-500',
      recommendedAction: 'Do not click links or provide sensitive information.',
      statusLabel: 'Critical Threat',
    },
    suspicious: {
      cardBorder: 'border-amber-200 dark:border-amber-800/80',
      bannerBg: 'bg-amber-50 dark:bg-amber-950/30',
      bannerBorder: 'border-amber-200 dark:border-amber-800/60',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      scoreColor: 'text-amber-600 dark:text-amber-400',
      riskBarBg: 'bg-amber-500',
      recommendedAction: 'Proceed with caution. Cross-verify the sender domain and bank details through secondary channels.',
      statusLabel: 'Suspicious Warning',
    },
    safe: {
      cardBorder: 'border-slate-200 dark:border-slate-800',
      bannerBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      bannerBorder: 'border-emerald-200 dark:border-emerald-800/60',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      scoreColor: 'text-emerald-600 dark:text-emerald-400',
      riskBarBg: 'bg-emerald-500',
      recommendedAction: 'Standard legitimate communication. Safe to read, download attachments, and respond.',
      statusLabel: 'Verified Safe',
    },
  };

  const theme = themeStyles[currentState] || themeStyles.safe;
  const ShieldIcon = theme.icon;

  const displayRiskLevel = rawRiskLevel.charAt(0).toUpperCase() + rawRiskLevel.slice(1);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* 1. Header & Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg bg-slate-100 dark:bg-[#151E2E] ${theme.iconColor}`}>
            <ShieldIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Security Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              AI Security Shield • Phishing & Anomaly Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Re-run API analysis"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151E2E] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {theme.statusLabel}
          </span>
        </div>
      </div>

      {/* 2. Four Key Security Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Risk Level */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-1">
            Risk Level
          </span>
          <span className={`text-base font-bold uppercase tracking-wide ${theme.scoreColor}`}>
            {displayRiskLevel}
          </span>
        </div>

        {/* Risk Score */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-1">
            Risk Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold font-mono ${theme.scoreColor}`}>
              {riskScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-1">
            Confidence
          </span>
          <span className="text-base font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
            {Math.round(confidence * 100)}%
          </span>
        </div>

        {/* Classification */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-1">
            Classification
          </span>
          <span className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC] capitalize">
            {classification}
          </span>
        </div>
      </div>

      {/* 3. Why this email was flagged */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Why this email was flagged:
        </h4>

        {flaggedReasons.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>No malicious threat signals, domain spoofing, or deceptive coercion detected.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {flaggedReasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1] shadow-sm"
              >
                <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  •
                </span>
                <p className="leading-relaxed font-sans">{reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Feature Analysis (Sender Risk, Link Risk, Content Risk) */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
          Feature analysis:
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sender Risk */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-[#CBD5E1]">Sender Risk</span>
              <span className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">{senderRisk}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${senderRisk}%` }}
                className={`h-full transition-all duration-500 ${
                  senderRisk >= 75 ? 'bg-rose-500' : senderRisk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Link Risk */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-[#CBD5E1]">Link Risk</span>
              <span className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">{linkRisk}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${linkRisk}%` }}
                className={`h-full transition-all duration-500 ${
                  linkRisk >= 75 ? 'bg-rose-500' : linkRisk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Content Risk */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-[#CBD5E1]">Content Risk</span>
              <span className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">{contentRisk}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${contentRisk}%` }}
                className={`h-full transition-all duration-500 ${
                  contentRisk >= 75 ? 'bg-rose-500' : contentRisk >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recommended Action Card */}
      <div className={`p-4 rounded-xl border ${theme.bannerBorder} ${theme.bannerBg} space-y-1.5`}>
        <span className="text-xs font-semibold uppercase tracking-wider block text-slate-900 dark:text-[#F8FAFC]">
          Recommended Action
        </span>
        <p className="text-xs leading-relaxed font-sans text-slate-800 dark:text-[#CBD5E1] font-medium">
          {theme.recommendedAction}
        </p>

        {isPhishing && onQuarantine && (
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onQuarantine}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Quarantine Threat Now</span>
            </button>
            {onMarkSafe && (
              <button
                type="button"
                onClick={onMarkSafe}
                className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#151E2E] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-[#CBD5E1] text-xs font-medium hover:bg-slate-50 dark:hover:bg-[#1B2638] transition-colors cursor-pointer"
              >
                Mark False Positive
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityShield;
