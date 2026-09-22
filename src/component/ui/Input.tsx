import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-content-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-md border border-edge bg-surface-sunken px-3 py-2.5 text-sm text-content placeholder-content-subtle transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-danger focus:border-danger focus:ring-danger" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-hover">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
