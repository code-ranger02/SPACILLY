import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';
import { authAPI } from '../lib/api';
import AuthPremiumLayout from '../components/AuthPremiumLayout';
import AuthFusionCard from '../components/auth/AuthFusionCard';
import AuthFormHeader from '../components/auth/AuthFormHeader';
import {
  AuthInput,
  ErrorBanner,
  PrimaryBtn,
  OtpInputs,
  applyOtpInput,
} from '../components/auth/AuthFormControls';

export function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromUrl = searchParams.get('email') || '';
  const { showToast } = useToastStore();

  const [email, setEmail] = useState(emailFromUrl);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const e = emailFromUrl.trim();
    if (!e) return;
    setEmail(e);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setStep('code');
    }
  }, [emailFromUrl]);

  useEffect(() => {
    if (step === 'code' && otp.every((d) => !d)) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [step, otp]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleSendCode = async () => {
    const e = email.trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || sendLoading) return;
    setSendLoading(true);
    setError('');
    try {
      await authAPI.requestVerificationOtp(e);
      setStep('code');
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      showToast('Verification code sent. Check your email.', 'success');
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send code.';
      setError(message);
    } finally {
      setSendLoading(false);
    }
  };

  const handleOtpChange = (index: number, raw: string) => {
    const { next, focusIndex } = applyOtpInput(index, raw, otp);
    setOtp(next);
    setError('');
    if (focusIndex !== index) inputRefs.current[focusIndex]?.focus();
  };

  const handleOtpKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '');
    setOtp(next);
    setError('');
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    const eMail = email.trim();
    if (code.length !== 6 || !eMail) return;
    setVerifyLoading(true);
    setError('');
    try {
      await authAPI.verifyEmailWithOtp(eMail, code);
      setStep('success');
      showToast('Email verified! You can sign in now.', 'success');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code. Try again.';
      setError(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || sendLoading) return;
    setSendLoading(true);
    setError('');
    try {
      await authAPI.requestVerificationOtp(email.trim());
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      showToast('New code sent. Check your email.', 'success');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend.';
      setError(message);
    } finally {
      setSendLoading(false);
    }
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canVerify = otp.every(Boolean);

  return (
    <AuthPremiumLayout>
      <AuthFusionCard>
        {step === 'success' ? (
          <div className="agf-otp-wrap text-center">
            <div className="agf-otp-icon mx-auto">
              <Mail size={28} aria-hidden />
            </div>
            <h2 className="agf-heading">You&apos;re all set</h2>
            <p className="agf-subheading agf-subheading--center">
              Your email is verified. Redirecting you to sign in…
            </p>
            <div
              className="mx-auto mt-4 w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--agf-brand-bright)', borderTopColor: 'transparent' }}
              aria-hidden
            />
          </div>
        ) : step === 'email' ? (
          <div className="agf-form">
            <AuthFormHeader
              title="Verify Email"
              subtitle="Enter your email and we'll send you a 6-digit verification code."
              backTo="/auth?tab=login"
              backLabel="Back to sign in"
            />
            <ErrorBanner message={error} />
            <AuthInput
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setError('');
              }}
              placeholder="you@example.com"
              leftIcon={Mail}
              required
            />
            <PrimaryBtn type="button" onClick={handleSendCode} loading={sendLoading} disabled={!validEmail}>
              {sendLoading ? 'Sending…' : 'Send Verification Code'}
            </PrimaryBtn>
            <p className="agf-form-footer">
              <Link to="/auth?tab=login" className="agf-link">
                Back to Log In
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="agf-form agf-otp-wrap">
            <AuthFormHeader
              title="Enter Your Code"
              subtitle={`We sent a 6-digit code to ${email.trim()}.`}
              backTo="/auth?tab=login"
              backLabel="Back to sign in"
            />
            <div className="agf-center-narrow">
              <OtpInputs
                digits={otp}
                inputRefs={inputRefs}
                locked={verifyLoading}
                error={!!error}
                errorMessage={error || undefined}
                onChange={handleOtpChange}
                onKeyDown={handleOtpKey}
                onPaste={handleOtpPaste}
              />
              <div className="text-center my-4">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || sendLoading}
                  className="agf-link"
                  style={{ opacity: resendCooldown > 0 || sendLoading ? 0.55 : 1 }}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't get the code? Resend"}
                </button>
              </div>
              <PrimaryBtn loading={verifyLoading} disabled={!canVerify}>
                {verifyLoading ? 'Verifying…' : 'Verify & Continue'}
              </PrimaryBtn>
            </div>
          </form>
        )}
      </AuthFusionCard>
    </AuthPremiumLayout>
  );
}
