export default function Logo({ size = "md" }) {
  const sizes = { sm: 28, md: 36, lg: 52 }

  return (
    <img
      src="/logo.png"
      alt="Arleese Nigeria"
      style={{
        height: sizes[size],
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  )
}