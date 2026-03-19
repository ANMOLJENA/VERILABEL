import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="vl-card"
        style={{ width: '400px', padding: '40px', position: 'relative' }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--vl-muted)',
        }}>
          <X size={20} />
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 12px' }}>
            <defs>
              <linearGradient id="modal-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#00c896"/>
              </linearGradient>
            </defs>
            <path d="M20 3L5 10v10c0 9 6.6 17.4 15 19.4C29.4 37.4 36 29 36 20V10L20 3z"
              fill="url(#modal-grad)" />
            <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 style={{ color: 'var(--vl-blue)', fontSize: '22px',
            fontWeight: 700, margin: 0 }}>Welcome back</h2>
          <p style={{ color: 'var(--vl-muted)', fontSize: '14px',
            marginTop: '6px' }}>Sign in to your VeriLabel account</p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px',
              border: '1.5px solid var(--vl-border)',
              borderRadius: '10px', fontSize: '14px',
              color: 'var(--vl-text)', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--vl-green)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,200,150,0.15)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--vl-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px',
              border: '1.5px solid var(--vl-border)',
              borderRadius: '10px', fontSize: '14px',
              color: 'var(--vl-text)', outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--vl-green)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,200,150,0.15)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--vl-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button className="vl-btn-primary" style={{ width: '100%',
            justifyContent: 'center', padding: '13px' }}>
            Sign In
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px',
          color: 'var(--vl-muted)', fontSize: '13px' }}>
          Don't have an account?{' '}
          <span style={{ color: 'var(--vl-green)', cursor: 'pointer',
            fontWeight: 500 }}>Contact us</span>
        </p>
      </div>
    </div>
  );
}
