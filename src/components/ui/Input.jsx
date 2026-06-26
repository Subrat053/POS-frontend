import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-sm font-medium text-foreground/80">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-muted/50",
            icon && iconPosition === 'left' && "pl-9",
            icon && iconPosition === 'right' && "pr-9",
            error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-destructive mt-0.5">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
