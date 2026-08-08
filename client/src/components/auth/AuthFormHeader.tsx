import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type AuthFormHeaderProps = {
  title: string;
  subtitle?: string;
  /** In-app route for the back control */
  backTo?: string;
  backLabel?: string;
  /** Custom back handler (runs before default navigation) */
  onBack?: () => void;
  /** Fallback when history is empty and no backTo (default `/`) */
  fallbackTo?: string;
};

export default function AuthFormHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Go back',
  onBack,
  fallbackTo = '/',
}: AuthFormHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backTo) {
      navigate(backTo);
      return;
    }
    const canGoBack = typeof window !== 'undefined' && window.history.length > 1;
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };

  return (
    <header className="agf-form-header">
      <button
        type="button"
        className="agf-form-header__back"
        aria-label={backLabel}
        onClick={handleBack}
      >
        <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
      </button>
      <div className="agf-form-header__body">
        <h2 className="agf-heading">{title}</h2>
        {subtitle ? (
          <p className="agf-subheading agf-subheading--center">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
