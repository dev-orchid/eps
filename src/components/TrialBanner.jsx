import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, AlertTriangle, Clock, X, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b', orangeLight: '#fffbeb',
  white: '#ffffff', muted: '#94a3b8', border: '#e2e8f0',
}

export function useTrialExpired() {
  const { profile, isAdmin } = useAuth()
  if (!profile || isAdmin || profile.plan === 'Premium') return false
  if (!profile.trial_end) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const [y, m, d] = profile.trial_end.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24)) <= 0
}

export default function TrialBanner() {
  const { profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  const [extensionStatus, setExtensionStatus] = useState(null) // null | 'loading' | 'sent' | 'already' | 'error'

  // Don't show for admins, premium users, on plans/profile pages, or if no profile
  if (!profile || isAdmin || profile.plan === 'Premium') return null
  if (location.pathname === '/plans' || location.pathname === '/profile') return null

  if (!profile.trial_end) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  // Parse as local date to avoid UTC timezone offset
  const [y, m, d] = profile.trial_end.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  const isExpired = daysLeft <= 0

  // Trial expired — show blocking content (replaces page content in AppLayout)
  if (isExpired) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, background: '#f8fafc',
      }}>
        <div style={{
          background: C.white, borderRadius: 20, padding: '40px 36px',
          maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
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
            disabled={extensionStatus === 'loading' || extensionStatus === 'sent' || extensionStatus === 'already'}
            onClick={async () => {
              if (!profile?.id) return
              setExtensionStatus('loading')
              try {
                // Check if user already has a pending request
                const { data: existing } = await supabase
                  .from('trial_extension_requests')
                  .select('id')
                  .eq('user_id', profile.id)
                  .eq('status', 'pending')
                  .limit(1)
                if (existing && existing.length > 0) {
                  setExtensionStatus('already')
                  return
                }
                const { error } = await supabase
                  .from('trial_extension_requests')
                  .insert({ user_id: profile.id })
                if (error) throw error
                setExtensionStatus('sent')
              } catch {
                setExtensionStatus('error')
              }
            }}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              border: `1.5px solid ${C.border}`,
              background: extensionStatus === 'sent' || extensionStatus === 'already' ? '#f0fdf4' : C.white,
              color: extensionStatus === 'sent' || extensionStatus === 'already' ? '#16a34a' : C.navy,
              fontSize: 14, fontWeight: 600,
              cursor: extensionStatus === 'loading' || extensionStatus === 'sent' || extensionStatus === 'already' ? 'default' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: extensionStatus === 'loading' ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!extensionStatus) e.currentTarget.style.background = '#f8fafc' }}
            onMouseLeave={e => { if (!extensionStatus) e.currentTarget.style.background = C.white }}
          >
            {extensionStatus === 'loading' && <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending Request...</>}
            {extensionStatus === 'sent' && <><CheckCircle size={16} /> Request Sent!</>}
            {extensionStatus === 'already' && <><CheckCircle size={16} /> Request Already Pending</>}
            {extensionStatus === 'error' && 'Failed — Try Again'}
            {!extensionStatus && 'Request Trial Extension'}
          </button>
          {extensionStatus === 'sent' && (
            <p style={{ fontSize: 12, color: C.muted, margin: '8px 0 0', textAlign: 'center' }}>
              An admin will review your request shortly.
            </p>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
