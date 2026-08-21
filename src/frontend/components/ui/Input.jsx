import "../../css/Input.css";

/**
 * Input dasar dengan label opsional dan pesan error.
 *
 * Props: label, error, ...semua atribut <input> standar
 */
export default function Input({ label, error, id, className = "", ...rest }) {
  const inputId = id || rest.name;

  return (
    <div className="input-field">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-control ${error ? "input-control--error" : ""} ${className}`}
        {...rest}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
