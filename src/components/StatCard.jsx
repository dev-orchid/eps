export default function StatCard({ label, value, icon: Icon, color = '#14b8a6' }) {
  const pastelBg = color + '18'

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      {Icon && (
        <div style={{
          position: 'absolute',
          top: 14,
          right: 16,
          width: 42,
          height: 42,
          borderRadius: 12,
          background: pastelBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}>
          <Icon size={22} />
        </div>
      )}
      <p style={{
        fontSize: 13,
        color: '#64748b',
        fontWeight: 500,
        marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#1e293b',
        lineHeight: 1.2,
      }}>
        {value}
      </p>
    </div>
  )
}
