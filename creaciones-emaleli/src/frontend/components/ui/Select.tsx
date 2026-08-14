import { SelectHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Select simple y accesible basado en <select> nativo (funciona igual de
 * bien con teclado, lector de pantalla y en mobile). Soporta `multiple`
 * pasando la prop nativa. Para un combobox "buscable" en catálogos con
 * muchas opciones, ver `SearchableSelect` en el mismo módulo.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      id,
      className,
      multiple,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            multiple={multiple}
            aria-invalid={Boolean(error)}
            className={clsx(
              "w-full appearance-none rounded-input border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors",
              !multiple && "pr-9",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
              error
                ? "border-error focus:border-error focus:ring-red-100"
                : "border-gray-200",
              "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
              className,
            )}
            {...props}
          >
            {placeholder && !multiple && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {!multiple && (
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
          )}
        </div>

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
