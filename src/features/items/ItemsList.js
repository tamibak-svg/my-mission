export default function ItemsList({ items }) {
  if (!items?.length) return <p style={{ opacity: 0.7 }}>אין פריטים עדיין.</p>;

  return (
    <ul style={{ marginTop: 16, paddingLeft: 18 }}>
      {items.map((it) => (
        <li key={it.id} style={{ marginBottom: 8 }}>
          {it.title}
        </li>
      ))}
    </ul>
  );
}
