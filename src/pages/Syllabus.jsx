import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useSyllabus } from '../hooks/useSyllabus'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  BookOpen, CheckCircle, Clock, RotateCcw, Circle, ChevronDown,
  ChevronRight, Plus, Trash2, X, Filter, TrendingUp, Target,
  Award, Flame,
} from 'lucide-react'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', navy: '#0f172a', navyLight: '#1e293b',
  slate: '#334155', muted: '#94a3b8', border: '#e2e8f0', bg: '#f8fafc', white: '#fff',
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: '#94a3b8', bg: '#f8fafc', icon: Circle },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
  revised: { label: 'Revised', color: '#3b82f6', bg: '#eff6ff', icon: RotateCcw },
  done: { label: 'Done', color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
}

const STATUSES = ['not_started', 'in_progress', 'revised', 'done']

const PAPER_COLORS = {
  'GS-I': { color: '#3b82f6', bg: '#eff6ff' },
  'GS-II': { color: '#22c55e', bg: '#f0fdf4' },
  'GS-III': { color: '#f59e0b', bg: '#fffbeb' },
  'GS-IV': { color: '#a855f7', bg: '#faf5ff' },
  'Prelims': { color: '#14b8a6', bg: '#f0fdfa' },
  'CSAT': { color: '#6366f1', bg: '#eef2ff' },
  'Essay': { color: '#ec4899', bg: '#fdf2f8' },
  'Optional': { color: '#64748b', bg: '#f8fafc' },
}

function getPaperStyle(paper) {
  return PAPER_COLORS[paper] || { color: '#64748b', bg: '#f8fafc' }
}

function StatusBadge({ status, small }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  const Icon = cfg.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '2px 8px' : '4px 10px', borderRadius: 20,
      fontSize: small ? 10 : 11, fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      <Icon size={small ? 10 : 12} /> {cfg.label}
    </span>
  )
}

function ProgressBar({ done, revised, inProgress, total }) {
  if (total === 0) return null
  const doneP = (done / total) * 100
  const revisedP = (revised / total) * 100
  const ipP = (inProgress / total) * 100
  return (
    <div style={{
      width: '100%', height: 8, borderRadius: 4,
      background: '#f1f5f9', overflow: 'hidden',
      display: 'flex',
    }}>
      <div style={{ width: `${doneP}%`, background: '#22c55e', transition: 'width 0.3s' }} />
      <div style={{ width: `${revisedP}%`, background: '#3b82f6', transition: 'width 0.3s' }} />
      <div style={{ width: `${ipP}%`, background: '#f59e0b', transition: 'width 0.3s' }} />
    </div>
  )
}

function daysAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default function Syllabus() {
  const { templates, progress, progressMap, loading, error, setTopicStatus, markRevision, addCustomTopic, deleteCustomTopic, refetch } = useSyllabus()
  const [expandedPapers, setExpandedPapers] = useState({})
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaper, setFilterPaper] = useState('all')
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customPaper, setCustomPaper] = useState('GS-I')
  const [customTopic, setCustomTopic] = useState('')
  const [statusDropdown, setStatusDropdown] = useState(null) // templateId or progressId

  // Group templates by paper, then by topic
  const paperGroups = useMemo(() => {
    const groups = {}
    templates
      .filter(t => t.exam_type === 'UPSC CSE')
      .forEach(t => {
        if (!groups[t.paper]) groups[t.paper] = {}
        if (!groups[t.paper][t.topic]) groups[t.paper][t.topic] = []
        groups[t.paper][t.topic].push(t)
      })
    return groups
  }, [templates])

  // Custom topics grouped by paper
  const customTopics = useMemo(() => {
    return progress.filter(p => !p.template_id && p.custom_topic)
  }, [progress])

  // Stats
  const stats = useMemo(() => {
    const allTemplateIds = templates.filter(t => t.exam_type === 'UPSC CSE').map(t => t.id)
    const total = allTemplateIds.length + customTopics.length
    let done = 0, revised = 0, inProgress = 0, notStarted = 0

    allTemplateIds.forEach(id => {
      const p = progressMap[id]
      const s = p?.status || 'not_started'
      if (s === 'done') done++
      else if (s === 'revised') revised++
      else if (s === 'in_progress') inProgress++
      else notStarted++
    })

    customTopics.forEach(ct => {
      if (ct.status === 'done') done++
      else if (ct.status === 'revised') revised++
      else if (ct.status === 'in_progress') inProgress++
      else notStarted++
    })

    const completion = total > 0 ? Math.round(((done + revised) / total) * 100) : 0
    return { total, done, revised, inProgress, notStarted, completion }
  }, [templates, progressMap, customTopics])

  // Per-paper stats
  const paperStats = useMemo(() => {
    const result = {}
    templates
      .filter(t => t.exam_type === 'UPSC CSE')
      .forEach(t => {
        if (!result[t.paper]) result[t.paper] = { total: 0, done: 0, revised: 0, inProgress: 0 }
        result[t.paper].total++
        const s = progressMap[t.id]?.status || 'not_started'
        if (s === 'done') result[t.paper].done++
        else if (s === 'revised') result[t.paper].revised++
        else if (s === 'in_progress') result[t.paper].inProgress++
      })
    return result
  }, [templates, progressMap])

  const togglePaper = (paper) => {
    setExpandedPapers(prev => ({ ...prev, [paper]: !prev[paper] }))
  }

  const handleAddCustom = async () => {
    if (!customTopic.trim()) return
    await addCustomTopic(customPaper, customTopic.trim())
    setCustomTopic('')
    setShowAddCustom(false)
  }

  const cycleStatus = async (templateId) => {
    const current = progressMap[templateId]?.status || 'not_started'
    const idx = STATUSES.indexOf(current)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    await setTopicStatus(templateId, next)
  }

  if (loading) return <LoadingSpinner />

  if (templates.length === 0) {
    return (
      <EmptyState
        title="Syllabus not loaded"
        subtitle="Run the syllabus migration (010_syllabus_tracker.sql) in your Supabase SQL Editor to load the UPSC CSE syllabus."
      />
    )
  }

  const papers = Object.keys(paperGroups)

  return (
    <div>
      {/* Stats cards */}
      <div className="syllabus-stats" style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24,
      }}>
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={16} color={C.teal} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase' }}>Completion</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.navy }}>{stats.completion}%</div>
          <ProgressBar done={stats.done} revised={stats.revised} inProgress={stats.inProgress} total={stats.total} />
        </div>
        {[
          { label: 'Total Topics', value: stats.total, icon: BookOpen, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Done', value: stats.done, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'Revised', value: stats.revised, icon: RotateCcw, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase' }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.navy }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Add Custom */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 13, fontWeight: 500, color: C.slate, background: C.white, cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          {/* Paper filter */}
          <select
            value={filterPaper}
            onChange={e => setFilterPaper(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 13, fontWeight: 500, color: C.slate, background: C.white, cursor: 'pointer',
            }}
          >
            <option value="all">All Papers</option>
            {papers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddCustom(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.slate, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <Plus size={14} /> Add Custom Topic
        </button>
      </div>

      {/* Add custom topic form */}
      {showAddCustom && (
        <div style={{
          background: C.white, border: `1px solid ${C.teal}40`, borderRadius: 12,
          padding: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap',
        }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Paper</label>
            <select
              value={customPaper}
              onChange={e => setCustomPaper(e.target.value)}
              style={{
                padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                fontSize: 13, color: C.slate, background: C.white,
              }}
            >
              {papers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>Topic Name</label>
            <input
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder="e.g., Ancient Indian History — Vedic Period"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
                fontSize: 13, color: C.slate, outline: 'none', boxSizing: 'border-box',
              }}
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            />
          </div>
          <button onClick={handleAddCustom} style={{
            padding: '8px 16px', background: C.teal, border: 'none', borderRadius: 8,
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Add
          </button>
          <button onClick={() => setShowAddCustom(false)} style={{
            padding: '8px', background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <X size={16} color={C.muted} />
          </button>
        </div>
      )}

      {/* Paper sections */}
      {papers
        .filter(p => filterPaper === 'all' || filterPaper === p)
        .map(paper => {
          const ps = paperStats[paper] || { total: 0, done: 0, revised: 0, inProgress: 0 }
          const pStyle = getPaperStyle(paper)
          const expanded = expandedPapers[paper] !== false // default expanded
          const topics = paperGroups[paper]
          const paperCustom = customTopics.filter(ct => ct.custom_paper === paper)

          return (
            <div key={paper} style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
              marginBottom: 14, overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              {/* Paper header */}
              <button
                onClick={() => togglePaper(paper)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: expanded ? `1px solid #f1f5f9` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {expanded
                    ? <ChevronDown size={16} color={C.muted} />
                    : <ChevronRight size={16} color={C.muted} />
                  }
                  <span style={{
                    padding: '3px 10px', borderRadius: 6,
                    background: pStyle.bg, color: pStyle.color,
                    fontSize: 12, fontWeight: 800,
                  }}>
                    {paper}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                    {Object.keys(topics).length} topics
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 120 }}>
                    <ProgressBar done={ps.done} revised={ps.revised} inProgress={ps.inProgress} total={ps.total} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ps.total > 0 ? C.teal : C.muted }}>
                    {ps.total > 0 ? Math.round(((ps.done + ps.revised) / ps.total) * 100) : 0}%
                  </span>
                </div>
              </button>

              {/* Topics list */}
              {expanded && (
                <div>
                  {Object.entries(topics).map(([topicName, subtopics]) => (
                    <div key={topicName}>
                      {subtopics
                        .filter(st => {
                          if (filterStatus === 'all') return true
                          const s = progressMap[st.id]?.status || 'not_started'
                          return s === filterStatus
                        })
                        .map(st => {
                          const prog = progressMap[st.id]
                          const currentStatus = prog?.status || 'not_started'
                          const statusCfg = STATUS_CONFIG[currentStatus]
                          const lastStudied = prog?.last_studied ? daysAgo(prog.last_studied) : null
                          const revCount = prog?.revision_count || 0

                          return (
                            <div
                              key={st.id}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 18px', borderBottom: '1px solid #f8fafc',
                                gap: 12, transition: 'background 0.1s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {/* Status cycle button */}
                              <button
                                onClick={() => cycleStatus(st.id)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                  display: 'flex', flexShrink: 0,
                                }}
                                title={`Click to cycle: ${STATUSES.map(s => STATUS_CONFIG[s].label).join(' → ')}`}
                              >
                                <statusCfg.icon
                                  size={18}
                                  color={statusCfg.color}
                                  fill={currentStatus === 'done' ? statusCfg.color : 'none'}
                                />
                              </button>

                              {/* Topic info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.navyLight }}>
                                  {st.topic}
                                </div>
                                {st.subtopic && (
                                  <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                                    {st.subtopic}
                                  </div>
                                )}
                              </div>

                              {/* Meta info */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                {revCount > 0 && (
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, color: '#3b82f6',
                                    background: '#eff6ff', padding: '2px 7px', borderRadius: 4,
                                    display: 'flex', alignItems: 'center', gap: 3,
                                  }}>
                                    <RotateCcw size={9} /> {revCount}
                                  </span>
                                )}
                                {lastStudied && (
                                  <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                                    {lastStudied}
                                  </span>
                                )}
                                <StatusBadge status={currentStatus} small />
                                {/* Revise button */}
                                {prog && (currentStatus === 'revised' || currentStatus === 'done') && (
                                  <button
                                    onClick={() => markRevision(prog.id)}
                                    title="Mark another revision"
                                    style={{
                                      background: '#eff6ff', border: 'none', borderRadius: 6,
                                      padding: '4px 8px', cursor: 'pointer', display: 'flex',
                                      alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600,
                                      color: '#3b82f6', transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                                  >
                                    <RotateCcw size={10} /> Revise
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ))}

                  {/* Custom topics for this paper */}
                  {paperCustom
                    .filter(ct => filterStatus === 'all' || ct.status === filterStatus)
                    .map(ct => {
                      const statusCfg = STATUS_CONFIG[ct.status]
                      return (
                        <div
                          key={ct.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 18px', borderBottom: '1px solid #f8fafc',
                            gap: 12, background: '#fefce820',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fefce8'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fefce820'}
                        >
                          <button
                            onClick={async () => {
                              const idx = STATUSES.indexOf(ct.status)
                              const next = STATUSES[(idx + 1) % STATUSES.length]
                              await supabase
                                .from('syllabus_progress')
                                .update({ status: next, updated_at: new Date().toISOString() })
                                .eq('id', ct.id)
                              await refetch()
                            }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              display: 'flex', flexShrink: 0,
                            }}
                          >
                            <statusCfg.icon size={18} color={statusCfg.color}
                              fill={ct.status === 'done' ? statusCfg.color : 'none'} />
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.navyLight }}>
                              {ct.custom_topic}
                              <span style={{
                                marginLeft: 8, fontSize: 10, fontWeight: 600,
                                color: '#f59e0b', background: '#fffbeb',
                                padding: '1px 6px', borderRadius: 4,
                              }}>Custom</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <StatusBadge status={ct.status} small />
                            <button
                              onClick={() => deleteCustomTopic(ct.id)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                display: 'flex', borderRadius: 6,
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <Trash2 size={13} color="#ef4444" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center',
        padding: '20px 0', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Click the icon to cycle status:</span>
        {STATUSES.map(s => (
          <StatusBadge key={s} status={s} small />
        ))}
      </div>

      <style>{`
        .syllabus-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) {
          .syllabus-stats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .syllabus-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
