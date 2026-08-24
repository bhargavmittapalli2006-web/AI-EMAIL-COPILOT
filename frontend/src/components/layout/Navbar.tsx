import React from 'react';
import { Shield, Radio, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  isDemoMode: boolean;
  isBackendOnline: boolean;
  onToggleDemoMode: () => void;
  onScanAll: () => void;
  isScanningAll: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDemoMode,
  isBackendOnline,
  onToggleDemoMode,
  onScanAll,
  isScanningAll,
}) => {
  return (
    <header
      style={{
        height: '68px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
          }}
        >
          <Shield size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              AI EMAIL COPILOT
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-blue)',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              Phishing Shield v1.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Microservice Security & Real-Time Threat Analysis
          </p>
        </div>
      </div>

      {/* Right Controls: Backend Status Badge & Demo Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Backend Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: isDemoMode
              ? 'rgba(139, 92, 246, 0.12)'
              : isBackendOnline
              ? 'var(--safe-green-bg)'
              : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${
              isDemoMode
                ? 'rgba(139, 92, 246, 0.3)'
                : isBackendOnline
                ? 'var(--safe-green-border)'
                : 'var(--critical-red-border)'
            }`,
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isDemoMode
              ? 'var(--accent-purple)'
              : isBackendOnline
              ? 'var(--safe-green)'
              : 'var(--critical-red)',
          }}
        >
          <Radio size={14} className={isBackendOnline || isDemoMode ? 'animate-pulse' : ''} />
          <span>
            {isDemoMode
              ? 'Demo Simulation Mode'
              : isBackendOnline
              ? 'FastAPI Engine Connected'
              : 'Backend Disconnected'}
          </span>
        </div>

        {/* Scan All Inbox Emails */}
        <button
          onClick={onScanAll}
          disabled={isScanningAll}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#f3f4f6',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={14} className={isScanningAll ? 'animate-spin' : ''} />
          <span>{isScanningAll ? 'Scanning Inbox...' : 'Scan All'}</span>
        </button>

        {/* Toggle Mode Button */}
        <button
          onClick={onToggleDemoMode}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: isDemoMode
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'rgba(139, 92, 246, 0.2)',
            color: isDemoMode ? '#ffffff' : 'var(--accent-purple)',
            borderWidth: isDemoMode ? '0' : '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} />
          <span>{isDemoMode ? 'Switch to Live Backend' : 'Enable Demo Mode'}</span>
        </button>
      </div>
    </header>
  );
};
