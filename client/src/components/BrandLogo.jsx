const SRC = '/logo.jpg';

/**
 * Site wordmark. The asset is a landscape lockup, not a circular mark.
 */
export default function BrandLogo({ className = '', alt = 'Spacilly', ...props }) {
  return (
    <img
      src={SRC}
      alt={alt}
      className={`block h-10 w-auto max-w-[200px] object-contain object-left ${className}`.trim()}
      {...props}
    />
  );
}
