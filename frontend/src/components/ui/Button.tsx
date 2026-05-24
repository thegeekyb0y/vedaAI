import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[0_12px_30px_rgba(17,17,17,0.16)] hover:bg-[#242424]",
  secondary:
    "border border-border-strong bg-white text-primary hover:bg-surface-subtle",
  ghost:
    "bg-transparent text-secondary hover:bg-surface-subtle hover:text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export const Button = ({
  children,
  className = "",
  disabled,
  fullWidth = false,
  iconLeft,
  iconRight,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    {...props}
  >
    {loading ? <LoaderCircle size={16} className="animate-spin" /> : iconLeft}
    <span>{children}</span>
    {!loading ? iconRight : null}
  </button>
);
