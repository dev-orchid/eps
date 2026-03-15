import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizAnalytics } from '../hooks/useQuizAnalytics'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  TrendingUp, Target, CheckCircle, XCircle, Clock, Brain,
  AlertTriangle, Award, Flame, BarChart3, ArrowUp, ArrowDown,
  Minus, Zap, BookOpen, ArrowLeft,
} from 'lucide-react'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', navy: '#0f172a', navyLight: '#1e293b',
  slate: '#334155', muted: '#94a3b8', border: '#e2e8f0', bg: '#f8fafc', white: '#fff',
  green: '#22c55e', red: '#ef4444', yellow: '#f59e0b', blue: '#3b82f6', purple: '#a855f7',
}

const PAPER_COLORS = {
  'GS-I': '#3b82f6', 'GS-II': '#22c55e', 'GS-III': '#f59e0b',
  'GS-IV': '#a855f7', 'Prelims': '#14b8a6',
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: '18px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: bg || '#f0fdfa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color || C.teal} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.navy }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || C.teal, borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  )
}

function ScoreChart({ data }) {
  if (!data.length) return null
  const maxScore = 100
  const chartH = 160
  const barW = Math.min(36, Math.floor(500 / data.length))

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 4,
        height: chartH + 30, minWidth: data.length * (barW + 4),
        padding: '0 4px',
      }}>
        {data.map((d, i) => {
          const h = (d.score / maxScore) * chartH
          const color = d.score >= 70 ? C.green : d.score >= 40 ? C.yellow : C.red
          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, flex: 'none',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color }}>{d.score}%</span>
              <div style={{
                width: barW, height: h, borderRadius: '4px 4px 0 0',
                background: color, opacity: 0.8, transition: 'height 0.3s',
                minHeight: 4,
              }} />
              <span style={{
                fontSize: 8, color: C.muted, whiteSpace: 'nowrap',
                transform: 'rotate(-45deg)', transformOrigin: 'center',
                width: barW, textAlign: 'center', marginTop: 2,
              }}>
                {d.date}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AccuracyRing({ value, size = 80, strokeWidth = 8, color }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const displayColor = color || (value >= 70 ? C.green : value >= 40 ? C.yellow : C.red)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={displayColor}
          strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.22, fontWeight: 900, color: C.navy,
      }}>
        {value}%
      </div>
    </div>
  )
}

export default function QuizAnalytics() {
  const navigate = useNavigate()
  const {
    loading, overallStats, subjectPerformance, scoreTrend,
    difficultyStats, weakAreas, strongAreas, recentAttempts, totalAttempts,
  } = useQuizAnalytics()
  const [activeTab, setActiveTab] = useState('overview')

  if (loading) return <LoadingSpinner />

  if (!overallStats || totalAttempts === 0) {
    return (
      <EmptyState
        title="No quiz data yet"
        subtitle="Complete some quizzes first, then come back to see your performance analytics."
      />
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'subjects', label: 'Subject Analysis' },
    { id: 'history', label: 'Attempt History' },
  ]

  return (
    <div>
      {/* Back + Tabs row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <button onClick={() => navigate('/quiz')} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
          fontSize: 13, fontWeight: 500, color: C.slate, cursor: 'pointer',
          transition: 'all 0.15s', flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.bg}
          onMouseLeave={e => e.currentTarget.style.background = C.white}
        >
          <ArrowLeft size={15} /> Back to Quiz
        </button>

      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: 4, background: '#f1f5f9',
        borderRadius: 12, padding: 4, width: 'fit-content',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === t.id ? C.white : 'transparent',
              color: activeTab === t.id ? C.navy : C.muted,
              boxShadow: activeTab === t.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div>
          {/* Top stats */}
          <div className="qa-stats-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24,
          }}>
            <StatCard icon={Target} label="Accuracy" value={`${overallStats.accuracy}%`}
              sub={`${overallStats.totalCorrect} correct of ${overallStats.totalCorrect + overallStats.totalWrong} attempted`}
              color={C.teal} bg="#f0fdfa" />
            <StatCard icon={BarChart3} label="Avg Score" value={`${overallStats.avgScore}%`}
              sub={`Best: ${overallStats.bestScore}%`}
              color={C.blue} bg="#eff6ff" />
            <StatCard icon={Zap} label="Quizzes Taken" value={overallStats.totalAttempts}
              sub={`${overallStats.totalQuestions} total questions`}
              color={C.purple} bg="#faf5ff" />
            <StatCard icon={CheckCircle} label="Correct" value={overallStats.totalCorrect}
              color={C.green} bg="#f0fdf4" />
            <StatCard icon={Clock} label="Avg Time" value={`${Math.floor(overallStats.avgTime / 60)}m`}
              sub={`${overallStats.avgTime}s per quiz`}
              color={C.yellow} bg="#fffbeb" />
          </div>

          {/* Score Trend + Accuracy Ring */}
          <div className="qa-main-grid" style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24,
          }}>
            {/* Score trend chart */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: 20, overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={16} color={C.teal} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Score Trend</span>
                <span style={{ fontSize: 11, color: C.muted }}>(last {scoreTrend.length} attempts)</span>
              </div>
              {scoreTrend.length > 1 ? (
                <ScoreChart data={scoreTrend} />
              ) : (
                <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: 40 }}>
                  Complete more quizzes to see your score trend
                </p>
              )}
            </div>

            {/* Difficulty breakdown */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Brain size={16} color={C.purple} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>By Difficulty</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {difficultyStats.map(({ level, total, correct, accuracy }) => {
                  const colors = { easy: C.green, medium: C.yellow, hard: C.red }
                  return (
                    <div key={level}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, textTransform: 'capitalize' }}>
                          {level}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors[level] }}>
                          {accuracy}% ({correct}/{total})
                        </span>
                      </div>
                      <MiniBar value={accuracy} max={100} color={colors[level]} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Weak & Strong areas */}
          <div className="qa-areas-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
          }}>
            {/* Weak areas */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={16} color={C.red} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Weak Areas</span>
                <span style={{ fontSize: 11, color: C.muted }}>(&lt;50% accuracy)</span>
              </div>
              {weakAreas.length === 0 ? (
                <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: 20 }}>
                  No weak areas detected! Keep it up.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {weakAreas.map(s => (
                    <div key={s.subjectId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 10, background: '#fef2f2',
                      border: '1px solid #fecaca',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navyLight }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {s.paper} &middot; {s.correct}/{s.total} correct
                        </div>
                      </div>
                      <div style={{
                        fontSize: 16, fontWeight: 800,
                        color: C.red,
                      }}>
                        {s.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strong areas */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Award size={16} color={C.green} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Strong Areas</span>
                <span style={{ fontSize: 11, color: C.muted }}>(&ge;70% accuracy)</span>
              </div>
              {strongAreas.length === 0 ? (
                <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: 20 }}>
                  Practice more to identify your strengths
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {strongAreas.map(s => (
                    <div key={s.subjectId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 10, background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navyLight }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          {s.paper} &middot; {s.correct}/{s.total} correct
                        </div>
                      </div>
                      <div style={{
                        fontSize: 16, fontWeight: 800,
                        color: C.green,
                      }}>
                        {s.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SUBJECTS TAB ─── */}
      {activeTab === 'subjects' && (
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div className="qa-subj-header" style={{
            display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.6fr 0.6fr 0.6fr 0.8fr 0.5fr',
            padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg, gap: 8,
          }}>
            {['Subject', 'Paper', 'Total', 'Correct', 'Wrong', 'Accuracy', 'Avg Time'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>
          {subjectPerformance.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>
              No subject data yet. Complete some quizzes!
            </div>
          ) : (
            subjectPerformance.map((s, i) => (
              <div key={s.subjectId} className="qa-subj-row" style={{
                display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.6fr 0.6fr 0.6fr 0.8fr 0.5fr',
                padding: '12px 18px', alignItems: 'center', gap: 8,
                borderBottom: i < subjectPerformance.length - 1 ? `1px solid #f8fafc` : 'none',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navyLight }}>{s.name}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: (PAPER_COLORS[s.paper] || C.muted) + '15',
                  color: PAPER_COLORS[s.paper] || C.muted,
                  width: 'fit-content',
                }}>
                  {s.paper}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>{s.total}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{s.correct}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{s.wrong}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MiniBar value={s.accuracy} max={100} color={s.accuracy >= 70 ? C.green : s.accuracy >= 40 ? C.yellow : C.red} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'right',
                    color: s.accuracy >= 70 ? C.green : s.accuracy >= 40 ? C.yellow : C.red,
                  }}>
                    {s.accuracy}%
                  </span>
                </div>
                <span style={{ fontSize: 12, color: C.muted }}>{s.avgTime}s</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── HISTORY TAB ─── */}
      {activeTab === 'history' && (
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
          overflow: 'hidden',
        }}>
          <div className="qa-hist-header" style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 0.7fr 0.7fr 0.8fr 1fr',
            padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg, gap: 8,
          }}>
            {['Date', 'Type', 'Questions', 'Correct', 'Wrong', 'Score', 'Time'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>
          {recentAttempts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>
              No completed quizzes yet.
            </div>
          ) : (
            recentAttempts.map((a, i) => {
              const pct = a.score_percentage || 0
              const scoreColor = pct >= 70 ? C.green : pct >= 40 ? C.yellow : C.red
              const typeLabel = a.subjectName
                ? a.subjectName
                : a.quiz_type === 'full_mock' ? 'Full Mock'
                : a.quiz_type === 'daily' ? 'Daily Quiz'
                : a.paper || 'Custom'
              const dateStr = a.completed_at
                ? new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : ''
              const timeStr = a.time_taken_seconds
                ? `${Math.floor(a.time_taken_seconds / 60)}m ${a.time_taken_seconds % 60}s`
                : '-'

              return (
                <div key={a.id} className="qa-hist-row" style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 0.7fr 0.7fr 0.8fr 1fr',
                  padding: '12px 18px', alignItems: 'center', gap: 8,
                  borderBottom: i < recentAttempts.length - 1 ? `1px solid #f8fafc` : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.slate }}>{dateStr}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: C.navyLight,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {typeLabel}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>{a.total_questions}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{a.correct_answers}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{a.wrong_answers}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: scoreColor,
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    {Math.round(pct)}%
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>{timeStr}</span>
                </div>
              )
            })
          )}
        </div>
      )}

      <style>{`
        .qa-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
        .qa-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .qa-areas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) {
          .qa-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .qa-main-grid { grid-template-columns: 1fr !important; }
          .qa-areas-grid { grid-template-columns: 1fr !important; }
          .qa-subj-header, .qa-subj-row { grid-template-columns: 1.5fr 0.8fr 0.6fr 0.6fr 0.6fr 1fr 0.5fr !important; font-size: 11px; }
          .qa-hist-header, .qa-hist-row { grid-template-columns: 1.2fr 1fr 0.6fr 0.6fr 0.6fr 0.7fr 0.8fr !important; font-size: 11px; }
        }
        @media (max-width: 600px) {
          .qa-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
