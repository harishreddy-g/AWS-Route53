'use client';

import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-aws-orange text-aws-slateDark border-aws-orange hover:bg-aws-orangeDark hover:border-aws-orangeDark font-bold',
  secondary:
    'bg-white text-aws-text border-aws-border hover:bg-aws-grayPanel hover:border-aws-muted shadow-aws',
  danger: 'bg-[#d13212] text-white border-[#d13212] hover:bg-[#ba2e0f] font-bold',
  ghost: 'bg-transparent text-aws-text hover:bg-aws-grayPanel border-transparent',
  link: 'bg-transparent text-aws-link border-transparent hover:text-aws-linkHover hover:underline p-0 font-normal',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-aws-xs',
  md: 'px-4 py-1.5 text-aws-sm',
  lg: 'px-5 py-2 text-aws-sm',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-aws-link/30 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        variant !== 'link' ? sizeClasses[size] : '',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
