export default function EmptyState({ emoji = '📋', title, subtitle }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      gap: 8,
    }}>
      <span style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</span>
      <p style={{ color: '#1e293b', fontSize: 16, fontWeight: 600 }}>{title}</p>
      {subtitle && <p style={{ color: '#64748b', fontSize: 14 }}>{subtitle}</p>}
    </div>
  )
}
