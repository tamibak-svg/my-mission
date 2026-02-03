export default function WorkScreen({ systems, onSelect, onBack }) {
  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ marginTop: 0 }}>בחר קטגוריה</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {systems?.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              padding: 14,
              textAlign: "right",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={onBack} style={{ marginTop: 18, padding: 10 }}>
        חזרה למסך פתיחה
      </button>
    </div>
  );
}
