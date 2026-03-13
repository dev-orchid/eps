export default function CountdownBadge({ examDate }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(examDate + 'T00:00:00')
  const diffTime = exam - today
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let bg, color, text
  if (daysLeft < 0) {
    bg = '#f1f5f9'; color = '#64748b'; text = 'Completed'
  } else if (daysLeft === 0) {
    bg = '#fef2f2'; color = '#dc2626'; text = 'Today!'
  } else if (daysLeft <= 7) {
    bg = '#fef2f2'; color = '#dc2626'; text = `${daysLeft}d left`
  } else if (daysLeft <= 30) {
    bg = '#fefce8'; color = '#a16207'; text = `${daysLeft}d left`
  } else {
    bg = '#f0fdf4'; color = '#15803d'; text = `${daysLeft}d left`
  }

  return (
    <span style={{
      display: 'inline-block',
      background: bg,
      color,
      fontSize: 12,
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  )
}
