import "../../css/Button.css";

/**
 * Tombol dasar yang dipakai di seluruh aplikasi.
 *
 * Props:
 * - variant: "primary" | "secondary" | "danger" | "ghost"
 * - size: "sm" | "md" | "lg"
 * - fullWidth: boolean
 * - disabled: boolean
 * - onClick, type, children
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  ...rest
}) {
  const classNames = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
