'use client';

import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-aws-orange text-white hover:bg-aws-orangeDark border-aws-orange',
  secondary: 'bg-white text-slate-800 hover:bg-slate-50 border-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-500 border-red-600',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
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
        'inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-aws-orange/40 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
