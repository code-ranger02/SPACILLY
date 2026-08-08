import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type AuthFormHeaderProps = {
  title: string;
  subtitle?: string;
  /** In-app route for the back control */
  backTo?: string;
  backLabel?: string;
  /** Use history back instead of a fixed route */
  onBack?: () => void;
};

export default function AuthFormHeader({
  title,
  subtitle,
  backTo,
  backLabel = 'Go back',
  onBack,
}: AuthFormHeaderProps) {
  const navigate = useNavigate();

  const backControl = backTo ? (
    <Link to={backTo} className="agf-form-header__back" aria-label={backLabel}>
      <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
    </Link>
  ) : (
    <button
      type="button"
      className="agf-form-header__back"
      aria-label={backLabel}
      onClick={() => (onBack ? onBack() : navigate(-1))}
    >
      <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
    </button>
  );

  return (
    <header className="agf-form-header">
      {backControl}
      <div className="agf-form-header__body">
        <h2 className="agf-heading">{title}</h2>
        {subtitle ? (
          <p className="agf-subheading agf-subheading--center">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
