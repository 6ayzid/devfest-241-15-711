import React, { useState, useRef, useEffect } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tonal' | 'outlined' | 'error' | 'success';
  size?: 's' | 'm' | 'l';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'm',
  icon,
  children,
  className = '',
  disabled,
  onClick,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);
  const pressTimeout = useRef<number | null>(null);

  const handlePointerDown = () => {
    if (disabled) return;
    setPressed(true);
  };

  const handlePointerUp = () => {
    if (pressTimeout.current) window.clearTimeout(pressTimeout.current);
    pressTimeout.current = window.setTimeout(() => {
      setPressed(false);
    }, 150); // Hold for 150ms so fast taps show the shape morph
  };

  useEffect(() => {
    return () => {
      if (pressTimeout.current) window.clearTimeout(pressTimeout.current);
    };
  }, []);

  const sizeClasses = {
    s: 'h-[40px] px-4 rounded-[20px] text-sm',
    m: 'h-[56px] px-6 rounded-[28px] text-base',
    l: 'h-[72px] px-8 rounded-[36px] text-lg',
  }[size];

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--md-sys-color-primary)',
      color: 'var(--md-sys-color-on-primary)',
    },
    secondary: {
      backgroundColor: 'var(--md-sys-color-secondary-container)',
      color: 'var(--md-sys-color-on-secondary-container)',
    },
    tonal: {
      backgroundColor: 'var(--md-sys-color-primary-container)',
      color: 'var(--md-sys-color-on-primary-container)',
    },
    outlined: {
      backgroundColor: 'transparent',
      color: 'var(--md-sys-color-primary)',
      outline: '1.5px solid var(--md-sys-color-outline-variant)',
    },
    error: {
      backgroundColor: 'var(--md-sys-color-error)',
      color: 'var(--md-sys-color-on-error)',
    },
    success: {
      backgroundColor: 'var(--md-sys-color-success)',
      color: 'var(--md-sys-color-on-primary)',
    },
  }[variant];

  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-pressed={pressed}
      style={{
        ...variantStyles,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={`m3-btn inline-flex items-center justify-center gap-2.5 font-semibold transition-[border-radius,transform,background-color,width] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${sizeClasses} ${
        pressed ? '!rounded-[12px] !scale-[0.97]' : ''
      } ${className}`}
    >
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
};
