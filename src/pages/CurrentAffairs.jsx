import { useState, useCallback } from 'react'
import { useCurrentAffairs } from '../hooks/useCurrentAffairs'
import { useStudySessions } from '../hooks/useStudySessions'
import { useTasks } from '../hooks/useTasks'
import { fetchGoogleNews } from '../lib/newsFetcher'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Trash2, BookOpen, CheckSquare, Eye, EyeOff, ExternalLink, X, Loader, Globe, RefreshCw, Rss } from 'lucide-react'

// UPSC GS Paper mapped categories
const CATEGORIES = [
  'Polity & Governance',
  'Economy',
  'International Relations',
  'Environment & Ecology',
  'Science & Technology',
  'Social Issues',
  'Security & Defence',
  'Art & Culture',
  'Sports',
  'General',
]

const CATEGORY_COLORS = {
  'Polity & Governance': '#ef4444',
  'Economy': '#f59e0b',
  'International Relations': '#a855f7',
  'Environment & Ecology': '#22c55e',
  'Science & Technology': '#3b82f6',
  'Social Issues': '#ec4899',
  'Security & Defence': '#64748b',
  'Art & Culture': '#f97316',
  'Sports': '#06b6d4',
  'General': '#94a3b8',
}

// Maps categories to GS Paper numbers for UPSC Mains
const GS_PAPER_MAP = {
  'Polity & Governance': 'GS-II',
  'Economy': 'GS-III',
  'International Relations': 'GS-II',
  'Environment & Ecology': 'GS-III',
  'Science & Technology': 'GS-III',
  'Social Issues': 'GS-I / GS-II',
  'Security & Defence': 'GS-III',
  'Art & Culture': 'GS-I',
  'Sports': 'General',
  'General': 'Prelims',
}

const todayStr = () => new Date().toISOString().split('T')[0]

function formatDateHeading(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function isToday(dateStr) {
  return dateStr === todayStr()
}

function isThisWeek(dateStr) {
  const today = new Date()
  const d = new Date(dateStr + 'T00:00:00')
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return d >= startOfWeek && d <= endOfWeek
}

export default function CurrentAffairs() {
  const { affairs, loading, error, addAffair, addBulkAffairs, deleteAffair, toggleRead, markAddedToStudy } = useCurrentAffairs()
  const { addSession } = useStudySessions()
  const { addTask } = useTasks()

  const [showForm, setShowForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')
  const [dateFilter, setDateFilter] = useState('Today')
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    summary: '',
    source_url: '',
    date: todayStr(),
  })
  const [submitting, setSubmitting] = useState(false)
  const [fetchingNews, setFetchingNews] = useState(false)
  const [newsError, setNewsError] = useState(null)
  const [fetchProgress, setFetchProgress] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSubmitting(true)
    const ok = await addAffair(formData.title.trim(), formData.category, formData.summary.trim() || null, formData.source_url.trim() || null, formData.date)
    if (ok) {
      setFormData({ title: '', category: 'General', summary: '', source_url: '', date: todayStr() })
      setShowForm(false)
    }
    setSubmitting(false)
  }

  const handleAddToStudy = async (affair) => {
    const gsPaper = GS_PAPER_MAP[affair.category] || 'General'
    await addSession(
      `Current Affairs (${gsPaper}): ${affair.category}`,
      30,
      affair.date,
      `${affair.title}${affair.summary ? '\n\n' + affair.summary : ''}`
    )
    await markAddedToStudy(affair.id)
  }

  const handleAddAsTask = async (affair) => {
    const gsPaper = GS_PAPER_MAP[affair.category] || ''
    await addTask(`[${gsPaper}] Read: ${affair.title}`, todayStr(), 'medium')
  }

  const handleFetchNews = useCallback(async () => {
    setFetchingNews(true)
    setNewsError(null)
    setFetchProgress('Fetching from The Hindu, Indian Express, NDTV, LiveMint...')

    try {
      const items = await fetchGoogleNews()

      if (!items.length) {
        throw new Error('Could not fetch news. Please check your internet connection and try again.')
      }

      setFetchProgress(`Categorizing ${items.length} articles by GS Papers...`)

      const existingTitles = new Set(
        affairs.filter((a) => isToday(a.date)).map((a) => a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40))
      )

      const newItems = items
        .filter((item) => {
          const titleKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
          return !existingTitles.has(titleKey)
        })
        .map((item) => ({
          title: item.title,
          category: item.category,
          summary: item.summary || null,
          source_url: item.source_url || null,
          date: todayStr(),
        }))

      if (newItems.length === 0) {
        setFetchProgress('')
        setNewsError("No new articles to add. Today's news may already be saved.")
      } else {
        setFetchProgress(`Saving ${newItems.length} articles...`)
        const added = await addBulkAffairs(newItems)
        setFetchProgress('')
        if (added === 0) {
          setNewsError('Failed to save articles. Please try again.')
        }
      }
    } catch (err) {
      setNewsError(err.message || 'Failed to fetch news')
      setFetchProgress('')
    } finally {
      setFetchingNews(false)
    }
  }, [affairs, addAffair])

  // Filter
  let filtered = affairs
  if (filterCategory !== 'All') {
    filtered = filtered.filter((a) => a.category === filterCategory)
  }
  if (dateFilter === 'Today') {
    filtered = filtered.filter((a) => isToday(a.date))
  } else if (dateFilter === 'This Week') {
    filtered = filtered.filter((a) => isThisWeek(a.date))
  }

  // Stats
  const todayAffairs = affairs.filter((a) => isToday(a.date))
  const todayRead = todayAffairs.filter((a) => a.is_read)
  const addedToStudyCount = affairs.filter((a) => a.added_to_study).length

  // Category-wise count for today
  const categoryCounts = {}
  todayAffairs.forEach((a) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1
  })

  // Group by date
  const grouped = {}
  filtered.forEach((a) => {
    if (!grouped[a.date]) grouped[a.date] = []
    grouped[a.date].push(a)
  })
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  if (loading) return <LoadingSpinner />

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Current Affairs</h1>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
            UPSC / State PSC — Daily News Digest
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '8px 12px', fontSize: 13 }}
          >
            <option value="All">All Topics</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c} ({GS_PAPER_MAP[c]})</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              color: '#14b8a6',
              border: '1px solid #14b8a6',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {/* Fetch News Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f0f9ff 100%)',
        border: '1px solid #99f6e4',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 16,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Globe size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                Daily News for UPSC / State PSC
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Auto-categorized by GS Paper topics
              </div>
            </div>
          </div>
          <button
            onClick={handleFetchNews}
            disabled={fetchingNews}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              background: fetchingNews ? '#94a3b8' : 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: fetchingNews ? 'not-allowed' : 'pointer',
              boxShadow: fetchingNews ? 'none' : '0 2px 8px rgba(20, 184, 166, 0.3)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {fetchingNews ? (
              <>
                <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Fetching...
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                {"Fetch Today's News"}
              </>
            )}
          </button>
        </div>

        {fetchProgress && (
          <div style={{
            marginTop: 10,
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: 6,
            fontSize: 12,
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
            {fetchProgress}
          </div>
        )}

        {/* Sources */}
        <div style={{
          marginTop: 10,
          display: 'flex',
          gap: 10,
          fontSize: 11,
          color: '#94a3b8',
          flexWrap: 'wrap',
        }}>
          {['The Hindu', 'Indian Express', 'NDTV', 'LiveMint', 'TOI', 'Down To Earth'].map((s) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Rss size={9} /> {s}
            </span>
          ))}
        </div>
      </div>

      {/* News Error */}
      {newsError && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          borderRadius: 8,
          fontSize: 13,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{newsError}</span>
          <button onClick={() => setNewsError(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{todayAffairs.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>Today's Articles</div>
        </div>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#14b8a6' }}>{todayRead.length}/{todayAffairs.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>Read Progress</div>
        </div>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#a855f7' }}>{addedToStudyCount}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>Added to Study</div>
        </div>
      </div>

      {/* GS Paper Quick Filters (pill tags showing category counts) */}
      {todayAffairs.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}>
          {CATEGORIES.filter((c) => categoryCounts[c]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? 'All' : cat)}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 999,
                border: filterCategory === cat ? `2px solid ${CATEGORY_COLORS[cat]}` : '1px solid #e2e8f0',
                backgroundColor: filterCategory === cat ? `${CATEGORY_COLORS[cat]}15` : '#ffffff',
                color: CATEGORY_COLORS[cat],
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s',
              }}
            >
              {cat}
              <span style={{
                backgroundColor: CATEGORY_COLORS[cat],
                color: '#fff',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
              }}>
                {categoryCounts[cat]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* DB Error */}
      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>Add Manually</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Supreme Court ruling on Article 370"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>GS Topic</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={inputStyle}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c} ({GS_PAPER_MAP[c]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Key Points / Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary for revision notes"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Source URL</label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 20px', backgroundColor: '#14b8a6', color: '#ffffff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Adding...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Date filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['Today', 'This Week', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => setDateFilter(tab)}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              backgroundColor: dateFilter === tab ? '#14b8a6' : '#f1f5f9',
              color: dateFilter === tab ? '#ffffff' : '#475569',
              transition: 'background-color 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Affairs list */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji={String.fromCodePoint(0x1F4F0)}
          title="No current affairs yet"
          subtitle={"Click \"Fetch Today's News\" to get UPSC-relevant headlines"}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {formatDateHeading(date)}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[date].map((affair) => {
                  const gsPaper = GS_PAPER_MAP[affair.category]
                  return (
                    <div
                      key={affair.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: `3px solid ${CATEGORY_COLORS[affair.category] || '#94a3b8'}`,
                        borderRadius: '4px 12px 12px 4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        padding: 16,
                      }}
                    >
                      {/* Top row: GS tag + category badge + title */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: affair.summary ? 8 : 0, flexWrap: 'wrap' }}>
                        {gsPaper && gsPaper !== 'General' && gsPaper !== 'Prelims' && (
                          <span style={{
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 4,
                            backgroundColor: '#1e293b',
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            marginTop: 2,
                            letterSpacing: 0.5,
                          }}>
                            {gsPaper}
                          </span>
                        )}
                        {gsPaper === 'Prelims' && (
                          <span style={{
                            padding: '2px 8px',
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 4,
                            backgroundColor: '#14b8a6',
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            marginTop: 2,
                            letterSpacing: 0.5,
                          }}>
                            Prelims
                          </span>
                        )}
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 999,
                          backgroundColor: `${CATEGORY_COLORS[affair.category] || '#64748b'}18`,
                          color: CATEGORY_COLORS[affair.category] || '#64748b',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          marginTop: 2,
                        }}>
                          {affair.category}
                        </span>
                        <span style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: affair.is_read ? '#94a3b8' : '#1e293b',
                          textDecoration: affair.is_read ? 'line-through' : 'none',
                          lineHeight: 1.4,
                          flex: 1,
                        }}>
                          {affair.title}
                        </span>
                      </div>

                      {/* Summary */}
                      {affair.summary && (
                        <p style={{
                          fontSize: 13,
                          color: '#475569',
                          margin: '0 0 8px 0',
                          lineHeight: 1.6,
                          paddingLeft: gsPaper ? 0 : 0,
                        }}>
                          {affair.summary}
                        </p>
                      )}

                      {/* Source URL */}
                      {affair.source_url && (
                        <a
                          href={affair.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            color: '#14b8a6',
                            textDecoration: 'none',
                            marginBottom: 8,
                          }}
                        >
                          <ExternalLink size={12} />
                          Read full article
                        </a>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                        <button
                          onClick={() => toggleRead(affair.id, affair.is_read)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', fontSize: 12, fontWeight: 500,
                            border: affair.is_read ? '1px solid #d1fae5' : '1px solid #e2e8f0',
                            borderRadius: 6,
                            backgroundColor: affair.is_read ? '#ecfdf5' : 'transparent',
                            color: affair.is_read ? '#059669' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {affair.is_read ? <EyeOff size={13} /> : <Eye size={13} />}
                          {affair.is_read ? 'Completed' : 'Mark Read'}
                        </button>

                        <button
                          onClick={() => handleAddToStudy(affair)}
                          disabled={affair.added_to_study}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', fontSize: 12, fontWeight: 500,
                            border: affair.added_to_study ? '1px solid #d1fae5' : '1px solid #14b8a6',
                            borderRadius: 6,
                            backgroundColor: affair.added_to_study ? '#ecfdf5' : 'transparent',
                            color: affair.added_to_study ? '#059669' : '#14b8a6',
                            cursor: affair.added_to_study ? 'default' : 'pointer',
                            opacity: affair.added_to_study ? 0.8 : 1,
                          }}
                        >
                          <BookOpen size={13} />
                          {affair.added_to_study ? 'In Study Log \u2713' : 'Add to Study'}
                        </button>

                        <button
                          onClick={() => handleAddAsTask(affair)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', fontSize: 12, fontWeight: 500,
                            border: '1px solid #e2e8f0', borderRadius: 6,
                            backgroundColor: 'transparent', color: '#475569', cursor: 'pointer',
                          }}
                        >
                          <CheckSquare size={13} />
                          Make Note
                        </button>

                        <button
                          onClick={() => deleteAffair(affair.id)}
                          style={{
                            display: 'flex', alignItems: 'center',
                            padding: '5px 8px', fontSize: 12,
                            border: '1px solid #e2e8f0', borderRadius: 6,
                            backgroundColor: 'transparent', color: '#94a3b8',
                            cursor: 'pointer', marginLeft: 'auto',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
