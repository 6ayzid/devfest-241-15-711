import React, { useEffect, useRef, useState } from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: React.ReactNode;
}

/** 48px circular icon button that morphs to a 12px rounded square while pressed. */
export const IconButton: React.FC<IconButtonProps> = ({
  label,
  children,
  className = '',
  disabled,
  style,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const release = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPressed(false), 150);
  };

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-pressed={pressed}
      onPointerDown={() => {
        if (!disabled) setPressed(true);
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      style={{ opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
      className={`m3-btn m3-btn-icon shrink-0 ${className}`}
    >
      {children}
    </button>
  );
};
