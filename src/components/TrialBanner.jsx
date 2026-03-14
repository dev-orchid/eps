import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, AlertTriangle, Clock, X } from 'lucide-react'
import { useState } from 'react'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b', orangeLight: '#fffbeb',
  white: '#ffffff', muted: '#94a3b8', border: '#e2e8f0',
}

export default function TrialBanner() {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)

  // Don't show for admins, premium users, on plans/profile pages, or if no profile
  if (!profile || isAdmin || profile.plan === 'Premium') return null
  if (location.pathname === '/plans' || location.pathname === '/profile') return null

  const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null
  if (!trialEnd) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(trialEnd)
  end.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  const isExpired = daysLeft <= 0

  // Trial expired — show blocking overlay
  if (isExpired) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          background: C.white, borderRadius: 20, padding: '40px 36px',
          maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: C.redLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertTriangle size={32} color={C.red} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: '0 0 8px' }}>
            Your Trial Has Ended
          </h2>
          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px', lineHeight: 1.6 }}>
            Your 7-day free trial has expired. Subscribe to continue using ExamPrep and keep your study progress.
          </p>
          <button
            onClick={() => navigate('/plans')}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: C.teal, color: C.white, fontSize: 16, fontWeight: 700,
              cursor: 'pointer', marginBottom: 12, transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.tealDark}
            onMouseLeave={e => e.currentTarget.style.background = C.teal}
          >
            <Zap size={18} /> Subscribe Now
          </button>
          <button
            onClick={() => {
              window.location.href = 'mailto:support@orchidsw.com?subject=Trial Extension Request&body=Hi, I would like to request a trial extension for my ExamPrep account.'
            }}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              border: `1.5px solid ${C.border}`, background: C.white,
              color: C.navy, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = C.white}
          >
            Request Trial Extension
          </button>
        </div>
      </div>
    )
  }

  // Dismissed banner — don't show
  if (dismissed) return null

  // Determine banner style based on urgency
  let bannerBg, bannerBorder, iconColor, textColor, Icon
  if (daysLeft <= 2) {
    bannerBg = C.redLight
    bannerBorder = '#fecaca'
    iconColor = C.red
    textColor = C.red
    Icon = AlertTriangle
  } else if (daysLeft <= 4) {
    bannerBg = C.orangeLight
    bannerBorder = '#fde68a'
    iconColor = C.orange
    textColor = '#b45309'
    Icon = Clock
  } else {
    bannerBg = C.tealLight
    bannerBorder = '#99f6e4'
    iconColor = C.teal
    textColor = C.tealDark
    Icon = Zap
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 20px', margin: '0 0 0 0',
      background: bannerBg, borderBottom: `1px solid ${bannerBorder}`,
    }}>
      <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: textColor, flex: 1 }}>
        {daysLeft === 1
          ? 'Last day of your trial!'
          : `${daysLeft} days left in your trial.`}
        {' '}
        <span style={{ fontWeight: 400 }}>
          {daysLeft <= 2
            ? 'Subscribe now to keep your progress.'
            : 'Upgrade anytime to unlock all features.'}
        </span>
      </span>
      <button
        onClick={() => navigate('/plans')}
        style={{
          padding: '6px 16px', borderRadius: 8, border: 'none',
          background: daysLeft <= 2 ? C.red : C.teal,
          color: C.white, fontSize: 12, fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        View Plans
      </button>
      {daysLeft > 2 && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 2, display: 'flex', flexShrink: 0,
          }}
        >
          <X size={16} color={iconColor} />
        </button>
      )}
    </div>
  )
}
