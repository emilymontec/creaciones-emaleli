import { InputHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, description, id, className, ...props }, ref) {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className="flex cursor-pointer items-start gap-2.5"
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={clsx(
            "mt-0.5 size-4 shrink-0 rounded border-gray-300 text-primary-500",
            "focus:ring-2 focus:ring-primary-100",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />

        {(label || description) && (
          <span>
            {label && (
              <span className="block text-sm font-medium text-gray-800">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-xs text-gray-500">{description}</span>
            )}
          </span>
        )}
      </label>
    );
  },
);
