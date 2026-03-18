import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, CheckSquare, BarChart3, Bell, BookOpen, Newspaper,
  Target, Award, ArrowRight, Check, Star, ChevronDown, Menu, X,
  Brain, BrainCircuit, Sparkles, Layers, Play, Clock, Zap,
  FileText, TrendingUp, Shield, Users, BookMarked, Notebook,
} from 'lucide-react'

// ── Colors ──
const TEAL = '#14b8a6'
const TEAL_DARK = '#0d9488'
const NAVY = '#0f172a'
const NAVY_LIGHT = '#1e293b'
const SLATE = '#334155'
const MUTED = '#94a3b8'
const BORDER = '#e2e8f0'

// ── Data ──
const EXAM_TYPES = [
  {
    name: 'Bihar Daroga Mains (BPSSC SI)',
    desc: 'Sub-Inspector Mains Examination',
    subjects: ['Hindi Language', 'English Language', 'Bihar GK & History', 'Mathematics & Reasoning', 'Indian Polity', 'General Science', 'Indian Geography', 'GK & Current Affairs'],
    color: '#78716c',
    questions: '1000+',
  },
  {
    name: 'UPSC / State PSC',
    desc: 'UPSC CSE, BPSC, UPPSC, MPSC & all State PSCs',
    subjects: ['GS-I: History, Geography, Society', 'GS-II: Polity, IR, Governance', 'GS-III: Economy, Science, Environment', 'GS-IV: Ethics & Aptitude', 'Prelims & CSAT'],
    color: '#6366f1',
    questions: '500+',
  },
]

const AI_FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Question Generation',
    desc: 'Generate exam-quality MCQs instantly using Claude AI. Get questions with authentic exam patterns — statement-based, match-the-following, and negative framing.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: Layers,
    title: 'Set-wise Practice (50 Qs)',
    desc: 'Questions organized in sets of 50. Complete Set 1, move to Set 2, and so on. Systematic coverage with no question left behind.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: Target,
    title: 'Subject-wise Drill',
    desc: 'Pick any subject — Hindi, English, Math, GK, Polity, Science. Each subject has dedicated question sets with difficulty levels and detailed explanations.',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    icon: BrainCircuit,
    title: 'Exam-wise Test Series',
    desc: 'Full-length mock tests matching real exam patterns. BPSSC SI, UPSC Prelims, BPSC — timed tests with instant scoring and analysis.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: TrendingUp,
    title: 'Smart Progress Tracking',
    desc: 'Track attempted vs remaining questions per subject. The system prioritizes unattempted questions so you never repeat until you have covered everything.',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'See your score trends, subject-wise strengths and weaknesses, time per question, and accuracy rates. Data-driven preparation.',
    color: TEAL,
    bg: '#f0fdfa',
  },
]

const PLATFORM_FEATURES = [
  { icon: Newspaper, title: 'Daily Current Affairs', desc: 'Auto-curated from The Hindu, Indian Express & more — sorted by GS Papers', color: '#f59e0b' },
  { icon: CheckSquare, title: 'Smart Task Planner', desc: 'Daily tasks with priorities, exam linking, and quick templates', color: '#22c55e' },
  { icon: BookOpen, title: 'Study Session Logger', desc: 'Log hours by subject — see where your time actually goes', color: '#a855f7' },
  { icon: Bell, title: 'Study Alarms', desc: 'Custom reminders for revision, mock tests, and reading', color: '#ef4444' },
  { icon: Notebook, title: 'Notes System', desc: 'Subject-wise notes with tags, search, and pin support', color: '#3b82f6' },
  { icon: BookMarked, title: 'Syllabus Tracker', desc: 'Track topic-wise status — Not Started, In Progress, Revised, Done', color: '#ec4899' },
  { icon: GraduationCap, title: 'Exam Countdown', desc: 'Live countdown timers for every upcoming exam date', color: '#6366f1' },
  { icon: BarChart3, title: 'Progress Charts', desc: 'Daily/weekly study trends with visual charts and breakdowns', color: TEAL },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose Your Exam', desc: 'Select BPSSC SI, UPSC, BPSC, or any State PSC exam', icon: Target },
  { step: '02', title: 'Pick Subject & Set', desc: 'Choose a subject like Hindi, English, or Math. Questions are organized in sets of 50', icon: Layers },
  { step: '03', title: 'Practice with Explanations', desc: 'Solve MCQs with instant feedback, detailed explanations, and correct answers', icon: Brain },
  { step: '04', title: 'Track & Improve', desc: 'See your progress, identify weak areas, and systematically cover the entire syllabus', icon: TrendingUp },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'UPSC CSE 2025 Aspirant',
    text: 'The GS Paper-wise current affairs categorization is a game-changer. I save 2 hours daily on news reading.',
    avatar: 'PS',
    color: TEAL,
  },
  {
    name: 'Shashank Sharma',
    role: 'BPSC AEDO Aspirant',
    text: 'Finally an app that understands what PSC aspirants actually need. The study logger keeps me accountable.',
    avatar: 'SS',
    color: '#3b82f6',
  },
  {
    name: 'Anuradha Kumari',
    role: 'BPSSC SI Aspirant',
    text: 'The set-wise practice of 50 questions each is perfect. I complete one set daily and my confidence has improved dramatically.',
    avatar: 'AK',
    color: '#a855f7',
  },
]

const FAQS = [
  {
    q: 'How does AI-powered question generation work?',
    a: 'Our system uses Claude AI to generate exam-quality MCQs based on the actual exam pattern. You can generate questions for any subject with specific difficulty levels. Each question comes with 4 options and a detailed explanation citing specific facts.',
  },
  {
    q: 'What exams are covered?',
    a: 'Currently we support Bihar Daroga Mains (BPSSC SI) with 1000+ questions across all 8 subjects, plus UPSC CSE, BPSC, UPPSC, MPSC, and all State PSC exams. We are continuously adding more questions and exam patterns.',
  },
  {
    q: 'How does set-wise practice work?',
    a: 'Questions for each subject are divided into sets of 50. You can practice Set 1 (Q1-50), then Set 2 (Q51-100), and so on. This ensures you systematically cover every question without repetition. Once all sets are done, you can revise any set.',
  },
  {
    q: 'Is this useful for State PSC exams too?',
    a: 'Absolutely. ExamPrep works for UPSC CSE, BPSC, UPPSC, MPSC, WBPSC, and all state-level civil service exams. The current affairs and study tools are designed for the common GS syllabus shared across these exams.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes, ExamPrep is fully responsive and works on mobile browsers. You can practice questions, read current affairs, and manage tasks on the go.',
  },
  {
    q: 'What happens after my free trial?',
    a: 'Your data is safely stored. You can subscribe to continue or renew anytime and pick up exactly where you left off. We never delete your study logs, notes, or quiz history.',
  },
]

// ── Components ──
function Navbar({ onSignIn, onSignUp }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: -0.5 }}>ExamPrep</span>
        </div>

        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#test-series" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Test Series</a>
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>FAQ</a>
          <button onClick={onSignIn} style={{
            padding: '8px 18px', background: 'none', border: `1.5px solid ${BORDER}`,
            borderRadius: 10, fontSize: 14, fontWeight: 600, color: SLATE, cursor: 'pointer',
          }}>Sign in</button>
          <button onClick={onSignUp} style={{
            padding: '8px 20px', background: TEAL, border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
          }}>Start Free Trial</button>
        </div>

        <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          {menuOpen ? <X size={24} color={NAVY} /> : <Menu size={24} color={NAVY} />}
        </button>
      </div>

      {menuOpen && (
        <div className="lp-mobile-menu" style={{
          background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <a href="#test-series" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Test Series</a>
          <a href="#features" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Pricing</a>
          <a href="#faq" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>FAQ</a>
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button onClick={onSignIn} style={{ flex: 1, padding: '10px', background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: SLATE, cursor: 'pointer' }}>Sign in</button>
            <button onClick={onSignUp} style={{ flex: 1, padding: '10px', background: TEAL, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Start Free</button>
          </div>
        </div>
      )}
    </nav>
  )
}

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div style={{
      border: `1px solid ${open ? TEAL : BORDER}`,
      borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '18px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: open ? '#f0fdfa' : '#fff', border: 'none', cursor: 'pointer',
        fontSize: 15, fontWeight: 600, color: NAVY, textAlign: 'left',
      }}>
        {q}
        <ChevronDown size={18} color={MUTED} style={{
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0, marginLeft: 12,
        }} />
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: 14, lineHeight: 1.7, color: SLATE }}>{a}</div>
      )}
    </div>
  )
}

// ── Main Landing Page ──
export default function Landing() {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('yearly')
  const [openFaq, setOpenFaq] = useState(null)

  const goSignIn = () => navigate('/signin')
  const goSignUp = () => navigate('/signup')

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: NAVY, overflowX: 'hidden' }}>
      <Navbar onSignIn={goSignIn} onSignUp={goSignUp} />

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        background: 'linear-gradient(180deg, #f0fdfa 0%, #f5f3ff 50%, #ffffff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(139,92,246,0.04)', top: -150, right: -200 }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(20,184,166,0.04)', bottom: -100, left: -150 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px 6px 8px',
            background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999,
            fontSize: 13, fontWeight: 600, color: SLATE, marginBottom: 28,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <span style={{
              padding: '3px 10px', borderRadius: 999,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff',
              fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
            }}><Sparkles size={10} /> AI POWERED</span>
            1000+ Questions for BPSSC SI & UPSC
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 900,
            lineHeight: 1.08, margin: '0 0 20px', letterSpacing: -1.5, color: NAVY,
          }}>
            AI-Powered
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Test Series</span> for
            <br />
            Competitive Exams
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6,
            color: SLATE, maxWidth: 620, margin: '0 auto 36px',
          }}>
            Practice subject-wise and exam-wise with 1000+ AI-generated MCQs. Organized in sets of 50 questions with detailed explanations, progress tracking, and performance analytics.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={goSignUp} style={{
              padding: '16px 36px', background: TEAL, color: '#fff',
              border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
              onMouseLeave={e => e.currentTarget.style.background = TEAL}
            >
              Start Free Trial <ArrowRight size={18} />
            </button>
            <button onClick={() => document.getElementById('test-series')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '16px 32px', background: '#fff',
              border: `1.5px solid ${BORDER}`, borderRadius: 14,
              fontSize: 17, fontWeight: 600, color: SLATE, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = TEAL}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              View Test Series
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 40, marginTop: 48, flexWrap: 'wrap',
          }}>
            {[
              { value: '1000+', label: 'MCQ Questions' },
              { value: '8+', label: 'Subjects' },
              { value: '50', label: 'Qs per Set' },
              { value: 'AI', label: 'Powered' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: NAVY }}>{value}</div>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXAM-WISE TEST SERIES ─── */}
      <section id="test-series" style={{
        padding: '80px 24px', background: NAVY,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Exam-wise Test Series
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            Choose your exam, start practicing
          </h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 48px' }}>
            Subject-wise question sets with AI-generated MCQs matching real exam patterns
          </p>

          <div className="lp-exam-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
            maxWidth: 900, margin: '0 auto',
          }}>
            {EXAM_TYPES.map(exam => (
              <div key={exam.name} style={{
                padding: 32, borderRadius: 20,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: `3px solid ${exam.color}`,
                transition: 'all 0.2s',
              }}
                className="lp-exam-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{exam.name}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{exam.desc}</p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: `${exam.color}22`, color: exam.color, border: `1px solid ${exam.color}44`,
                    whiteSpace: 'nowrap',
                  }}>{exam.questions} Qs</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {exam.subjects.map(sub => (
                    <span key={sub} style={{
                      fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 6,
                    }}>{sub}</span>
                  ))}
                </div>

                <button onClick={goSignUp} style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: exam.color, color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Play size={14} /> Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            How It Works
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 48px' }}>
            Start practicing in 4 simple steps
          </h2>
          <div className="lp-steps-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          }}>
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
                  background: '#fff', border: `2px solid ${TEAL}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(20,184,166,0.08)',
                }}>
                  <Icon size={24} color={TEAL} />
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: TEAL, marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: 1.5,
                }}>Step {step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: MUTED, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI-POWERED FEATURES ─── */}
      <section id="features" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999, marginBottom: 16,
            background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)', border: '1px solid #e0e7ff',
          }}>
            <Sparkles size={13} color="#7c3aed" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>AI-POWERED PRACTICE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
            Smart test series that adapts to you
          </h2>
          <p style={{ fontSize: 16, color: MUTED, maxWidth: 580, margin: '0 0 48px' }}>
            AI-generated questions, systematic set-wise practice, and intelligent progress tracking — everything you need to crack your exam.
          </p>

          <div className="lp-ai-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }}>
            {AI_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} style={{
                padding: 28, border: `1px solid ${BORDER}`, borderRadius: 16,
                transition: 'all 0.2s', cursor: 'default',
              }}
                className="lp-feature-card"
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: MUTED, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUBJECT SHOWCASE ─── */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, #f0fdfa, #f5f3ff)',
        borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
            Subject-wise Question Bank
          </h2>
          <p style={{ fontSize: 14, color: MUTED, margin: '0 0 32px' }}>
            Each subject organized in sets of 50 MCQs with detailed explanations
          </p>
          <div className="lp-subject-grid" style={{
            display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            {[
              { name: 'Hindi Language', qs: '60+', color: '#ec4899' },
              { name: 'English Language', qs: '112+', color: '#3b82f6' },
              { name: 'Bihar GK & History', qs: '62+', color: '#f59e0b' },
              { name: 'Mathematics & Reasoning', qs: '53+', color: '#22c55e' },
              { name: 'Indian Polity', qs: '50+', color: '#6366f1' },
              { name: 'General Science', qs: '50+', color: '#ef4444' },
              { name: 'Geography', qs: '50+', color: TEAL },
              { name: 'GK & Current Affairs', qs: '50+', color: '#a855f7' },
            ].map(sub => (
              <div key={sub.name} style={{
                padding: '12px 20px', borderRadius: 12, background: '#fff',
                border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: sub.color }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{sub.qs} questions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM FEATURES ─── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Complete Preparation Suite
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
            Beyond just test series
          </h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: MUTED, maxWidth: 550, margin: '0 auto 48px' }}>
            A complete exam preparation ecosystem designed for serious aspirants
          </p>

          <div className="lp-platform-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          }}>
            {PLATFORM_FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{
                padding: '22px 20px', border: `1px solid ${BORDER}`,
                borderRadius: 14, transition: 'all 0.2s',
              }}
                className="lp-feature-card"
              >
                <Icon size={20} color={color} style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>{title}</h3>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: MUTED, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWS SOURCES ─── */}
      <section style={{ padding: '50px 24px', background: '#f8fafc', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Current affairs curated from trusted sources
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            {['The Hindu', 'Indian Express', 'NDTV', 'LiveMint', 'Times of India', 'Down To Earth'].map(src => (
              <span key={src} style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', letterSpacing: -0.3 }}>{src}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Simple Pricing
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
            Less than a cup of chai per day
          </h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: MUTED, maxWidth: 480, margin: '0 auto 32px' }}>
            Full access to AI test series, current affairs, study tools — everything included. 7-day free trial.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
              <button onClick={() => setBillingCycle('monthly')} style={{
                padding: '8px 20px', borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: billingCycle === 'monthly' ? '#fff' : 'transparent',
                color: billingCycle === 'monthly' ? NAVY : MUTED,
                boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>Monthly</button>
              <button onClick={() => setBillingCycle('yearly')} style={{
                padding: '8px 20px', borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: billingCycle === 'yearly' ? '#fff' : 'transparent',
                color: billingCycle === 'yearly' ? NAVY : MUTED,
                boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Yearly
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#ecfdf5', color: '#059669',
                  padding: '2px 6px', borderRadius: 999,
                }}>SAVE 25%</span>
              </button>
            </div>
          </div>

          <div className="lp-pricing-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
            maxWidth: 700, margin: '0 auto',
          }}>
            <div style={{
              padding: 32,
              border: `1.5px solid ${billingCycle === 'monthly' ? TEAL : BORDER}`,
              borderRadius: 20, background: '#fff',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Monthly</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: NAVY }}>&#8377;150</span>
                <span style={{ fontSize: 15, color: MUTED, fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ fontSize: 13, color: MUTED, margin: '0 0 24px' }}>Flexible monthly billing</p>
              <button onClick={goSignUp} style={{
                width: '100%', padding: '12px', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                background: billingCycle === 'monthly' ? TEAL : '#fff',
                color: billingCycle === 'monthly' ? '#fff' : NAVY,
                border: billingCycle === 'monthly' ? 'none' : `1.5px solid ${BORDER}`,
                marginBottom: 24,
              }}>Start Free Trial</button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['AI-powered test series', '1000+ MCQ questions', 'Subject-wise sets of 50', 'Daily current affairs', 'Study analytics & progress', 'Unlimited study logs'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SLATE }}>
                    <Check size={15} color={TEAL} /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              padding: 32,
              border: `1.5px solid ${billingCycle === 'yearly' ? TEAL : BORDER}`,
              borderRadius: 20,
              background: billingCycle === 'yearly' ? '#f0fdfa' : '#fff',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -12, right: 20,
                background: TEAL, color: '#fff', padding: '4px 14px',
                borderRadius: 999, fontSize: 11, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>Most Popular</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Yearly</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: NAVY }}>&#8377;1,350</span>
                <span style={{ fontSize: 15, color: MUTED, fontWeight: 500 }}>/year</span>
              </div>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 600, margin: '0 0 24px' }}>
                &#8377;112.50/month — Save &#8377;450/year
              </p>
              <button onClick={goSignUp} style={{
                width: '100%', padding: '12px', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                background: TEAL, color: '#fff', border: 'none',
                boxShadow: billingCycle === 'yearly' ? '0 4px 14px rgba(20,184,166,0.25)' : 'none',
                marginBottom: 24,
              }}>Start Free Trial</button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Everything in Monthly', 'Priority support', 'Save 25% annually', 'Full preparation cycle coverage', 'New questions added regularly', '7-day free trial included'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SLATE }}>
                    <Check size={15} color={TEAL} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            What Aspirants Say
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 40px' }}>
            Trusted by serious aspirants
          </h2>
          <div className="lp-testimonials-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }}>
            {TESTIMONIALS.map(({ name, role, text, avatar, color }) => (
              <div key={name} style={{
                padding: 28, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16,
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: SLATE, margin: '0 0 20px', fontStyle: 'italic' }}>
                  &ldquo;{text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: color, color: '#fff', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{avatar}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            FAQ
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 36px' }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(({ q, a }, i) => (
              <FAQItem key={q} q={q} a={a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{
        padding: '80px 24px',
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999, marginBottom: 24,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
          }}>
            <Sparkles size={13} color="#a78bfa" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>AI-POWERED PRACTICE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
            Stop guessing,
            <br />
            <span style={{ color: TEAL }}>start practicing smart</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 32px', lineHeight: 1.6 }}>
            1000+ AI-generated MCQs across 8+ subjects. Set-wise practice of 50 questions each. Detailed explanations with every answer. Start your free trial today.
          </p>
          <button onClick={goSignUp} style={{
            padding: '16px 40px', background: TEAL, color: '#fff',
            border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 20px rgba(20,184,166,0.35)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
            onMouseLeave={e => e.currentTarget.style.background = TEAL}
          >
            Start 7-Day Free Trial <ArrowRight size={18} />
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: '40px 24px', background: NAVY,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>ExamPrep</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            &copy; 2026 ExamPrep. AI-powered exam preparation platform.
          </p>
        </div>
      </footer>

      {/* ─── RESPONSIVE STYLES ─── */}
      <style>{`
        @media (max-width: 1024px) {
          .lp-ai-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-platform-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          .lp-hamburger { display: flex !important; }
          .lp-exam-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-ai-grid { grid-template-columns: 1fr !important; }
          .lp-platform-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-pricing-grid { grid-template-columns: 1fr !important; }
          .lp-testimonials-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .lp-platform-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .lp-mobile-menu { display: none !important; }
        }
        .lp-feature-card:hover {
          border-color: ${TEAL} !important;
          box-shadow: 0 4px 16px rgba(20,184,166,0.08);
        }
        .lp-exam-card:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.15) !important;
        }
      `}</style>
    </div>
  )
}
