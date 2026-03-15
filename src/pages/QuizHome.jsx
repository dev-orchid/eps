import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import {
  BrainCircuit, Zap, BookOpen, Clock, Trophy, ChevronRight,
  Loader2, AlertCircle, Target, BarChart3, Flame, ChevronDown,
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const PAPERS = ['GS-I', 'GS-II', 'GS-III', 'GS-IV', 'Prelims', 'Science']
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', icon: '🟢', desc: 'Basics & fundamentals' },
  { key: 'medium', label: 'Medium', icon: '🟡', desc: 'Exam-level questions' },
  { key: 'hard', label: 'Hard', icon: '🔴', desc: 'Advanced & tricky' },
]
const COUNTS = [5, 10, 15, 20, 30, 50]
const EXAMS = ['All', 'UPSC Prelims', 'BPSC', 'UPPSC', 'MPSC', 'RPSC', 'WBPSC', 'SSC CGL']
const YEARS = ['', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016']

export default function QuizHome() {
  const navigate = useNavigate()
  const { subjects, attempts, loading, generateQuiz, getQuestionCounts } = useQuiz()
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedExam, setSelectedExam] = useState('All')
  const [selectedYear, setSelectedYear] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [questionCounts, setQuestionCounts] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    getQuestionCounts().then(setQuestionCounts)
  }, [getQuestionCounts])

  const completedAttempts = attempts.filter(a => a.status === 'completed')
  const avgScore = completedAttempts.length > 0
    ? (completedAttempts.reduce((s, a) => s + Number(a.score_percentage), 0) / completedAttempts.length).toFixed(0)
    : 0
  const totalCorrect = completedAttempts.reduce((s, a) => s + a.correct_answers, 0)
  const totalSolved = completedAttempts.reduce((s, a) => s + a.total_questions, 0)

  const filteredSubjects = selectedPaper
    ? subjects.filter(s => s.paper === selectedPaper)
    : subjects

  const canStart = selectedSubject || selectedPaper

  const handleStartQuiz = async () => {
    if (!canStart || generating) return
    setGenerating(true)
    setGenError(null)
    const result = await generateQuiz({
      subject_id: selectedSubject || null,
      paper: selectedPaper || subjects.find(s => s.id === selectedSubject)?.paper || 'Prelims',
      count: questionCount,
      difficulty,
      quiz_type: selectedSubject ? 'subject_practice' : 'full_mock',
      pyq_exam: selectedExam !== 'All' ? selectedExam : null,
      pyq_year: selectedYear ? parseInt(selectedYear) : null,
    })
    setGenerating(false)
    if (result.error) { setGenError(result.error); return }
    navigate('/quiz/play', { state: result.data })
  }

  if (loading) return <LoadingSpinner />

  // Selection summary for the button
  const selSub = subjects.find(s => s.id === selectedSubject)
  const summary = [
    selSub?.name || selectedPaper || 'Select a paper or subject',
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    `${questionCount} Qs`,
    selectedExam !== 'All' ? selectedExam : null,
    selectedYear || null,
  ].filter(Boolean).join(' · ')

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Stats Row */}
      <div className="quiz-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28,
      }}>
        {[
          { label: 'Quizzes', value: completedAttempts.length, icon: BrainCircuit, gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', light: '#e0f7f0' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: Trophy, gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', light: '#fef3c7' },
          { label: 'Solved', value: totalSolved, icon: Target, gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', light: '#dbeafe' },
          { label: 'Correct', value: totalCorrect, icon: Zap, gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', light: '#dcfce7' },
        ].map(({ label, value, icon: Icon, gradient, light }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 16, padding: '22px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)' }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              <Icon size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Quiz Setup Card */}
      <div style={{
        background: '#fff', borderRadius: 20, marginBottom: 28,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}>
        {/* Header with gradient accent */}
        <div style={{
          padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(180deg, #f0fdfa 0%, #fff 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Configure Your Quiz
            </h2>
          </div>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
            Practice with UPSC &amp; State PSC previous year questions and curated MCQs
          </p>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {genError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, marginBottom: 20,
              fontSize: 13, color: '#dc2626', fontWeight: 500,
            }}>
              <AlertCircle size={16} /> {genError}
            </div>
          )}

          {/* Step 1: Paper */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 800,
                background: '#14b8a6', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>1</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Select Paper</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PAPERS.map(p => {
                const active = selectedPaper === p
                const count = subjects.filter(s => s.paper === p).reduce((sum, s) => sum + (questionCounts[s.id] || 0), 0)
                return (
                  <button key={p} onClick={() => { setSelectedPaper(active ? null : p); setSelectedSubject(null) }}
                    style={{
                      padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
                      background: active ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : '#f1f5f9',
                      color: active ? '#fff' : '#334155',
                      boxShadow: active ? '0 2px 8px rgba(20,184,166,0.3)' : 'none',
                    }}>
                    {p}
                    {count > 0 && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                        background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: active ? '#fff' : '#94a3b8',
                      }}>{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Subject */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 800,
                background: selectedPaper ? '#14b8a6' : '#cbd5e1', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>2</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Select Subject</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>(optional — skip for mixed quiz)</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {filteredSubjects.map(s => {
                const active = selectedSubject === s.id
                const count = questionCounts[s.id] || 0
                return (
                  <button key={s.id} onClick={() => setSelectedSubject(active ? null : s.id)}
                    style={{
                      padding: '8px 16px', borderRadius: 10, border: active ? 'none' : '1px solid #e2e8f0',
                      cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500, transition: 'all 0.15s',
                      background: active ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : '#fff',
                      color: active ? '#fff' : '#334155',
                      boxShadow: active ? '0 2px 8px rgba(20,184,166,0.3)' : '0 1px 2px rgba(0,0,0,0.04)',
                    }}>
                    {s.name}
                    {count > 0 && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                        background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: active ? '#fff' : '#94a3b8',
                      }}>{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Difficulty */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 800,
                background: '#14b8a6', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>3</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Difficulty &amp; Count</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {DIFFICULTIES.map(d => {
                  const active = difficulty === d.key
                  return (
                    <button key={d.key} onClick={() => setDifficulty(d.key)}
                      style={{
                        flex: 1, padding: '14px 12px', borderRadius: 14, cursor: 'pointer',
                        border: active ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                        background: active ? '#f0fdfa' : '#fff',
                        textAlign: 'center', transition: 'all 0.15s',
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{d.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#0d9488' : '#334155' }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{d.desc}</div>
                    </button>
                  )
                })}
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 4,
                background: '#f8fafc', borderRadius: 14, padding: '12px 14px',
                border: '1px solid #e2e8f0', minWidth: 100,
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Questions</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {COUNTS.map(c => (
                    <button key={c} onClick={() => setQuestionCount(c)}
                      style={{
                        width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 700, transition: 'all 0.12s',
                        background: questionCount === c ? '#14b8a6' : '#fff',
                        color: questionCount === c ? '#fff' : '#334155',
                        boxShadow: questionCount === c ? '0 2px 6px rgba(20,184,166,0.3)' : '0 1px 2px rgba(0,0,0,0.06)',
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters (collapsible) */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: '#64748b', padding: 0,
              }}
            >
              <ChevronDown size={16} style={{
                transition: 'transform 0.2s',
                transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)',
              }} />
              Advanced Filters
              {(selectedExam !== 'All' || selectedYear) && (
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#14b8a6', color: '#fff',
                  padding: '1px 7px', borderRadius: 10, marginLeft: 4,
                }}>Active</span>
              )}
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: 14, padding: 20, borderRadius: 14,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                {/* Exam */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Exam Type
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {EXAMS.map(e => {
                      const active = selectedExam === e
                      return (
                        <button key={e} onClick={() => setSelectedExam(e)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, transition: 'all 0.12s',
                            border: active ? 'none' : '1px solid #e2e8f0',
                            background: active ? '#14b8a6' : '#fff',
                            color: active ? '#fff' : '#475569',
                          }}>
                          {e}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Year */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    PYQ Year
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {YEARS.map(y => {
                      const active = selectedYear === y
                      return (
                        <button key={y} onClick={() => setSelectedYear(y)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, transition: 'all 0.12s',
                            border: active ? 'none' : '1px solid #e2e8f0',
                            background: active ? '#14b8a6' : '#fff',
                            color: active ? '#fff' : '#475569',
                          }}>
                          {y || 'All Years'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start Button */}
          <div style={{
            background: canStart ? 'linear-gradient(180deg, #f0fdfa 0%, #fff 100%)' : 'transparent',
            borderRadius: 16, padding: canStart ? '20px' : '0',
            border: canStart ? '1px solid #ccfbf1' : 'none',
            transition: 'all 0.2s',
          }}>
            {canStart && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 500 }}>
                {summary}
              </div>
            )}
            <button
              onClick={handleStartQuiz}
              disabled={!canStart || generating}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: !canStart ? '#e2e8f0' : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
                color: !canStart ? '#94a3b8' : '#fff',
                fontSize: 16, fontWeight: 800, letterSpacing: '0.3px',
                cursor: !canStart || generating ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: canStart ? '0 4px 16px rgba(20,184,166,0.3)' : 'none',
                transition: 'all 0.2s',
                transform: 'scale(1)',
              }}
              onMouseEnter={e => { if (canStart && !generating) e.currentTarget.style.transform = 'scale(1.01)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {generating ? (
                <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Preparing Quiz...</>
              ) : (
                <><BrainCircuit size={22} /> Start Quiz</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Attempts */}
      {completedAttempts.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: 20, overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BarChart3 size={16} color="#14b8a6" />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Recent Quizzes</span>
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              {completedAttempts.length} total
            </span>
          </div>

          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
            padding: '10px 24px', background: '#f8fafc', gap: 12,
          }}>
            {['Subject', 'Score', 'Result', 'Date', ''].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
            ))}
          </div>

          {completedAttempts.slice(0, 8).map((a, i) => {
            const sub = subjects.find(s => s.id === a.subject_id)
            const score = Number(a.score_percentage)
            const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#dc2626'
            const scoreBg = score >= 70 ? '#f0fdf4' : score >= 40 ? '#fffbeb' : '#fef2f2'
            return (
              <div
                key={a.id}
                onClick={() => navigate('/quiz/results', { state: { attemptId: a.id } })}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                  padding: '14px 24px', alignItems: 'center', gap: 12, cursor: 'pointer',
                  borderBottom: i < Math.min(completedAttempts.length, 8) - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafffe'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {sub?.name || a.paper || 'Mixed Quiz'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {a.difficulty} · {a.correct_answers}/{a.total_questions} correct
                  </div>
                </div>
                <div>
                  <span style={{
                    fontSize: 16, fontWeight: 800, color: scoreColor,
                  }}>
                    {score.toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: scoreColor, background: scoreBg,
                    padding: '3px 10px', borderRadius: 20,
                  }}>
                    {score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(a.completed_at || a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <ChevronRight size={16} color="#cbd5e1" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .quiz-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .quiz-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
