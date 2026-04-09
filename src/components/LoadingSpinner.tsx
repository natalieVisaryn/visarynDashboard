type LoadingSpinnerProps = {
  size?: number;
  "aria-label"?: string;
};

export default function LoadingSpinner({
  size = 18,
  "aria-label": ariaLabel = "Loading",
}: LoadingSpinnerProps) {
  return (
    <span
      className="visaryn-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label={ariaLabel}
    />
  );
}
