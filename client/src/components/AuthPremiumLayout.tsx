import type { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/auth-fusion.css';

interface AuthPremiumLayoutProps {
  children: ReactNode;
  /** @deprecated Layout is unified; prop kept for legacy route wrappers */
  currentView?: string;
}

function AuthCircuitPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="agf-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--agf-brand, #ff6b00)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M0 120 H200 L280 200 H520 L600 120 H800 M0 380 H160 L240 460 H560 L640 380 H800 M120 0 V600 M400 0 V600 M680 0 V600"
        fill="none"
        stroke="url(#agf-line-grad)"
        strokeWidth="1.2"
        opacity="0.5"
      />
      <circle cx="200" cy="120" r="3" fill="var(--agf-brand, #ff6b00)" opacity="0.7" />
      <circle cx="600" cy="120" r="3" fill="var(--agf-brand, #ff6b00)" opacity="0.7" />
      <circle cx="240" cy="460" r="3" fill="var(--agf-brand, #ff6b00)" opacity="0.5" />
      <circle cx="640" cy="380" r="3" fill="var(--agf-brand, #ff6b00)" opacity="0.5" />
    </svg>
  );
}

/** Auth shell — centered form only; no site header, footer, or hero carousel. */
export default function AuthPremiumLayout({ children }: AuthPremiumLayoutProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`auth-fusion${isLight ? ' auth-fusion--light' : ''} auth-fusion--form-only`}
      data-auth-layout="fusion"
    >
      <a href="#auth-form-panel" className="auth-fusion__skip">
        Skip to form
      </a>

      <main id="auth-form-panel" tabIndex={-1} className="auth-fusion__main">
        <div className="auth-fusion__main-bg" />
        <AuthCircuitPattern className="auth-fusion__main-circuit" />

        <div className="auth-fusion__main-inner">{children}</div>
      </main>
    </div>
  );
}
