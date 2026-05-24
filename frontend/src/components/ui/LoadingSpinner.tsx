interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export const LoadingSpinner = ({
  label,
  size = "md",
}: LoadingSpinnerProps) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <span
      className={`${sizeClasses[size]} animate-spin rounded-full border-(--color-primary) border-t-transparent`}
    />
    {label ? (
      <p className="text-sm font-medium text-(--color-secondary)">{label}</p>
    ) : null}
  </div>
);
