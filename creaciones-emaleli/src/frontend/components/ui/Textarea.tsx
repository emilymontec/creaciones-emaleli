import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, helperText, id, className, rows = 4, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={clsx(
            "w-full resize-y rounded-input border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors",
            "placeholder:text-gray-400",
            "focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
            error
              ? "border-error focus:border-error focus:ring-red-100"
              : "border-gray-200",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
            className,
          )}
          {...props}
        />

        {error ? (
          <p className="mt-1.5 text-xs text-error">{error}</p>
        ) : (
          helperText && (
            <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
          )
        )}
      </div>
    );
  },
);
