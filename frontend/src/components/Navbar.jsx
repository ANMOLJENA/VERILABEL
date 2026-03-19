import React from 'react';
import { Home, FileText, BarChart2, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,      label: 'Home',      active: true  },
  { icon: FileText,  label: 'Records',   active: false },
  { icon: BarChart2, label: 'Analytics', active: false },
  { icon: Settings,  label: 'Settings',  active: false },
];

export default function Navbar({ isApiOnline }) {
  return (
    <nav style={{
      width: '72px',
      minHeight: '100vh',
      background: 'var(--vl-green)',
      borderRight: '1px solid var(--vl-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      paddingBottom: '20px',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom: '32px' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#00c896"/>
            </linearGradient>
          </defs>
          <path d="M20 3L5 10v10c0 9 6.6 17.4 15 19.4C29.4 37.4 36 29 36 20V10L20 3z"
            fill="url(#shield-grad)" />
          <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, width: '100%' }}>
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '48px',
              cursor: active ? 'pointer' : 'not-allowed',
              borderLeft: active ? '3px solid var(--vl-blue)' : '3px solid transparent',
              background: active
                ? 'linear-gradient(90deg, rgba(30,58,95,0.15), transparent)'
                : 'transparent',
              color: active ? 'var(--vl-blue)' : 'rgba(255,255,255,0.8)',
              transition: 'all 0.2s',
              opacity: active ? 1 : 0.8,
            }}
          >
            <Icon size={20} />
          </div>
        ))}
      </div>

      {/* API status dot at bottom */}
      <div title={isApiOnline ? 'API Online' : 'API Offline'}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: isApiOnline ? 'var(--vl-green)' : '#dc2626',
          boxShadow: isApiOnline ? '0 0 8px var(--vl-green)' : 'none',
          animation: isApiOnline ? 'pulse 2s infinite' : 'none',
        }} />
      </div>
    </nav>
  );
}
