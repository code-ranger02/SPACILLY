import { useEffect, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function authFieldId(label: string) {
  return `auth-field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

export function focusAuthErrorSummary() {
  requestAnimationFrame(() => {
    document.getElementById('auth-error-summary')?.focus();
  });
}

export function focusAuthField(label: string) {
  requestAnimationFrame(() => {
    document.getElementById(authFieldId(label))?.focus();
  });
}

export function useFormErrorFocus(error: string, fieldLabel?: string) {
  useEffect(() => {
    if (!error) return;
    if (fieldLabel) {
      focusAuthField(fieldLabel);
      return;
    }
    focusAuthErrorSummary();
  }, [error, fieldLabel]);
}

export function AuthInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  valid,
  focused,
  leftIcon: LeftIcon,
  rightEl,
  onFocus,
  onBlur,
  required,
  autoFocus,
  autoComplete,
  helperText,
  hideLabel,
}: {
  label: string;
  type?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  valid?: boolean;
  focused?: boolean;
  leftIcon?: React.ComponentType<{ size?: string | number; style?: React.CSSProperties; className?: string }>;
  rightEl?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  helperText?: string;
  hideLabel?: boolean;
}) {
  const fieldId = authFieldId(label);
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedBy = [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['agf-field', error ? 'is-error' : '', valid ? 'is-valid' : ''].filter(Boolean).join(' ')}>
      {!hideLabel && (
        <label
          htmlFor={fieldId}
          className={[
            'agf-field__label',
            LeftIcon ? 'agf-field__label--with-icon' : '',
            error ? 'is-error' : '',
            valid && !error ? 'is-valid' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {LeftIcon && (
            <span className="agf-field__label-icon" aria-hidden>
              <LeftIcon size={16} />
            </span>
          )}
          <span className="agf-field__label-text">{label}</span>
          {required ? <span className="sr-only"> (required)</span> : null}
        </label>
      )}
      {helperText && (
        <p id={helperId} className="agf-field__helper">
          {helperText}
        </p>
      )}
      <div className="agf-field__wrap">
        <input
          id={fieldId}
          name={name || fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={[
            'agf-input',
            'premium-input-exempt',
            rightEl ? 'agf-input--has-right' : '',
            error ? 'is-error' : '',
            valid ? 'is-valid' : '',
            focused && !error ? 'is-focused' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {rightEl ? (
          <span className="agf-field__icon agf-field__icon--right agf-field__icon--action">{rightEl}</span>
        ) : null}
      </div>
      {error && (
        <motion.p id={errorId} role="alert" className="agf-field__error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle size={12} aria-hidden /> {error}
        </motion.p>
      )}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  const reduceMotion = useReducedMotion();
  if (!message) return null;
  return (
    <motion.div
      id="auth-error-summary"
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
      animate={reduceMotion ? false : { opacity: 1, height: 'auto' }}
      className="agf-error-banner outline-none"
    >
      <AlertCircle size={15} className="flex-shrink-0" aria-hidden />
      {message}
    </motion.div>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  type = 'submit',
  disabled,
  loading,
  success,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'button';
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading || success}
      className="agf-btn-primary"
      style={
        success
          ? { background: 'var(--badge-success-text, #22c55e)', boxShadow: 'none' }
          : undefined
      }
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      aria-busy={loading || undefined}
    >
      {loading && (
        <span
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          aria-hidden
        />
      )}
      {loading && <span className="sr-only">Loading</span>}
      {children}
    </motion.button>
  );
}

export function OrDivider({ mode = 'signup' }: { mode?: 'login' | 'signup' }) {
  const label = mode === 'login' ? 'or sign in with' : 'or sign up with';
  return <div className="agf-divider">{label}</div>;
}

function GoogleIcon() {
  return (
    <svg className="agf-social-icon" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.77-6.77C35.41 2.38 30.21 0 24 0 14.67 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.5 17.79 9.5 24 9.5z" />
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.16 7.09-10.29 7.09-17.55z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.67 48 24 48z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="agf-social-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.75l.42-3.25H13.5V9.01c0-.94.26-1.58 1.61-1.58H16.9V4.64c-.29-.04-1.28-.12-2.52-.12-2.5 0-4.21 1.52-4.21 4.31V10.7H7.75v3.25h2.42V22h3.33z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="agf-social-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16.72 12.7c-.02-2.12 1.73-3.13 1.81-3.18-1-.45-2.28-.72-3.55-.74-1.5-.15-2.94.88-3.7.88-.77 0-1.95-.86-3.21-.84-1.65.03-3.17.96-4.02 2.44-1.71 2.97-.44 7.37 1.23 9.78.82 1.18 1.79 2.5 3.07 2.45 1.24-.05 1.71-.8 3.21-.8 1.5 0 1.93.8 3.24.78 1.34-.02 2.19-1.2 3-2.38.95-1.38 1.34-2.72 1.36-2.79-.03-.01-2.61-1-2.63-3.97zm-2.46-7.3c.68-.82 1.14-1.97 1.01-3.1-.98.04-2.17.65-2.87 1.47-.63.73-1.18 1.9-1.03 3.02 1.09.08 2.2-.55 2.89-1.39z"
      />
    </svg>
  );
}

export function GoogleBtn({ onClick, label = 'Google' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="agf-social-btn agf-social-btn--circle"
      aria-label={`Continue with ${label}`}
    >
      <GoogleIcon />
    </button>
  );
}

export function SocialAuthRow({ onGoogle }: { onGoogle: () => void }) {
  return (
    <div className="agf-social-row" role="group" aria-label="Social sign-in options">
      <GoogleBtn onClick={onGoogle} />
      <button
        type="button"
        className="agf-social-btn agf-social-btn--circle is-disabled"
        disabled
        aria-label="Sign in with Facebook (coming soon)"
        title="Coming soon"
      >
        <FacebookIcon />
      </button>
      <button
        type="button"
        className="agf-social-btn agf-social-btn--circle is-disabled"
        disabled
        aria-label="Sign in with Apple (coming soon)"
        title="Coming soon"
      >
        <AppleIcon />
      </button>
    </div>
  );
}

export function OtpInputs({
  digits,
  inputRefs,
  locked,
  error,
  errorMessage,
  onChange,
  onKeyDown,
  onPaste,
}: {
  digits: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  locked: boolean;
  error: boolean;
  errorMessage?: string;
  onChange: (i: number, raw: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) {
  const hintId = useId();
  const errorId = useId();

  return (
    <div>
      <p id={hintId} className="sr-only">
        Enter the 6-digit verification code. You can paste the full code into any box.
      </p>
      <div
        className="agf-otp-grid"
        role="group"
        aria-labelledby={hintId}
        aria-describedby={error && errorMessage ? errorId : hintId}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            value={d}
            disabled={locked}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            className={['agf-otp-digit', d ? 'is-filled' : '', error ? 'is-error' : ''].filter(Boolean).join(' ')}
            aria-label={`Digit ${i + 1} of 6`}
            aria-invalid={error || undefined}
          />
        ))}
      </div>
      {error && errorMessage && (
        <p id={errorId} role="alert" className="agf-field__error text-center mt-3">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export function applyOtpInput(
  index: number,
  raw: string,
  current: string[],
): { next: string[]; focusIndex: number } {
  const digitsOnly = raw.replace(/\D/g, '');
  if (digitsOnly.length <= 1) {
    const next = [...current];
    next[index] = digitsOnly;
    return { next, focusIndex: digitsOnly && index < 5 ? index + 1 : index };
  }
  const chars = digitsOnly.slice(0, 6).split('');
  const next = Array.from({ length: 6 }, (_, i) => chars[i] || '');
  return { next, focusIndex: Math.min(5, chars.length - 1) };
}
