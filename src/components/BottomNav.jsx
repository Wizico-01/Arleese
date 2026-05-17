import { Ic, I } from './Icons'

export default function BottomNav({ page, setPage, user }) {
  const tabs = user?.role === 'landlord'
    ? [
        { id: 'home', label: 'Home', icon: I.home },
        { id: 'browse', label: 'Browse', icon: I.search },
        { id: 'dashboard', label: 'Dashboard', icon: I.building },
        { id: 'profile', label: 'Profile', icon: I.user },
      ]
    : [
        { id: 'home', label: 'Home', icon: I.home },
        { id: 'browse', label: 'Browse', icon: I.search },
        { id: 'saved', label: 'Saved', icon: I.star },
        { id: 'profile', label: 'Profile', icon: I.user },
      ]

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      width: "100%",
      height: 65,
      background: "#fff",
      borderTop: "1px solid #e8e8e0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 999,
      boxShadow: "0 -2px 12px rgba(0,0,0,.08)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {tabs.map(tab => {
        const active = page === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px",
              borderRadius: 10,
              transition: "all .2s",
            }}
          >
            <div style={{ color: active ? "#0d1b5e" : "#9ca3af" }}>
              <Ic d={tab.icon} s={22} />
            </div>
            <span style={{
              fontSize: "0.68rem",
              fontWeight: active ? 700 : 400,
              color: active ? "#0d1b5e" : "#9ca3af",
            }}>
              {tab.label}
            </span>
            {active && (
              <div style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#0d1b5e",
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}