import { ShieldCheck, ShieldAlert, AlertTriangle, Flame, Loader2, HelpCircle, AlertCircle } from 'lucide-react';

/**
 * Centralized Security Badge & Verdict Mapper (Phase 2)
 * ------------------------------------------------------
 * Maps real backend ML analysis results or lifecycle states into UI badges.
 * 
 * @param {Object} state - Analysis state wrapper { status: 'idle'|'analyzing'|'completed'|'error', data?: Object, error?: string }
 * @returns {Object} { label: string, variant: string, icon: Component, score?: number, level?: string, isAnalyzing: boolean, isError: boolean, isScanned: boolean }
 */
export function getSecurityBadgeMeta(state = {}) {
  const status = state.status || 'idle';

  if (status === 'analyzing') {
    return {
      label: 'Scanning...',
      variant: 'neutral',
      icon: Loader2,
      isAnalyzing: true,
      isError: false,
      isScanned: false,
      spin: true,
    };
  }

  if (status === 'error') {
    return {
      label: 'Scan Error',
      variant: 'neutral',
      icon: AlertCircle,
      isAnalyzing: false,
      isError: true,
      isScanned: false,
      error: state.error || 'Backend unavailable',
    };
  }

  if (status === 'completed' && state.data) {
    const { risk_level, risk_score, is_phishing } = state.data;
    const level = String(risk_level || '').toUpperCase();

    if (level === 'CRITICAL' || is_phishing) {
      return {
        label: 'Threat',
        variant: 'critical',
        icon: Flame,
        score: risk_score,
        level: 'CRITICAL',
        isAnalyzing: false,
        isError: false,
        isScanned: true,
      };
    }

    if (level === 'HIGH') {
      return {
        label: 'High Risk',
        variant: 'high',
        icon: ShieldAlert,
        score: risk_score,
        level: 'HIGH',
        isAnalyzing: false,
        isError: false,
        isScanned: true,
      };
    }

    if (level === 'MEDIUM') {
      return {
        label: 'Caution',
        variant: 'caution',
        icon: AlertTriangle,
        score: risk_score,
        level: 'MEDIUM',
        isAnalyzing: false,
        isError: false,
        isScanned: true,
      };
    }

    // LOW / Legitimate
    return {
      label: 'Safe',
      variant: 'safe',
      icon: ShieldCheck,
      score: risk_score,
      level: 'LOW',
      isAnalyzing: false,
      isError: false,
      isScanned: true,
    };
  }

  // Idle / Not Scanned
  return {
    label: 'Not Scanned',
    variant: 'neutral',
    icon: HelpCircle,
    isAnalyzing: false,
    isError: false,
    isScanned: false,
  };
}
