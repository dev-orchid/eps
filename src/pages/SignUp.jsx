import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, CheckSquare, BarChart3, Bell, Eye, EyeOff } from 'lucide-react'

const TEAL = '#14b8a6'
const TEAL_DARK = '#0d9488'
const TEXT_DARK = '#1e293b'
const TEXT_MUTED = '#64748b'
const BORDER = '#e2e8f0'
const BG_SUBTLE = '#f8fafc'

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: '#ffffff',
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  color: TEXT_DARK,
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  color: TEXT_MUTED,
  marginBottom: 6,
  fontWeight: 500,
  fontFamily: 'DM Sans, sans-serif',
}

const features = [
  { icon: GraduationCap, label: 'Exam Tracking' },
  { icon: CheckSquare, label: 'Task Management' },
  { icon: BarChart3, label: 'Study Analytics' },
  { icon: Bell, label: 'Smart Alarms' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.9 7.34 2.44 10.52l8.09-5.93z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-8.09 5.93C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error: err } = await signUp(email, password, fullName, phone)
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Left branding panel */}
      <div style={{
        width: '60%',
        background: 'linear-gradient(135deg, #e0f7f0 0%, #f0fdf4 50%, #e0f7f0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="branding-panel"
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -80, left: -80, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(20, 184, 166, 0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -60, width: 250, height: 250,
          borderRadius: '50%', background: 'rgba(13, 148, 136, 0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '10%', width: 150, height: 150,
          borderRadius: '50%', background: 'rgba(20, 184, 166, 0.05)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(20, 184, 166, 0.12)', marginBottom: 20,
          }}>
            <GraduationCap size={32} color={TEAL} />
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: TEAL_DARK,
            margin: '0 0 8px', letterSpacing: '-0.5px',
          }}>
            ExamPrep
          </h1>
          <p style={{
            fontSize: 18, color: TEXT_DARK, fontWeight: 500,
            margin: '0 0 4px', lineHeight: 1.5,
          }}>
            Master your exams, one session at a time.
          </p>
          <p style={{
            fontSize: 14, color: TEXT_MUTED, fontWeight: 400,
            margin: '0 0 48px', letterSpacing: '1.5px', textTransform: 'lowercase',
          }}>
            plan. study. achieve.
          </p>

          {/* Feature grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            {features.map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '20px 16px',
                background: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 14, backdropFilter: 'blur(8px)',
              }}>
                <Icon size={22} color={TEAL} strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        width: '40%',
        minWidth: 0,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
      }}
        className="form-panel"
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{
            fontSize: 26, fontWeight: 700, color: TEXT_DARK,
            textAlign: 'center', margin: '0 0 32px',
          }}>
            Create Account
          </h2>

          {/* Google sign-in button */}
          <button
            type="button"
            onClick={() => alert('Google sign-in coming soon')}
            style={{
              width: '100%', padding: '12px 16px',
              background: '#ffffff', border: `1px solid ${BORDER}`,
              borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 500, color: TEXT_DARK,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = BG_SUBTLE}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '10px 14px',
              marginBottom: 20, color: '#dc2626', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{
                  padding: '12px 10px 12px 14px',
                  background: '#f8fafc',
                  border: `1px solid ${BORDER}`,
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  color: TEXT_MUTED,
                  fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif',
                  whiteSpace: 'nowrap',
                }}>+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhone(val)
                  }}
                  placeholder="10-digit mobile number"
                  required
                  style={{ ...inputStyle, borderRadius: '0 10px 10px 0' }}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{ ...inputStyle, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword
                    ? <EyeOff size={18} color={TEXT_MUTED} />
                    : <Eye size={18} color={TEXT_MUTED} />
                  }
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  style={{ ...inputStyle, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor = TEAL}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', alignItems: 'center',
                  }}
                >
                  {showConfirm
                    ? <EyeOff size={18} color={TEXT_MUTED} />
                    : <Eye size={18} color={TEXT_MUTED} />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? TEAL_DARK : TEAL,
                color: '#ffffff', border: 'none',
                borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'background 0.2s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = TEAL_DARK }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = TEAL }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 28, fontSize: 14, color: TEXT_MUTED,
          }}>
            Already have an account?{' '}
            <Link to="/signin" style={{
              color: TEAL, textDecoration: 'none', fontWeight: 600,
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .branding-panel { display: none !important; }
          .form-panel { width: 100% !important; min-height: 100vh; }
        }
      `}</style>
    </div>
  )
}
