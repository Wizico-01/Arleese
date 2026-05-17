export default function Logo({ size = "md" }) {
  const sizes = { sm: 22, md: 30, lg: 48 }

  return (
    <img
      src="/logo-nav.png"
      alt="Arleece Nigeria"
      style={{
        height: sizes[size],
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  )
}