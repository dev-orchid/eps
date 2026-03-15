import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, CheckSquare, BarChart3, Bell, BookOpen, Newspaper,
  Clock, Target, Award, ArrowRight, Check, Star, Users, Zap, Shield,
  ChevronDown, Menu, X, Flame, Brain, FileText, TrendingUp, BrainCircuit,
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
const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Exam Countdown',
    desc: 'Track UPSC Prelims, Mains, State PSC dates with live countdown timers. Never miss a deadline.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: Newspaper,
    title: 'Daily Current Affairs',
    desc: 'Auto-curated news from The Hindu, Indian Express, NDTV & more — categorized by GS Paper.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: CheckSquare,
    title: 'Smart Task Planner',
    desc: 'Organize your syllabus into daily tasks with priority levels. Build consistency, not cramming.',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    icon: BookOpen,
    title: 'Study Session Logger',
    desc: 'Log hours by subject — Polity, Economy, Geography, History. See where your time actually goes.',
    color: '#a855f7',
    bg: '#faf5ff',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'Visual charts showing weekly/monthly study trends. Data-driven preparation, not guesswork.',
    color: TEAL,
    bg: '#f0fdfa',
  },
  {
    icon: Bell,
    title: 'Study Alarms',
    desc: 'Custom reminders for revision, mock tests, and reading sessions. Stay disciplined effortlessly.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  {
    icon: BrainCircuit,
    title: 'MCQ Test Series',
    desc: 'Practice 170+ UPSC & State PSC PYQs across Polity, Economy, History, Science & more. Filter by exam, year, and difficulty.',
    color: '#6366f1',
    bg: '#eef2ff',
  },
  {
    icon: Target,
    title: 'Subject-wise Practice',
    desc: 'Pick any GS paper or subject — Physics, Chemistry, Biology, Maths included. Instant quiz with detailed explanations.',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
]

const GS_PAPERS = [
  { paper: 'GS-I', topics: 'History, Geography, Art & Culture, Society', color: '#3b82f6' },
  { paper: 'GS-II', topics: 'Polity, Governance, IR, Social Justice', color: '#22c55e' },
  { paper: 'GS-III', topics: 'Economy, Science & Tech, Environment, Security', color: '#f59e0b' },
  { paper: 'Prelims', topics: 'Current Affairs, Static GK, CSAT', color: '#a855f7' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'UPSC CSE 2025 Aspirant',
    text: 'The GS Paper-wise current affairs categorization is a game-changer. I save 2 hours daily on news reading.',
    avatar: 'PS',
  },
  {
    name: 'Shashank Sharma',
    role: 'BPSC AEDO Aspirant',
    text: 'Finally an app that understands what PSC aspirants actually need. The study logger keeps me accountable.',
    avatar: 'SS',
  },
  {
    name: 'Anuradha Kumari',
    role: 'UPSC CSE 2025 Aspirant',
    text: 'Used ExamPrep throughout my preparation. The exam countdown and task planner kept me on track during Prelims.',
    avatar: 'AK',
  },
]

const FAQS = [
  {
    q: 'Is this app useful for State PSC exams too?',
    a: 'Absolutely. ExamPrep works for UPSC CSE, BPSC, UPPSC, MPSC, WBPSC, KPSC, and all state-level civil service exams. The current affairs and study tools are designed for the common GS syllabus shared across these exams.',
  },
  {
    q: 'How is current affairs categorized?',
    a: 'News articles from The Hindu, Indian Express, NDTV, LiveMint, and other sources are auto-categorized by UPSC GS Papers (GS-I, GS-II, GS-III, Prelims) using keyword analysis. You can mark articles as read, add them to your study notes, and filter by category.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes, ExamPrep is fully responsive and works on mobile browsers. You can log study sessions, read current affairs, and manage tasks on the go.',
  },
  {
    q: 'What happens after my subscription ends?',
    a: 'Your data is safely stored. You can renew anytime and pick up exactly where you left off. We never delete your study logs or notes.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, there are no lock-in contracts. Cancel your subscription anytime from your profile settings. You retain access until the end of your billing period.',
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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: scrolled ? NAVY : NAVY, letterSpacing: -0.5 }}>
            ExamPrep
          </span>
        </div>

        {/* Desktop nav */}
        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Pricing</a>
          <a href="#testimonials" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>Reviews</a>
          <a href="#faq" style={{ fontSize: 14, fontWeight: 500, color: SLATE, textDecoration: 'none' }}>FAQ</a>
          <button onClick={onSignIn} style={{
            padding: '8px 18px', background: 'none', border: `1.5px solid ${BORDER}`,
            borderRadius: 10, fontSize: 14, fontWeight: 600, color: SLATE, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            Sign in
          </button>
          <button onClick={onSignUp} style={{
            padding: '8px 20px', background: TEAL, border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            Start Free Trial
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          {menuOpen ? <X size={24} color={NAVY} /> : <Menu size={24} color={NAVY} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lp-mobile-menu" style={{
          background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <a href="#features" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Pricing</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: SLATE, textDecoration: 'none', padding: '8px 0' }}>Reviews</a>
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
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '18px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? '#f0fdfa' : '#fff', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 600, color: NAVY, textAlign: 'left',
          transition: 'background 0.2s',
        }}
      >
        {q}
        <ChevronDown size={18} color={MUTED} style={{
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0, marginLeft: 12,
        }} />
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: 14, lineHeight: 1.7, color: SLATE }}>
          {a}
        </div>
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 60%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(20,184,166,0.04)', top: -100, right: -150 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.03)', bottom: -80, left: -100 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
          {/* Badge */}
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
            Built for UPSC & State PSC Aspirants
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 900,
            lineHeight: 1.1,
            margin: '0 0 20px',
            letterSpacing: -1,
            color: NAVY,
          }}>
            Your Complete
            <br />
            <span style={{ color: TEAL }}>Exam Preparation</span>
            <br />
            Command Center
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            lineHeight: 1.6,
            color: SLATE,
            maxWidth: 580,
            margin: '0 auto 36px',
          }}>
            Track exams, log study hours, read GS Paper-wise current affairs, and stay disciplined — all in one place. Built by aspirants, for aspirants.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={goSignUp}
              style={{
                padding: '14px 32px', background: TEAL, color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(20,184,166,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
              onMouseLeave={e => e.currentTarget.style.background = TEAL}
            >
              Start 7-Day Free Trial <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '14px 28px', background: '#fff',
                border: `1.5px solid ${BORDER}`, borderRadius: 12,
                fontSize: 16, fontWeight: 600, color: SLATE, cursor: 'pointer',
                transition: 'all 0.2s',
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
                }}>
                  {init}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>Trusted by 1,00+ aspirants</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GS Paper Categories ─── */}
      <section style={{
        padding: '60px 24px',
        background: NAVY,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            UPSC Aligned
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 40px' }}>
            Current Affairs sorted by GS Papers
          </h2>
          <div className="lp-gs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {GS_PAPERS.map(({ paper, topics, color }) => (
              <div key={paper} style={{
                padding: '24px 20px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                borderTop: `3px solid ${color}`,
              }}>
                <div style={{
                  display: 'inline-block', padding: '4px 12px',
                  background: color, borderRadius: 8,
                  fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 12,
                }}>
                  {paper}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  {topics}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Everything You Need
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: NAVY, margin: '0 0 12px' }}>
            Built for serious aspirants
          </h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: MUTED, maxWidth: 550, margin: '0 auto 48px' }}>
            Every feature designed around the UPSC/PSC preparation workflow.
          </p>

          <div className="lp-features-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
          }}>
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} style={{
                padding: 28,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                transition: 'all 0.2s',
                cursor: 'default',
              }}
                className="lp-feature-card"
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWS SOURCES ─── */}
      <section style={{ padding: '50px 24px', background: '#f8fafc', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            News curated from trusted sources
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
            Invest in your preparation, not expensive coaching. 7-day free trial included.
          </p>

          {/* Toggle */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 36,
          }}>
            <div style={{
              display: 'inline-flex', background: '#f1f5f9', borderRadius: 12, padding: 4,
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 20px', borderRadius: 10, border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'monthly' ? '#fff' : 'transparent',
                  color: billingCycle === 'monthly' ? NAVY : MUTED,
                  boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '8px 20px', borderRadius: 10, border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: billingCycle === 'yearly' ? '#fff' : 'transparent',
                  color: billingCycle === 'yearly' ? NAVY : MUTED,
                  boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Yearly
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#ecfdf5', color: '#059669',
                  padding: '2px 6px', borderRadius: 999,
                }}>SAVE 25%</span>
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="lp-pricing-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
            maxWidth: 700, margin: '0 auto',
          }}>
            {/* Monthly */}
            <div style={{
              padding: 32,
              border: `1.5px solid ${billingCycle === 'monthly' ? TEAL : BORDER}`,
              borderRadius: 20,
              background: '#fff',
              transition: 'border-color 0.2s',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Monthly</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: NAVY }}>&#8377;150</span>
                <span style={{ fontSize: 15, color: MUTED, fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ fontSize: 13, color: MUTED, margin: '0 0 24px' }}>Flexible monthly billing</p>
              <button
                onClick={goSignUp}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  background: billingCycle === 'monthly' ? TEAL : '#fff',
                  color: billingCycle === 'monthly' ? '#fff' : NAVY,
                  border: billingCycle === 'monthly' ? 'none' : `1.5px solid ${BORDER}`,
                  transition: 'all 0.2s', marginBottom: 24,
                }}
              >
                Start Free Trial
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['All features included', 'Daily current affairs', 'Study analytics', 'Exam countdown timers', 'Unlimited study logs'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SLATE }}>
                    <Check size={15} color={TEAL} /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly */}
            <div style={{
              padding: 32,
              border: `1.5px solid ${billingCycle === 'yearly' ? TEAL : BORDER}`,
              borderRadius: 20,
              background: billingCycle === 'yearly' ? '#f0fdfa' : '#fff',
              position: 'relative',
              transition: 'all 0.2s',
            }}>
              {/* Popular badge */}
              <div style={{
                position: 'absolute', top: -12, right: 20,
                background: TEAL, color: '#fff', padding: '4px 14px',
                borderRadius: 999, fontSize: 11, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Most Popular
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Yearly</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: NAVY }}>&#8377;1,350</span>
                <span style={{ fontSize: 15, color: MUTED, fontWeight: 500 }}>/year</span>
              </div>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 600, margin: '0 0 24px' }}>
                &#8377;112.50/month — Save &#8377;450/year
              </p>
              <button
                onClick={goSignUp}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  background: TEAL, color: '#fff', border: 'none',
                  boxShadow: billingCycle === 'yearly' ? '0 4px 14px rgba(20,184,166,0.25)' : 'none',
                  transition: 'all 0.2s', marginBottom: 24,
                }}
              >
                Start Free Trial
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Everything in Monthly', 'Priority support', 'Save 25% annually', 'Full preparation cycle coverage', '7-day free trial'].map(f => (
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
            {TESTIMONIALS.map(({ name, role, text, avatar }) => (
              <div key={name} style={{
                padding: 28,
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: SLATE, margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: TEAL, color: '#fff', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {avatar}
                  </div>
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
              <FAQItem
                key={q}
                q={q}
                a={a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
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
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 32px', lineHeight: 1.6 }}>
            Join thousands of UPSC & State PSC aspirants who study smarter, not harder. Start your 7-day free trial today.
          </p>
          <button
            onClick={goSignUp}
            style={{
              padding: '16px 40px', background: TEAL, color: '#fff',
              border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(20,184,166,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = TEAL_DARK}
            onMouseLeave={e => e.currentTarget.style.background = TEAL}
          >
            Start Free Trial <ArrowRight size={18} />
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 14 }}>
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: '40px 24px',
        background: NAVY,
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
        }
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          .lp-hamburger { display: flex !important; }
          .lp-gs-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-pricing-grid { grid-template-columns: 1fr !important; }
          .lp-testimonials-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .lp-mobile-menu { display: none !important; }
        }
        .lp-feature-card:hover {
          border-color: ${TEAL} !important;
          box-shadow: 0 4px 16px rgba(20,184,166,0.08);
        }
      `}</style>
    </div>
  )
}
