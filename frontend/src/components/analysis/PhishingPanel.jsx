import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Globe,
  Lock,
  Cpu,
  Info,
} from 'lucide-react';
import { RiskGauge } from '../common/RiskGauge';
import { FeatureSignalsMatrix } from '../common/FeatureSignalsMatrix';

export const PhishingPanel = ({ phishingAnalysis = {} }) => {
  const {
    is_phishing = false,
    risk_score = 0,
    risk_level = 'LOW',
    confidence = 0.95,
    flagged_reasons = [],
    features = {},
  } = phishingAnalysis;

  return (
    <div className="rounded-2xl border border-white/10 bg-cyber-850/70 glass-panel p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              is_phishing
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {is_phishing ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Phishing & Threat Intelligence
            </h3>
            <p className="text-xs text-slate-400">
              AI Security Engine v1.0 • Feature Inspection & Anomaly Scoring
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
              is_phishing
                ? 'bg-red-500/15 border-red-500/40 text-red-400 shadow-glow-red'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-glow-emerald'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                is_phishing ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            {is_phishing ? 'MALICIOUS PHISHING' : 'VERIFIED SAFE'}
          </span>
        </div>
      </div>

      {/* Top Section: Radial Risk Gauge + Threat Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 flex justify-center">
          <RiskGauge
            score={risk_score}
            level={risk_level}
            confidence={confidence}
            size={150}
          />
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="p-3.5 rounded-xl bg-cyber-900/80 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Threat Verdict & Assessment:</span>
              <span className="text-cyan-400">Normalized Index</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {is_phishing
                ? `High risk indicators detected with ${(confidence * 100).toFixed(
                    0
                  )}% statistical confidence. The communication exhibits deceptive headers, coercion language, or untrusted destination hyperlinks.`
                : `No active malicious markers detected. SPF, DKIM, and link reputation pass security baseline validation.`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-cyber-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Risk Level</span>
              <span
                className={`font-bold uppercase ${
                  is_phishing ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {risk_level}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-cyber-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Confidence</span>
              <span className="font-bold text-cyan-400">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-cyber-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Flags Raised</span>
              <span
                className={`font-bold ${
                  flagged_reasons.length > 0 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {flagged_reasons.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Security Reasons */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Security Reasons & Explanations ({flagged_reasons.length})
          </h4>
        </div>

        {flagged_reasons.length === 0 ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Clean scan: No threat signals or deceptive patterns flagged.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {flagged_reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-200 transition-all hover:bg-red-500/15"
              >
                <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed font-sans">{reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ML Feature Indicators Matrix */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-semibold">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          Extracted Feature Indicators (ML Vector)
        </h4>
        <FeatureSignalsMatrix features={features} />
      </div>
    </div>
  );
};
