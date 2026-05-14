import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-earth-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full rounded-lg border px-3.5 py-2.5 text-sm text-earth-800',
            'bg-white placeholder:text-earth-400 resize-y min-h-[100px]',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-gamosa-500/20 focus:border-gamosa-500',
            error ? 'border-red-500' : 'border-earth-300 hover:border-earth-400',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
