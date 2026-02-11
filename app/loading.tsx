export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #064e3b, #10b981)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <img
        src="/assets/feuille.png"
        alt="Chargement"
        style={{
          width: 80,
          height: 80,
          animation: "spin 1s linear infinite"
        }}
      />
      <p style={{ marginTop: 20, letterSpacing: 4 }}>CHARGEMENT…</p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
