const colors = {
  high: { bg: '#fef2f2', color: '#dc2626' },
  medium: { bg: '#fefce8', color: '#a16207' },
  low: { bg: '#f0fdf4', color: '#15803d' },
}

export default function PriorityBadge({ priority }) {
  const c = colors[priority] || colors.medium
  return (
    <span style={{
      display: 'inline-block',
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 999,
      textTransform: 'capitalize',
    }}>
      {priority}
    </span>
  )
}
