import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import AuthFormHeader from './AuthFormHeader';
import {
  AuthInput,
  OtpInputs,
  PrimaryBtn,
  applyOtpInput,
  focusAuthField,
} from './AuthFormControls';
import { authAPI } from '../../lib/api';
import { API_BASE_URL } from '../../lib/config';
import {
  clearAllAuthDrafts,
  clearAuthDraft,
  loadAuthDraft,
  type AuthDraftScope,
  type ResetDraft,
} from '../../lib/authDraftStorage';
import { mapAuthApiErrors, focusAuthApiErrors } from '../../lib/authFieldErrors';
import { useSaveAuthDraft } from '../../hooks/useAuthDraft';

const RESEND_CD = 120;

function formatCountdown(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function ResetPasswordOtpForm({
  email,
  storageScope = 'page',
  onBack,
  onSuccess,
}: {
  email: string;
  storageScope?: AuthDraftScope;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const resetEmail = email.trim().toLowerCase();
  const saved = loadAuthDraft<ResetDraft>(storageScope, 'reset');

  const [digits, setDigits] = useState(
    saved?.digits?.length === 6 ? [...saved.digits] : ['', '', '', '', '', ''],
  );
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpChecking, setOtpChecking] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState(saved?.newPassword || '');
  const [newConfirm, setNewConfirm] = useState(saved?.newConfirm || '');
  const [resetting, setResetting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [resendCd, setResendCd] = useState(RESEND_CD);
  const [resendN, setResendN] = useState(0);
  const [resendLock, setResendLock] = useState<number | null>(null);

  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const lastChecked = useRef('');

  useSaveAuthDraft(
    storageScope,
    'reset',
    { email: resetEmail, digits, newPassword, newConfirm },
    true,
  );

  useEffect(() => {
    window.setTimeout(() => refs.current[0]?.focus(), 80);
  }, []);

  useEffect(() => {
    if (resendCd <= 0) return;
    const t = window.setInterval(() => setResendCd((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [resendCd]);

  const canResend = (!resendLock || Date.now() >= resendLock) && resendCd <= 0 && resendN < 3;
  const passwordsEnabled = otpVerified && !otpChecking && !resetting;

  const checkOtp = async (code: string) => {
    setOtpChecking(true);
    setOtpError('');
    try {
      await authAPI.verifyPasswordResetOtp(resetEmail, code);
      if (lastChecked.current !== code) return;
      setOtpVerified(true);
      window.setTimeout(() => focusAuthField('New Password'), 50);
    } catch (err: any) {
      if (lastChecked.current !== code) return;
      const { banner, fields } = mapAuthApiErrors({ message: err?.message }, 'reset');
      setOtpVerified(false);
      setOtpError(fields.__otp__ || banner || 'That code is incorrect. Try again.');
    } finally {
      setOtpChecking(false);
    }
  };

  useEffect(() => {
    const code = digits.join('');
    if (!/^\d{6}$/.test(code)) {
      lastChecked.current = '';
      setOtpVerified(false);
      return;
    }
    if (lastChecked.current === code) return;
    lastChecked.current = code;
    void checkOtp(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, resetEmail]);

  const handleChange = (i: number, raw: string) => {
    if (resetting) return;
    const { next, focusIndex } = applyOtpInput(i, raw, digits);
    setDigits(next);
    setOtpError('');
    setOtpVerified(false);
    if (next[focusIndex]) refs.current[focusIndex]?.focus();
    else if (focusIndex < 5 && next[i]) refs.current[Math.min(5, i + 1)]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (resetting) return;
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits];
        next[i] = '';
        setDigits(next);
        setOtpVerified(false);
        e.preventDefault();
        return;
      }
      if (i > 0) {
        e.preventDefault();
        refs.current[i - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && i < 5) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (resetting) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pasted.length) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] || ''));
    setOtpError('');
    setOtpVerified(false);
    refs.current[Math.min(5, pasted.length - 1)]?.focus();
  };

  const sendResetOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      lastChecked.current = '';
      setDigits(['', '', '', '', '', '']);
      setOtpVerified(false);
      setOtpError('');
      setResendCd(RESEND_CD);
      setResendN((n) => n + 1);
      window.setTimeout(() => refs.current[0]?.focus(), 80);
    } catch {
      setOtpError('Failed to send a new code. Try again.');
    }
  };

  const submitReset = async () => {
    setFieldErrors({});
    const code = digits.join('');
    if (!otpVerified || !/^\d{6}$/.test(code)) {
      setOtpError('Enter a valid 6-digit code first.');
      refs.current[0]?.focus();
      return;
    }
    if (newPassword.length < 6) {
      setFieldErrors({ 'New Password': 'Password must be ≥ 6 characters.' });
      focusAuthField('New Password');
      return;
    }
    if (newPassword !== newConfirm) {
      setFieldErrors({ 'Confirm Password': 'Passwords do not match.' });
      focusAuthField('Confirm Password');
      return;
    }
    setResetting(true);
    try {
      await authAPI.resetPasswordWithOtp(resetEmail, code, newPassword);
      clearAllAuthDrafts(storageScope);
      clearAuthDraft(storageScope, 'forgot');
      onSuccess();
    } catch (err: any) {
      const { banner, fields } = mapAuthApiErrors(err?.payload || { message: err?.message }, 'reset');
      const { __otp__, ...pwFields } = fields;
      if (__otp__) setOtpError(__otp__);
      else setOtpError(banner);
      setFieldErrors(pwFields);
      setOtpVerified(false);
      lastChecked.current = '';
      focusAuthApiErrors(fields, banner);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="agf-otp-wrap">
      <AuthFormHeader
        title="Reset Password"
        subtitle={`Enter the 6-digit code sent to ${resetEmail}, then set a new password.`}
        backLabel="Back to sign in"
        onBack={onBack}
      />

      <div className="agf-center-narrow">
        <OtpInputs
          digits={digits}
          inputRefs={refs}
          locked={resetting}
          error={!!otpError}
          errorMessage={otpError || undefined}
          verified={otpVerified}
          onChange={handleChange}
          onKeyDown={handleKey}
          onPaste={handlePaste}
        />

        {otpChecking && !otpError && (
          <p className="agf-meta text-center mt-3" aria-live="polite">
            Checking code…
          </p>
        )}
        {otpVerified && !otpError && (
          <p className="agf-meta text-center mt-3" aria-live="polite">
            Code verified. Set a new password below.
          </p>
        )}

        <div className="text-center mt-3 mb-5 sm:mb-6">
          {resendN >= 3 ? (
            <p className="agf-meta" style={{ color: 'var(--badge-error-text)' }}>
              Too many attempts.
            </p>
          ) : resendCd > 0 ? (
            <p className="agf-meta">Resend in {formatCountdown(resendCd)}</p>
          ) : (
            <button
              type="button"
              disabled={!canResend}
              onClick={async () => {
                if (resendN >= 2) {
                  setResendN(3);
                  setResendLock(Date.now() + 30 * 60 * 1000);
                  return;
                }
                await sendResetOtp();
              }}
              className="agf-link"
              style={{ opacity: !canResend ? 0.55 : 1 }}
            >
              Resend Code
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-6 text-left">
          <AuthInput
            label="New Password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next['New Password'];
                return next;
              });
            }}
            error={fieldErrors['New Password']}
            placeholder="New password"
            leftIcon={Lock}
            focused={focused === 'np'}
            onFocus={() => setFocused('np')}
            onBlur={() => setFocused(null)}
            disabled={!passwordsEnabled}
            helperText={passwordsEnabled ? undefined : 'Password fields unlock after a valid code.'}
            required
          />
          <AuthInput
            label="Confirm Password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={newConfirm}
            onChange={(v) => {
              setNewConfirm(v);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next['Confirm Password'];
                return next;
              });
            }}
            error={fieldErrors['Confirm Password']}
            placeholder="Confirm new password"
            leftIcon={Lock}
            focused={focused === 'nc'}
            onFocus={() => setFocused('nc')}
            onBlur={() => setFocused(null)}
            disabled={!passwordsEnabled}
            required
          />
        </div>

        <PrimaryBtn
          type="button"
          onClick={submitReset}
          loading={resetting}
          disabled={!passwordsEnabled}
        >
          {resetting ? 'Updating…' : 'Set New Password →'}
        </PrimaryBtn>

        <button type="button" onClick={onBack} className="agf-link block mx-auto mt-5">
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
