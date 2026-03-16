import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import {
  BrainCircuit, Zap, Trophy, ChevronRight, Loader2, AlertCircle,
  Target, BarChart3, TrendingUp, Clock, BookOpen, FileText, Layers,
  Play, RotateCcw, ChevronDown, Award, Lock, Sparkles,
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

// ─── Constants ───
const PAPERS = ['GS-I', 'GS-II', 'GS-III', 'GS-IV', 'Prelims', 'Science']
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', desc: 'Basics & fundamentals', color: '#22c55e', bg: '#f0fdf4' },
  { key: 'medium', label: 'Medium', desc: 'Exam-level questions', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'hard', label: 'Hard', desc: 'Advanced & tricky', color: '#ef4444', bg: '#fef2f2' },
]
const COUNTS = [10, 15, 20, 30, 50]
const EXAMS = ['All', 'UPSC Prelims', 'BPSC', 'UPPSC', 'MPSC', 'RPSC', 'WBPSC', 'SSC CGL']
const YEARS = ['', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016']
const TABS = [
  { key: 'series', label: 'Test Series', icon: Layers },
  { key: 'subject', label: 'Subject Practice', icon: BookOpen },
  { key: 'pyq', label: 'PYQ Papers', icon: FileText },
  { key: 'custom', label: 'Custom Quiz', icon: Sparkles },
]

const PAPER_META = {
  'GS-I': { title: 'General Studies I', desc: 'History, Geography, Society', color: '#6366f1', bg: '#eef2ff', duration: 120, questions: 50, marks: 200 },
  'GS-II': { title: 'General Studies II', desc: 'Polity, Governance, IR', color: '#0ea5e9', bg: '#f0f9ff', duration: 120, questions: 50, marks: 200 },
  'GS-III': { title: 'General Studies III', desc: 'Economy, Environment, S&T', color: '#14b8a6', bg: '#f0fdfa', duration: 120, questions: 50, marks: 200 },
  'GS-IV': { title: 'General Studies IV', desc: 'Ethics, Integrity, Aptitude', color: '#f59e0b', bg: '#fffbeb', duration: 120, questions: 50, marks: 200 },
  'Prelims': { title: 'Prelims Full Mock', desc: 'Complete UPSC Prelims', color: '#ef4444', bg: '#fef2f2', duration: 120, questions: 100, marks: 200 },
  'Science': { title: 'Science Series', desc: 'Physics, Chemistry, Biology', color: '#8b5cf6', bg: '#f5f3ff', duration: 90, questions: 50, marks: 200 },
}

const PYQ_EXAMS = [
  { key: 'UPSC Prelims', label: 'UPSC Prelims', color: '#ef4444' },
  { key: 'BPSC', label: 'BPSC', color: '#f59e0b' },
  { key: 'UPPSC', label: 'UPPSC', color: '#0ea5e9' },
  { key: 'MPSC', label: 'MPSC', color: '#14b8a6' },
  { key: 'SSC CGL', label: 'SSC CGL', color: '#8b5cf6' },
]

// ─── Color System ───
const C = {
  primary: '#0d9488',
  primaryLight: '#14b8a6',
  primaryBg: '#f0fdfa',
  primaryBorder: '#ccfbf1',
  navy: '#0f172a',
  slate: '#334155',
  muted: '#64748b',
  hint: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  bg: '#f8fafc',
  white: '#ffffff',
  green: '#22c55e',
  greenBg: '#f0fdf4',
  red: '#ef4444',
  redBg: '#fef2f2',
  amber: '#f59e0b',
  amberBg: '#fffbeb',
}

export default function QuizHome() {
  const navigate = useNavigate()
  const { subjects, attempts, loading, generateQuiz, getQuestionCounts, getAttemptedCounts } = useQuiz()
  const [activeTab, setActiveTab] = useState('series')
  const [generating, setGenerating] = useState(null) // holds the key of the generating card
  const [genError, setGenError] = useState(null)
  const [questionCounts, setQuestionCounts] = useState({})
  const [attemptedCounts, setAttemptedCounts] = useState({})

  // Custom quiz state
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedExam, setSelectedExam] = useState('All')
  const [selectedYear, setSelectedYear] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // PYQ tab state
  const [pyqExamFilter, setPyqExamFilter] = useState('UPSC Prelims')

  useEffect(() => {
    getQuestionCounts().then(setQuestionCounts)
    getAttemptedCounts().then(setAttemptedCounts)
  }, [getQuestionCounts, getAttemptedCounts])

  const completedAttempts = attempts.filter(a => a.status === 'completed')
  const avgScore = completedAttempts.length > 0
    ? (completedAttempts.reduce((s, a) => s + Number(a.score_percentage), 0) / completedAttempts.length).toFixed(0)
    : 0
  const totalCorrect = completedAttempts.reduce((s, a) => s + a.correct_answers, 0)
  const totalSolved = completedAttempts.reduce((s, a) => s + a.total_questions, 0)

  const filteredSubjects = selectedPaper
    ? subjects.filter(s => s.paper === selectedPaper)
    : subjects

  // Get best attempt for a given paper/subject
  const getBestAttempt = (paper, subjectId) => {
    return completedAttempts
      .filter(a => subjectId ? a.subject_id === subjectId : a.paper === paper && !a.subject_id)
      .sort((a, b) => Number(b.score_percentage) - Number(a.score_percentage))[0]
  }

  const getAttemptCount = (paper, subjectId) => {
    return completedAttempts.filter(a =>
      subjectId ? a.subject_id === subjectId : a.paper === paper
    ).length
  }

  const getPaperQuestionCount = (paper) => {
    return subjects
      .filter(s => s.paper === paper)
      .reduce((sum, s) => sum + (questionCounts[s.id] || 0), 0)
  }

  // ─── Start quiz handler ───
  const handleStart = async (config, cardKey) => {
    if (generating) return
    setGenerating(cardKey)
    setGenError(null)
    const result = await generateQuiz(config)
    setGenerating(null)
    if (result.error) { setGenError(result.error); return }
    navigate('/quiz/play', { state: result.data })
  }

  const handleCustomStart = async () => {
    const canStart = selectedSubject || selectedPaper
    if (!canStart || generating) return
    handleStart({
      subject_id: selectedSubject || null,
      paper: selectedPaper || subjects.find(s => s.id === selectedSubject)?.paper || 'Prelims',
      count: questionCount,
      difficulty,
      quiz_type: selectedSubject ? 'subject_practice' : 'full_mock',
      pyq_exam: selectedExam !== 'All' ? selectedExam : null,
      pyq_year: selectedYear ? parseInt(selectedYear) : null,
    }, 'custom')
  }

  if (loading) return <LoadingSpinner />

  // ─── Stats data ───
  const stats = [
    { label: 'Tests Taken', value: completedAttempts.length, icon: BrainCircuit, color: C.primary, bg: C.primaryBg },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Trophy, color: '#d97706', bg: C.amberBg },
    { label: 'Questions Solved', value: totalSolved, icon: Target, color: '#2563eb', bg: '#dbeafe' },
    { label: 'Correct Answers', value: totalCorrect, icon: Zap, color: '#16a34a', bg: C.greenBg },
  ]

  return (
    <div style={{ paddingBottom: 60, maxWidth: 1100 }}>
      {/* ─── Stats Row ─── */}
      <div className="quiz-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24,
      }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: C.white, borderRadius: 14, padding: '18px 16px',
            border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={20} color={color} strokeWidth={2.2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
              <div style={{ fontSize: 11, color: C.hint, fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Error Banner ─── */}
      {genError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 16,
          background: C.redBg, border: '1px solid #fecaca', borderRadius: 12,
          fontSize: 13, color: C.red, fontWeight: 500,
        }}>
          <AlertCircle size={16} /> {genError}
        </div>
      )}

      {/* ─── Tab Navigation ─── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20, background: C.white,
        borderRadius: 14, padding: 4, border: `1px solid ${C.border}`,
      }}>
        {TABS.map(({ key, label, icon: TIcon }) => {
          const active = activeTab === key
          return (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              flex: 1, padding: '11px 8px', borderRadius: 11, border: 'none', cursor: 'pointer',
              background: active ? C.primary : 'transparent',
              color: active ? C.white : C.muted,
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <TIcon size={15} strokeWidth={active ? 2.5 : 2} />
              <span className="tab-label">{label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── TEST SERIES TAB ─── */}
      {activeTab === 'series' && (
        <div>
          {/* Full-Length Mock Tests */}
          <SectionHeader icon={Award} title="Full Length Mock Tests" subtitle="Simulate the real exam experience" />
          <div className="test-cards-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32,
          }}>
            {PAPERS.map(paper => {
              const meta = PAPER_META[paper]
              const available = getPaperQuestionCount(paper)
              const best = getBestAttempt(paper, null)
              const attemptCt = getAttemptCount(paper, null)
              const isGenerating = generating === `mock-${paper}`
              // Count attempted questions across all subjects in this paper
              const paperAttempted = subjects
                .filter(s => s.paper === paper)
                .reduce((sum, s) => sum + (attemptedCounts[s.id] || 0), 0)
              return (
                <MockTestCard
                  key={paper}
                  paper={paper}
                  meta={meta}
                  available={available}
                  attempted={Math.min(paperAttempted, available)}
                  best={best}
                  attemptCount={attemptCt}
                  isGenerating={isGenerating}
                  onStart={() => handleStart({
                    paper, count: available, // Load ALL available questions
                    difficulty: 'all', quiz_type: 'full_mock',
                  }, `mock-${paper}`)}
                />
              )
            })}
          </div>

          {/* Topic-wise Tests */}
          <SectionHeader icon={BookOpen} title="Topic-wise Tests" subtitle="Master individual subjects" />
          <div className="topic-cards-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32,
          }}>
            {subjects.map(sub => {
              const count = questionCounts[sub.id] || 0
              const attempted = Math.min(attemptedCounts[sub.id] || 0, count)
              const remaining = count - attempted
              const best = getBestAttempt(null, sub.id)
              const attemptCt = getAttemptCount(null, sub.id)
              const paperMeta = PAPER_META[sub.paper]
              const isGenerating = generating === `topic-${sub.id}`
              // Set size: 20 questions per set, or all remaining if fewer
              const setSize = Math.min(20, count)
              return (
                <TopicTestCard
                  key={sub.id}
                  subject={sub}
                  count={count}
                  attempted={attempted}
                  remaining={remaining}
                  best={best}
                  attemptCount={attemptCt}
                  paperColor={paperMeta?.color || C.primary}
                  isGenerating={isGenerating}
                  onStart={() => handleStart({
                    subject_id: sub.id, paper: sub.paper,
                    count: setSize,
                    difficulty: 'medium', quiz_type: 'subject_practice',
                    exclude_attempted: remaining > 0, // Prioritize fresh questions
                  }, `topic-${sub.id}`)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ─── SUBJECT PRACTICE TAB ─── */}
      {activeTab === 'subject' && (
        <div>
          {PAPERS.map(paper => {
            const paperSubjects = subjects.filter(s => s.paper === paper)
            if (paperSubjects.length === 0) return null
            const meta = PAPER_META[paper]
            return (
              <div key={paper} style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                }}>
                  <div style={{
                    width: 8, height: 28, borderRadius: 4, background: meta?.color || C.primary,
                  }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{paper}</div>
                    <div style={{ fontSize: 12, color: C.hint }}>{meta?.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {paperSubjects.map(sub => {
                    const count = questionCounts[sub.id] || 0
                    const attempted = Math.min(attemptedCounts[sub.id] || 0, count)
                    const remaining = count - attempted
                    const best = getBestAttempt(null, sub.id)
                    const attemptCt = getAttemptCount(null, sub.id)
                    const isGenerating = generating === `subj-${sub.id}`
                    return (
                      <SubjectRow
                        key={sub.id}
                        subject={sub}
                        count={count}
                        attempted={attempted}
                        remaining={remaining}
                        best={best}
                        attemptCount={attemptCt}
                        color={meta?.color || C.primary}
                        isGenerating={isGenerating}
                        onStart={() => handleStart({
                          subject_id: sub.id, paper: sub.paper,
                          count: Math.min(20, count || 20),
                          difficulty: 'medium', quiz_type: 'subject_practice',
                          exclude_attempted: remaining > 0,
                        }, `subj-${sub.id}`)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── PYQ PAPERS TAB ─── */}
      {activeTab === 'pyq' && (
        <div>
          <div style={{
            display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap',
          }}>
            {PYQ_EXAMS.map(exam => (
              <button key={exam.key} onClick={() => setPyqExamFilter(exam.key)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                background: pyqExamFilter === exam.key ? exam.color : C.bg,
                color: pyqExamFilter === exam.key ? C.white : C.slate,
              }}>
                {exam.label}
              </button>
            ))}
          </div>

          <div className="pyq-cards-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          }}>
            {YEARS.filter(y => y).map(year => {
              const examColor = PYQ_EXAMS.find(e => e.key === pyqExamFilter)?.color || C.primary
              const isGenerating = generating === `pyq-${pyqExamFilter}-${year}`
              return (
                <PYQCard
                  key={`${pyqExamFilter}-${year}`}
                  exam={pyqExamFilter}
                  year={year}
                  color={examColor}
                  isGenerating={isGenerating}
                  onStart={() => handleStart({
                    paper: 'Prelims', count: 30,
                    difficulty: 'medium', quiz_type: 'full_mock',
                    pyq_exam: pyqExamFilter, pyq_year: parseInt(year),
                  }, `pyq-${pyqExamFilter}-${year}`)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ─── CUSTOM QUIZ TAB ─── */}
      {activeTab === 'custom' && (
        <div style={{
          background: C.white, borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            padding: '20px 24px 16px',
            background: `linear-gradient(180deg, ${C.primaryBg} 0%, ${C.white} 100%)`,
            borderBottom: `1px solid ${C.borderLight}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Sparkles size={20} color={C.primary} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>Build Your Own Quiz</h3>
            </div>
            <p style={{ fontSize: 13, color: C.hint, margin: 0 }}>
              Configure paper, subject, difficulty and question count
            </p>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Step 1: Paper */}
            <StepSection num={1} title="Select Paper" active>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PAPERS.map(p => {
                  const active = selectedPaper === p
                  const count = getPaperQuestionCount(p)
                  return (
                    <PillButton key={p} active={active} onClick={() => { setSelectedPaper(active ? null : p); setSelectedSubject(null) }}>
                      {p}
                      {count > 0 && <PillBadge active={active}>{count}</PillBadge>}
                    </PillButton>
                  )
                })}
              </div>
            </StepSection>

            {/* Step 2: Subject */}
            <StepSection num={2} title="Select Subject" subtitle="optional — skip for mixed quiz" active={!!selectedPaper}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {filteredSubjects.map(s => {
                  const active = selectedSubject === s.id
                  const count = questionCounts[s.id] || 0
                  return (
                    <PillButton key={s.id} active={active} onClick={() => setSelectedSubject(active ? null : s.id)} variant="outline">
                      {s.name}
                      {count > 0 && <PillBadge active={active}>{count}</PillBadge>}
                    </PillButton>
                  )
                })}
              </div>
            </StepSection>

            {/* Step 3: Difficulty & Count */}
            <StepSection num={3} title="Difficulty & Count" active>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DIFFICULTIES.map(d => {
                    const active = difficulty === d.key
                    return (
                      <button key={d.key} onClick={() => setDifficulty(d.key)} style={{
                        flex: 1, padding: '12px 10px', borderRadius: 12, cursor: 'pointer',
                        border: active ? `2px solid ${d.color}` : `1px solid ${C.border}`,
                        background: active ? d.bg : C.white, textAlign: 'center', transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', background: d.color,
                          margin: '0 auto 6px',
                        }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? d.color : C.slate }}>{d.label}</div>
                        <div style={{ fontSize: 10, color: C.hint, marginTop: 2 }}>{d.desc}</div>
                      </button>
                    )
                  })}
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                  background: C.bg, borderRadius: 12, padding: '10px 12px',
                  border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8 }}>Questions</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {COUNTS.map(c => (
                      <button key={c} onClick={() => setQuestionCount(c)} style={{
                        width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, transition: 'all 0.12s',
                        background: questionCount === c ? C.primary : C.white,
                        color: questionCount === c ? C.white : C.slate,
                        boxShadow: questionCount === c ? '0 2px 6px rgba(13,148,136,0.3)' : '0 1px 2px rgba(0,0,0,0.06)',
                      }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepSection>

            {/* Advanced */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowAdvanced(!showAdvanced)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: C.muted, padding: 0,
              }}>
                <ChevronDown size={14} style={{
                  transition: 'transform 0.2s',
                  transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)',
                }} />
                Advanced Filters
                {(selectedExam !== 'All' || selectedYear) && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, background: C.primary, color: C.white,
                    padding: '1px 6px', borderRadius: 8, marginLeft: 4,
                  }}>Active</span>
                )}
              </button>
              {showAdvanced && (
                <div style={{
                  marginTop: 12, padding: 16, borderRadius: 12,
                  background: C.bg, border: `1px solid ${C.border}`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.hint, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Exam Type
                    </label>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {EXAMS.map(e => (
                        <PillButton key={e} active={selectedExam === e} onClick={() => setSelectedExam(e)} size="sm">{e}</PillButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.hint, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      PYQ Year
                    </label>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {YEARS.map(y => (
                        <PillButton key={y} active={selectedYear === y} onClick={() => setSelectedYear(y)} size="sm">{y || 'All'}</PillButton>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Start */}
            <button
              onClick={handleCustomStart}
              disabled={!(selectedSubject || selectedPaper) || !!generating}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: (selectedSubject || selectedPaper) ? `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})` : '#e2e8f0',
                color: (selectedSubject || selectedPaper) ? C.white : C.hint,
                fontSize: 15, fontWeight: 700,
                cursor: (selectedSubject || selectedPaper) && !generating ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: (selectedSubject || selectedPaper) ? '0 4px 14px rgba(13,148,136,0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {generating === 'custom' ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Preparing...</>
              ) : (
                <><Play size={18} /> Start Quiz</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Recent Attempts ─── */}
      {completedAttempts.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color={C.primary} />
              <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Recent Attempts</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: C.hint,
                background: C.bg, padding: '2px 8px', borderRadius: 8,
              }}>{completedAttempts.length}</span>
            </div>
            <button onClick={() => navigate('/quiz/analytics')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.white, fontSize: 12, fontWeight: 600, color: C.primary,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.borderColor = C.primaryLight }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border }}
            >
              <TrendingUp size={13} /> View Analytics
            </button>
          </div>

          <div style={{
            background: C.white, borderRadius: 14, overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 50px',
              padding: '10px 20px', background: C.bg, gap: 8,
            }}>
              {['Test', 'Score', 'Result', 'Date', ''].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.hint, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
              ))}
            </div>

            {completedAttempts.slice(0, 8).map((a, i) => {
              const sub = subjects.find(s => s.id === a.subject_id)
              const score = Number(a.score_percentage)
              const scoreColor = score >= 70 ? C.green : score >= 40 ? C.amber : C.red
              const scoreBg = score >= 70 ? C.greenBg : score >= 40 ? C.amberBg : C.redBg
              return (
                <div key={a.id} onClick={() => navigate('/quiz/results', { state: { attemptId: a.id } })} style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 50px',
                  padding: '12px 20px', alignItems: 'center', gap: 8, cursor: 'pointer',
                  borderBottom: i < Math.min(completedAttempts.length, 8) - 1 ? `1px solid ${C.borderLight}` : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primaryBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
                      {sub?.name || a.paper || 'Mixed Quiz'}
                    </div>
                    <div style={{ fontSize: 11, color: C.hint, marginTop: 1 }}>
                      {a.difficulty} · {a.correct_answers}/{a.total_questions} correct
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor }}>
                      {score.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: scoreColor, background: scoreBg,
                      padding: '3px 8px', borderRadius: 6,
                    }}>
                      {score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.hint }}>
                    {new Date(a.completed_at || a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <ChevronRight size={14} color={C.border} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 900px) {
          .test-cards-grid { grid-template-columns: 1fr !important; }
          .topic-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pyq-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .quiz-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .tab-label { display: none; }
        }
        @media (max-width: 600px) {
          .topic-cards-grid { grid-template-columns: 1fr !important; }
          .pyq-cards-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .quiz-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Sub-components ───

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: C.primaryBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={C.primary} strokeWidth={2.2} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.hint }}>{subtitle}</div>}
      </div>
    </div>
  )
}

function MockTestCard({ paper, meta, available, attempted = 0, best, attemptCount, isGenerating, onStart }) {
  const score = best ? Number(best.score_percentage) : null
  const scoreColor = score !== null ? (score >= 70 ? C.green : score >= 40 ? C.amber : C.red) : null
  const progressPct = available > 0 ? Math.round((attempted / available) * 100) : 0
  const allDone = available > 0 && attempted >= available
  return (
    <div style={{
      background: C.white, borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${C.border}`, transition: 'box-shadow 0.2s, transform 0.2s',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
    >
      {/* Top color bar */}
      <div style={{ height: 3, background: meta.color }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg,
                padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{paper}</span>
              {attemptCount > 0 && (
                <span style={{ fontSize: 10, color: C.hint }}>
                  {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{meta.title}</div>
            <div style={{ fontSize: 12, color: C.hint, marginTop: 1 }}>{meta.desc}</div>
          </div>
          {score !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.hint, marginBottom: 2 }}>Best</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score.toFixed(0)}%</div>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap',
        }}>
          {[
            { icon: FileText, label: `${available} Qs`, color: C.muted },
            { icon: Clock, label: `${meta.duration} min`, color: C.muted },
            { icon: Target, label: `${meta.marks} marks`, color: C.muted },
          ].map(({ icon: MIcon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MIcon size={12} color={color} />
              <span style={{ fontSize: 11, fontWeight: 500, color }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Question coverage progress */}
        {available > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: allDone ? C.green : C.muted }}>
                {allDone ? 'All questions covered' : `${attempted}/${available} questions attempted`}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: allDone ? C.green : C.primary }}>{progressPct}%</span>
            </div>
            <div style={{ width: '100%', height: 5, borderRadius: 3, background: C.borderLight }}>
              <div style={{
                width: `${progressPct}%`, height: '100%', borderRadius: 3,
                background: allDone ? C.green : `linear-gradient(90deg, ${C.primary}, ${C.primaryLight})`,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}

        {/* Action */}
        <button onClick={onStart} disabled={isGenerating || available === 0} style={{
          width: '100%', padding: '10px', borderRadius: 10, border: 'none',
          background: available === 0 ? C.bg : attemptCount > 0 ? C.white : `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
          color: available === 0 ? C.hint : attemptCount > 0 ? C.primary : C.white,
          fontSize: 13, fontWeight: 700, cursor: available === 0 || isGenerating ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          border: attemptCount > 0 && available > 0 ? `1.5px solid ${C.primary}` : 'none',
          transition: 'all 0.15s',
        }}>
          {isGenerating ? (
            <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Preparing {available} Questions...</>
          ) : available === 0 ? (
            <><Lock size={14} /> No Questions Available</>
          ) : attemptCount > 0 ? (
            <><RotateCcw size={14} /> Retake All {available} Questions</>
          ) : (
            <><Play size={14} /> Start Test ({available} Qs)</>
          )}
        </button>
      </div>
    </div>
  )
}

function TopicTestCard({ subject, count, attempted = 0, remaining = 0, best, attemptCount, paperColor, isGenerating, onStart }) {
  const score = best ? Number(best.score_percentage) : null
  const scoreColor = score !== null ? (score >= 70 ? C.green : score >= 40 ? C.amber : C.red) : null
  const progressPct = count > 0 ? Math.round((attempted / count) * 100) : 0
  const allDone = count > 0 && attempted >= count
  return (
    <div style={{
      background: C.white, borderRadius: 12, padding: '14px 16px',
      border: `1px solid ${C.border}`, transition: 'box-shadow 0.2s, transform 0.2s',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <span style={{
              fontSize: 9, fontWeight: 700, color: paperColor,
              background: `${paperColor}12`, padding: '2px 6px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>{subject.paper}</span>
          </div>
          {score !== null && (
            <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor }}>{score.toFixed(0)}%</span>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginBottom: 4 }}>{subject.name}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: C.hint }}>{count} questions</span>
          {remaining > 0 && attempted > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>{remaining} new</span>
          )}
        </div>
        {/* Progress bar */}
        {count > 0 && attempted > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ width: '100%', height: 3, borderRadius: 2, background: C.borderLight }}>
              <div style={{
                width: `${progressPct}%`, height: '100%', borderRadius: 2,
                background: allDone ? C.green : C.primary,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 10, color: C.hint, marginTop: 3 }}>
              {attempted}/{count} covered
            </div>
          </div>
        )}
        {count > 0 && attempted === 0 && <div style={{ marginBottom: 10 }} />}
      </div>
      <button onClick={onStart} disabled={isGenerating || count === 0} style={{
        width: '100%', padding: '8px', borderRadius: 8, border: 'none',
        background: count === 0 ? C.bg : C.primaryBg,
        color: count === 0 ? C.hint : C.primary,
        fontSize: 12, fontWeight: 600, cursor: count === 0 || isGenerating ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { if (count > 0) { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = C.white } }}
        onMouseLeave={e => { if (count > 0) { e.currentTarget.style.background = C.primaryBg; e.currentTarget.style.color = C.primary } }}
      >
        {isGenerating ? (
          <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
        ) : count === 0 ? 'No Questions' : remaining > 0 && attempted > 0 ? (
          <><Play size={12} /> Practice {Math.min(20, remaining)} New</>
        ) : allDone ? (
          <><RotateCcw size={12} /> Revise</>
        ) : (
          <><Play size={12} /> Practice</>
        )}
      </button>
    </div>
  )
}

function SubjectRow({ subject, count, attempted = 0, remaining = 0, best, attemptCount, color, isGenerating, onStart }) {
  const score = best ? Number(best.score_percentage) : null
  const scoreColor = score !== null ? (score >= 70 ? C.green : score >= 40 ? C.amber : C.red) : null
  const progressPct = count > 0 ? Math.round((attempted / count) * 100) : 0
  const allDone = count > 0 && attempted >= count
  return (
    <div style={{
      background: C.white, borderRadius: 10, padding: '12px 16px',
      border: `1px solid ${C.border}`, transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.bg}
      onMouseLeave={e => e.currentTarget.style.background = C.white}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 4, height: 28, borderRadius: 2, background: color, flexShrink: 0,
          }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{subject.name}</div>
            <div style={{ fontSize: 11, color: C.hint }}>
              {count} questions
              {remaining > 0 && attempted > 0 && (
                <span style={{ color: C.primary, fontWeight: 600 }}> · {remaining} new</span>
              )}
              {allDone && (
                <span style={{ color: C.green, fontWeight: 600 }}> · All covered</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {attemptCount > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{score?.toFixed(0)}%</div>
              <div style={{ fontSize: 10, color: C.hint }}>{attemptCount} attempts</div>
            </div>
          )}
          <button onClick={onStart} disabled={isGenerating || count === 0} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: count === 0 ? C.bg : `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
            color: count === 0 ? C.hint : C.white,
            fontSize: 12, fontWeight: 600,
            cursor: count === 0 || isGenerating ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {isGenerating ? (
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            ) : count === 0 ? 'No Qs' : remaining > 0 && attempted > 0 ? (
              <><Play size={12} /> {Math.min(20, remaining)} New</>
            ) : allDone ? (
              <><RotateCcw size={12} /> Revise</>
            ) : (
              <><Play size={12} /> Start</>
            )}
          </button>
        </div>
      </div>
      {/* Progress bar */}
      {count > 0 && attempted > 0 && (
        <div style={{ marginTop: 8, marginLeft: 14 }}>
          <div style={{ width: '100%', height: 3, borderRadius: 2, background: C.borderLight }}>
            <div style={{
              width: `${progressPct}%`, height: '100%', borderRadius: 2,
              background: allDone ? C.green : color,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

function PYQCard({ exam, year, color, isGenerating, onStart }) {
  return (
    <div style={{
      background: C.white, borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${C.border}`, transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
    >
      <div style={{ height: 3, background: color }} />
      <div style={{ padding: '16px' }}>
        <div style={{
          fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1, marginBottom: 4,
          letterSpacing: '-1px',
        }}>{year}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.slate, marginBottom: 2 }}>{exam}</div>
        <div style={{ fontSize: 11, color: C.hint, marginBottom: 14 }}>Previous Year Questions</div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FileText size={11} color={C.hint} />
            <span style={{ fontSize: 11, color: C.hint }}>30 Qs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} color={C.hint} />
            <span style={{ fontSize: 11, color: C.hint }}>60 min</span>
          </div>
        </div>

        <button onClick={onStart} disabled={isGenerating} style={{
          width: '100%', padding: '9px', borderRadius: 8, border: `1.5px solid ${color}`,
          background: C.white, color: color,
          fontSize: 12, fontWeight: 600, cursor: isGenerating ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = C.white }}
          onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = color }}
        >
          {isGenerating ? (
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <><Play size={12} /> Attempt Paper</>
          )}
        </button>
      </div>
    </div>
  )
}

function StepSection({ num, title, subtitle, active = true, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 800,
          background: active ? C.primary : '#cbd5e1', color: C.white,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{num}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{title}</span>
        {subtitle && <span style={{ fontSize: 11, color: C.hint }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

function PillButton({ active, onClick, children, variant = 'filled', size = 'md' }) {
  const pad = size === 'sm' ? '6px 12px' : '9px 16px'
  const fs = size === 'sm' ? 12 : 13
  const br = size === 'sm' ? 8 : 10
  return (
    <button onClick={onClick} style={{
      padding: pad, borderRadius: br, cursor: 'pointer',
      fontSize: fs, fontWeight: 600, transition: 'all 0.15s',
      border: active ? 'none' : variant === 'outline' ? `1px solid ${C.border}` : 'none',
      background: active ? `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})` : variant === 'outline' ? C.white : C.bg,
      color: active ? C.white : C.slate,
      boxShadow: active ? '0 2px 8px rgba(13,148,136,0.25)' : variant === 'outline' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
    }}>
      {children}
    </button>
  )
}

function PillBadge({ active, children }) {
  return (
    <span style={{
      marginLeft: 5, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8,
      background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
      color: active ? C.white : C.hint,
    }}>
      {children}
    </span>
  )
}
