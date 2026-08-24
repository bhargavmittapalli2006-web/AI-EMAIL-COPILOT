import React from 'react';
import { Inbox, ShieldAlert, Star, Send, Archive, Trash2, Settings, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  threatCount: number;
  safeCount: number;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ threatCount, safeCount, totalCount }) => {
  const navItems = [
    { label: 'Inbox', icon: Inbox, count: totalCount, active: true },
    { label: 'Security Shield', icon: ShieldAlert, count: threatCount, alert: threatCount > 0 },
    { label: 'Safe Verified', icon: ShieldCheck, count: safeCount },
    { label: 'Starred', icon: Star, count: 2 },
    { label: 'Sent', icon: Send },
    { label: 'Archive', icon: Archive },
    { label: 'Spam / Phish', icon: Trash2, count: threatCount },
  ];

  return (
    <aside
      style={{
        width: '240px',
        borderRight: '1px solid var(--border-color)',
        background: 'rgba(11, 15, 25, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
      }}
    >
      <div>
        <div style={{ marginBottom: '14px', padding: '0 10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Mailboxes & Security
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, idx) => {
            const { icon: Icon } = item;
            return (
              <button
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: item.active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: item.active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontWeight: item.active ? 700 : 500,
                  fontSize: '0.875rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={item.alert ? 'var(--critical-red)' : undefined} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      background: item.alert
                        ? 'rgba(239, 68, 68, 0.2)'
                        : item.active
                        ? 'rgba(59, 130, 246, 0.25)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: item.alert ? 'var(--critical-red)' : item.active ? 'var(--accent-blue)' : 'var(--text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Settings */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <Settings size={18} />
          <span>Security Settings</span>
        </button>
      </div>
    </aside>
  );
};
