import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RiskGauge = ({ score = 0, level = 'LOW', confidence = 0.95, size = 130 }) => {
  const clampedScore = Math.min(Math.max(Number(score) || 0, 0), 100);
  
  const radius = 48;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  const getColor = () => {
    if (clampedScore >= 80) return { stroke: '#e11d48', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' };
    if (clampedScore >= 60) return { stroke: '#ea580c', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' };
    if (clampedScore >= 30) return { stroke: '#d97706', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' };
    return { stroke: '#059669', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' };
  };

  const theme = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          height={size}
          width={size}
          viewBox="0 0 120 120"
          className="transform -rotate-135"
        >
          {/* Background Track */}
          <circle
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="60"
            cy="60"
          />

          {/* Progress Arc */}
          <circle
            stroke={theme.stroke}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="60"
            cy="60"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-medium text-slate-400 dark:text-slate-500">
            Risk Score
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-2xl font-bold tracking-tight ${theme.text}`}>
              {clampedScore.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">/100</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {(confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>

      <div className="w-full mt-1 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Threat Level</span>
        <span className={`font-semibold ${theme.text} uppercase`}>
          {level}
        </span>
      </div>
    </div>
  );
};
