import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, CheckSquare, BarChart3, Bell, BookOpen, Newspaper,
  Target, ArrowRight, Check, Star, ChevronDown, Menu, X,
  Brain, BrainCircuit, Sparkles, Layers, Play, Clock,
  TrendingUp, BookMarked, Notebook, Calendar,
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
const GS_PAPERS = [
  { paper: 'GS-I', topics: 'History, Geography, Art & Culture, Indian Society', color: '#3b82f6', icon: BookOpen },
  { paper: 'GS-II', topics: 'Polity, Governance, International Relations, Social Justice', color: '#22c55e', icon: Target },
  { paper: 'GS-III', topics: 'Economy, Science & Tech, Environment, Internal Security', color: '#f59e0b', icon: TrendingUp },
  { paper: 'GS-IV', topics: 'Ethics, Integrity, Aptitude, Case Studies', color: '#a855f7', icon: Brain },
  { paper: 'Prelims', topics: 'Current Affairs, Static GK, CSAT', color: '#ec4899', icon: BrainCircuit },
]

const SUPPORTED_EXAMS = [
  'UPSC CSE', 'BPSC', 'UPPSC', 'MPSC', 'WBPSC', 'RPSC', 'KPSC', 'BPSSC SI', 'BPSC TRE 4.0',
]

const CORE_FEATURES = [
  {
    icon: Newspaper,
    title: 'Daily Current Affairs',
    desc: 'Auto-curated news from The Hindu, Indian Express, LiveMint & more — categorized by GS Papers. Mark as read, add to study log, and create tasks from articles.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: CheckSquare,
    title: 'Smart Task Planner',
    desc: 'Organize your syllabus into daily tasks with priority levels and exam linking. Quick templates for NCERT, Answer Writing, PYQs, Mock Tests, and Revision.',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    icon: BookOpen,
    title: 'Study Session Logger',
    desc: 'Log hours by GS Paper-aligned subjects — History, Polity, Economy, Geography, Ethics. Track daily & weekly totals. See exactly where your time goes.',
    color: '#a855f7',
    bg: '#faf5ff',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'Visual charts showing daily/weekly study trends, subject-wise time breakdown, and task completion rates. Data-driven preparation, not guesswork.',
    color: TEAL,
    bg: '#f0fdfa',
  },
  {
    icon: Calendar,
    title: 'Exam Countdown',
    desc: 'Track Prelims, Mains, State PSC dates with live countdown timers. Color-coded urgency — never miss a deadline or interview date.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: BookMarked,
    title: 'Syllabus Tracker',
    desc: 'Track topic-wise preparation status across all GS Papers — Not Started, In Progress, Revised, Done. Visual progress bars show exactly where you stand.',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    icon: Notebook,
    title: 'Notes System',
    desc: 'Subject-wise notes with tags, search, and pin support. Organize by GS Paper category. Quick access to revision notes when you need them.',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    icon: Bell,
    title: 'Study Alarms & Reminders',
    desc: 'Custom recurring reminders for revision, mock tests, newspaper reading, and answer writing practice. Build consistency, not cramming.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
]

const TEST_SERIES_FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Exam-wise Test Series',
    desc: 'Full mock tests matching real exam patterns — UPSC Prelims, BPSC, BPSSC SI. Timed tests with instant scoring and detailed analysis.',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    icon: Target,
    title: 'Subject-wise Practice',
    desc: 'Pick any subject — Polity, Economy, History, Geography, Science. Dedicated question sets with difficulty levels and explanations.',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    icon: Layers,
    title: 'Set-wise Practice (50 Qs)',
    desc: 'Questions organized in sets of 50. Complete Set 1, move to Set 2. Systematic coverage — no question left behind.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: Sparkles,
    title: 'AI Question Generation',
    desc: 'Generate exam-quality MCQs using AI with authentic patterns — statement-based, match-the-following, and negative framing.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: TrendingUp,
    title: 'Smart Progress Tracking',
    desc: 'Track attempted vs remaining questions per subject. Unattempted questions are prioritized — systematic syllabus coverage.',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    icon: Clock,
    title: 'PYQ Papers',
    desc: 'Previous Year Questions from UPSC, BPSC, and State PSCs. Filter by exam, year, and difficulty. Practice with real exam questions.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up & Set Goals', desc: 'Create your account, add your target exams, and set daily study goals', icon: Target },
  { step: '02', title: 'Plan & Study', desc: 'Use task planner, log study sessions by subject, and read GS Paper-wise current affairs', icon: BookOpen },
  { step: '03', title: 'Practice & Test', desc: 'Solve subject-wise MCQs in sets of 50, take mock tests, and review detailed explanations', icon: BrainCircuit },
  { step: '04', title: 'Analyze & Improve', desc: 'Track progress with visual analytics, identify weak areas, and systematically cover the syllabus', icon: BarChart3 },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'UPSC CSE 2025 Aspirant',
    text: 'The GS Paper-wise current affairs categorization is a game-changer. I save 2 hours daily on news reading. The study logger keeps me accountable.',
    avatar: 'PS',
    color: TEAL,
  },
  {
    name: 'Shashank Sharma',
    role: 'BPSC Aspirant',
    text: 'Finally an app that understands what PSC aspirants actually need. The task planner and syllabus tracker keep my entire preparation organized.',
    avatar: 'SS',
    color: '#3b82f6',
  },
  {
    name: 'Anuradha Kumari',
    role: 'BPSSC SI Aspirant',
    text: 'The set-wise practice of 50 questions each is perfect. I complete one set daily and track my progress across all subjects systematically.',
    avatar: 'AK',
    color: '#a855f7',
  },
]

const FAQS = [
  {
    q: 'Which exams does ExamPrep support?',
    a: 'ExamPrep is designed for UPSC CSE (Prelims & Mains), BPSC, UPPSC, MPSC, WBPSC, RPSC, KPSC, BPSSC SI, and all state-level civil service exams. The current affairs, study tools, and syllabus tracker are aligned with the common GS syllabus shared across these exams.',
  },
  {
    q: 'How is current affairs categorized?',
    a: 'News articles from The Hindu, Indian Express, NDTV, LiveMint, Times of India, and Down To Earth are auto-categorized by UPSC GS Papers (GS-I, GS-II, GS-III, Prelims) using intelligent keyword analysis. You can mark articles as read, add them to study notes, and create tasks from them.',
  },
  {
    q: 'How does the test series work?',
    a: 'Questions are organized subject-wise and exam-wise. Each subject has questions in sets of 50. You practice Set 1 (Q1-50), then Set 2 (Q51-100), and so on. AI generates exam-quality MCQs with authentic patterns. Every question has detailed explanations. Your progress is tracked across all subjects.',
  },
  {
    q: 'Can I track my preparation progress?',
    a: 'Yes — at multiple levels. The Study Logger tracks daily hours by subject. The Syllabus Tracker shows topic-wise status (Not Started, In Progress, Revised, Done). Progress Analytics gives you visual charts of study trends. And the Quiz system tracks attempted vs remaining questions per subject.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes, ExamPrep is fully responsive and works on mobile browsers. You can read current affairs, practice questions, log study sessions, and manage tasks on the go.',
  },
  {
    q: 'What happens after my free trial?',
    a: 'Your data is safely stored. You can subscribe to continue or renew anytime and pick up exactly where you left off. We never delete your study logs, notes, or quiz history. Cancel anytime — no lock-in.',
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
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Features</a>
          <a href="#test-series" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Test Series</a>
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
          <a href="#features" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Features</a>
          <a href="#test-series" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Test Series</a>
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
        background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 60%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(20,184,166,0.04)', top: -100, right: -150 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.03)', bottom: -80, left: -100 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px 6px 8px',
            background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999,
            fontSize: 13, fontWeight: 600, color: SLATE, marginBottom: 28,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <span style={{
              padding: '3px 8px', borderRadius: 999,
              background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700,
            }}>NEW</span>
            Built for UPSC, BPSC, BPSSC & State PSC Aspirants
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900,
            lineHeight: 1.1, margin: '0 0 20px', letterSpacing: -1, color: NAVY,
          }}>
            Your Complete
            <br />
            <span style={{ color: TEAL }}>Exam Preparation</span>
            <br />
            Command Center
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6,
            color: SLATE, maxWidth: 620, margin: '0 auto 36px',
          }}>
            Track exams, log study hours, read GS Paper-wise current affairs, practice MCQs, and track your entire syllabus — all in one place. Built by aspirants, for aspirants.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={goSignUp} style={{
              padding: '14px 32px', background: TEAL, color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(20,184,166,0.3)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
              onMouseLeave={e => e.currentTarget.style.background = TEAL}
            >
              Start 7-Day Free Trial <ArrowRight size={18} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '14px 28px', background: '#fff',
              border: `1.5px solid ${BORDER}`, borderRadius: 12,
              fontSize: 16, fontWeight: 600, color: SLATE, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = TEAL}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              See Features
            </button>
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, marginTop: 40, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex' }}>
              {['PS', 'RV', 'AR', 'MK'].map((init, i) => (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: [TEAL, '#3b82f6', '#f59e0b', '#a855f7'][i],
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff', marginLeft: i > 0 ? -10 : 0,
                }}>{init}</div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>Trusted by 100+ aspirants</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SUPPORTED EXAMS BAR ─── */}
      <section style={{
        padding: '24px', background: NAVY,
      }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 1.5, marginRight: 8 }}>
            Exams Covered:
          </span>
          {SUPPORTED_EXAMS.map(exam => (
            <span key={exam} style={{
              fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.08)', padding: '5px 14px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>{exam}</span>
          ))}
        </div>
      </section>

      {/* ─── GS PAPER CATEGORIES ─── */}
      <section style={{
        padding: '70px 24px', background: NAVY,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            UPSC & State PSC Aligned
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            Everything organized by GS Papers
          </h2>
          <p style={{ textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto 40px' }}>
            Current affairs, study logs, notes, quiz questions — all mapped to the UPSC GS Paper structure
          </p>
          <div className="lp-gs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {GS_PAPERS.map(({ paper, topics, color, icon: Icon }) => (
              <div key={paper} style={{
                padding: '24px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                borderTop: `3px solid ${color}`,
                transition: 'all 0.2s',
              }}
                className="lp-gs-card"
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, marginBottom: 12,
                  background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{
                  display: 'inline-block', padding: '3px 10px',
                  background: color, borderRadius: 6,
                  fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 10,
                }}>{paper}</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{topics}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURES ─── */}
      <section id="features" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Preparation Tools
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
            Everything you need to crack the exam
          </h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: MUTED, maxWidth: 560, margin: '0 auto 48px' }}>
            Every feature designed around the UPSC/PSC preparation workflow — from daily current affairs to syllabus tracking.
          </p>

          <div className="lp-features-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }}>
            {CORE_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} style={{
                padding: 26, border: `1px solid ${BORDER}`, borderRadius: 16,
                transition: 'all 0.2s', cursor: 'default',
              }}
                className="lp-feature-card"
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: 0 }}>{desc}</p>
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

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            How It Works
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 48px' }}>
            Start preparing in 4 simple steps
          </h2>
          <div className="lp-steps-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          }}>
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} style={{ textAlign: 'center' }}>
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

      {/* ─── TEST SERIES ─── */}
      <section id="test-series" style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdfa 50%, #f5f3ff 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 999, marginBottom: 16,
              background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)', border: '1px solid #e0e7ff',
            }}>
              <Sparkles size={13} color="#7c3aed" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>AI-POWERED</span>
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
              MCQ Test Series & Practice
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 560, margin: '0 auto' }}>
              Subject-wise and exam-wise question sets with AI-generated MCQs, detailed explanations, and performance tracking.
            </p>
          </div>

          <div className="lp-ts-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }}>
            {TEST_SERIES_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} style={{
                padding: 26, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16,
                transition: 'all 0.2s',
              }}
                className="lp-feature-card"
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 48, marginTop: 48, flexWrap: 'wrap',
          }}>
            {[
              { value: '1000+', label: 'MCQ Questions' },
              { value: '8+', label: 'Subjects' },
              { value: '50', label: 'Qs per Set' },
              { value: 'AI', label: 'Generated' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: NAVY }}>{value}</div>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
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
          <p style={{ textAlign: 'center', fontSize: 16, color: MUTED, maxWidth: 500, margin: '0 auto 32px' }}>
            Study tools, current affairs, test series, analytics — everything included. 7-day free trial.
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
                {['All features included', 'Daily current affairs by GS Paper', 'Study analytics & progress charts', 'Syllabus tracker', 'MCQ test series (1000+ Qs)', 'Unlimited study logs & notes'].map(f => (
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
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
            Your preparation deserves
            <br />
            <span style={{ color: TEAL }}>a better system</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 32px', lineHeight: 1.6 }}>
            Join thousands of UPSC & State PSC aspirants who study smarter. Current affairs, study tracking, MCQ practice, syllabus management — all in one place.
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
            &copy; 2026 ExamPrep. Made for aspirants, by aspirants.
          </p>
        </div>
      </footer>

      {/* ─── RESPONSIVE STYLES ─── */}
      <style>{`
        @media (max-width: 1024px) {
          .lp-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-ts-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-gs-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          .lp-hamburger { display: flex !important; }
          .lp-gs-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-ts-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-pricing-grid { grid-template-columns: 1fr !important; }
          .lp-testimonials-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .lp-steps-grid { grid-template-columns: 1fr !important; }
          .lp-gs-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .lp-mobile-menu { display: none !important; }
        }
        .lp-feature-card:hover {
          border-color: ${TEAL} !important;
          box-shadow: 0 4px 16px rgba(20,184,166,0.08);
        }
        .lp-gs-card:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.15) !important;
        }
      `}</style>
    </div>
  )
}
