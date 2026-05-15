import { Ic, I } from './Icons'

export const Btn = ({
  children, onClick, variant = "primary",
  full = false, sm = false, disabled = false, type = "button"
}) => {
  const variants = {
    primary:   { background: "#0d1b5e", color: "#fff", border: "none", boxShadow: "0 2px 10px rgba(13,27,94,.22)" },
    secondary: { background: "#fff", color: "#0d1b5e", border: "1.5px solid #0d1b5e" },
    ghost:     { background: "transparent", color: "#0d1b5e", border: "none" },
    danger:    { background: "#b91c1c", color: "#fff", border: "none" },
    white:     { background: "#fff", color: "#0d1b5e", border: "none" },
    accent:    { background: "#1e3db5", color: "#fff", border: "none" },
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...variants[variant],
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontWeight: 600,
        borderRadius: 9,
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.52 : 1,
        padding: sm ? "8px 18px" : "12px 26px",
        fontSize: sm ? "0.82rem" : "0.9rem",
        transition: "opacity .15s",
        letterSpacing: "0.01em",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

export const Field = ({
  label, type = "text", placeholder,
  value, onChange, icon, note, required, rows
}) => (
  <div style={{ marginBottom: 18 }}>
    {label && (
      <label style={{
        display: "block", fontSize: "0.79rem",
        fontWeight: 600, color: "#4b5563", marginBottom: 6
      }}>
        {label}
        {required && <span style={{ color: "#b91c1c", marginLeft: 2 }}>*</span>}
      </label>
    )}
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute", left: 13,
          top: rows ? "13px" : "50%",
          transform: rows ? "none" : "translateY(-50%)",
          color: "#9ca3af", display: "flex", pointerEvents: "none"
        }}>
          {icon}
        </span>
      )}
      {rows ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            padding: icon ? "10px 13px 10px 40px" : "10px 13px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: "0.88rem",
            background: "#fafafa",
            color: "#111",
            resize: "vertical",
          }}
          onFocus={e => e.target.style.borderColor = "#0d1b5e"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            padding: icon ? "10px 13px 10px 40px" : "10px 13px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            fontSize: "0.88rem",
            background: "#fafafa",
            color: "#111",
          }}
          onFocus={e => e.target.style.borderColor = "#0d1b5e"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
      )}
    </div>
    {note && (
      <p style={{ fontSize: "0.73rem", color: "#9ca3af", marginTop: 4 }}>{note}</p>
    )}
  </div>
)

export const Sel = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 18 }}>
    {label && (
      <label style={{
        display: "block", fontSize: "0.79rem",
        fontWeight: 600, color: "#4b5563", marginBottom: 6
      }}>
        {label}
        {required && <span style={{ color: "#b91c1c", marginLeft: 2 }}>*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "10px 13px",
        border: "1.5px solid #e5e7eb",
        borderRadius: 8,
        fontSize: "0.88rem",
        background: "#fafafa",
        color: value ? "#111" : "#9ca3af",
        appearance: "none",
      }}
      onFocus={e => e.target.style.borderColor = "#0d1b5e"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    >
      <option value="">Select...</option>
      {options.map(o => (
        <option key={o} value={o} style={{ color: "#111" }}>{o}</option>
      ))}
    </select>
  </div>
)

export const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e8e8e0",
    boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    ...style
  }}>
    {children}
  </div>
)

export const Badge = ({ children, color = "#0d1b5e", bg = "#e8ecf8" }) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: bg,
    color,
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: 20,
    whiteSpace: "nowrap",
  }}>
    {children}
  </span>
)

export const ErrBox = ({ msg }) => msg ? (
  <div style={{
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#991b1b",
    fontSize: "0.82rem",
    marginBottom: 16,
    display: "flex",
    gap: 8,
    alignItems: "center",
  }}>
    <Ic d={I.x} s={15} stroke="#991b1b" />
    {msg}
  </div>
) : null