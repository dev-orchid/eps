import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePaymentSettings } from '../hooks/usePaymentSettings'
import { usePayments } from '../hooks/usePayments'
import { useProfiles } from '../hooks/useProfiles'
import { Check, Crown, Zap, ArrowLeft, CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', navyLight: '#1e293b', slate: '#334155',
  muted: '#94a3b8', border: '#e2e8f0', bg: '#f8fafc', white: '#ffffff',
  green: '#22c55e', greenLight: '#f0fdf4', red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b', orangeLight: '#fffbeb', purple: '#a855f7',
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Plans() {
  const { user, profile, refreshProfile } = useAuth()
  const { settings, loading: settingsLoading } = usePaymentSettings()
  const { recordPayment } = usePayments()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('yearly')
  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isPremium = profile?.plan === 'Premium'
  const monthlyPrice = parseInt(settings.monthly_price || '15000')
  const yearlyPrice = parseInt(settings.yearly_price || '135000')
  const razorpayKey = settings.razorpay_key_id || ''
  const currency = settings.currency || 'INR'
  const monthlyPlanId = settings.monthly_plan_id || ''
  const yearlyPlanId = settings.yearly_plan_id || ''

  const handlePayment = async (plan) => {
    setPayError(null)

    if (!razorpayKey) {
      setPayError('Payment is not configured yet. Please contact the administrator.')
      return
    }

    const loaded = await loadRazorpay()
    if (!loaded) {
      setPayError('Failed to load payment gateway. Please check your internet connection.')
      return
    }

    setProcessing(true)

    const amount = plan === 'monthly' ? monthlyPrice : yearlyPrice
    const planLabel = plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'
    const planId = plan === 'monthly' ? monthlyPlanId : yearlyPlanId
    const isSubscription = !!planId

    const onSuccess = async (response) => {
      await recordPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || '',
        razorpay_subscription_id: response.razorpay_subscription_id || '',
        plan: plan,
        amount: amount,
        currency: currency,
        status: 'success',
      })

      await supabase
        .from('profiles')
        .update({ plan: 'Premium', trial_end: null })
        .eq('id', user.id)

      await refreshProfile()
      setProcessing(false)
      setSuccess(true)
    }

    const onFailure = async (response) => {
      await recordPayment({
        razorpay_payment_id: response.error?.metadata?.payment_id || '',
        razorpay_order_id: response.error?.metadata?.order_id || '',
        plan: plan,
        amount: amount,
        currency: currency,
        status: 'failed',
      })
      setPayError('Payment failed. Please try again.')
      setProcessing(false)
    }

    const options = {
      key: razorpayKey,
      name: 'ExamPrep',
      description: `ExamPrep ${planLabel}`,
      prefill: {
        email: user?.email || '',
        name: profile?.full_name || '',
        contact: profile?.phone || '',
      },
      theme: { color: C.teal },
      modal: { ondismiss: () => setProcessing(false) },
    }

    if (isSubscription) {
      // Create subscription via edge function, then open Razorpay checkout
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setPayError('Please log in again to continue.')
          setProcessing(false)
          return
        }
        const { data, error: fnError } = await supabase.functions.invoke('create-subscription', {
          body: { plan },
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        // supabase.functions.invoke returns error for non-2xx, but data may still have our JSON
        const result = data || {}
        if (fnError || result.error) {
          const msg = result.error || fnError?.message || 'Failed to create subscription.'
          console.error('Subscription error:', fnError, result)
          setPayError(msg)
          setProcessing(false)
          return
        }
        if (!result.subscription_id) {
          console.error('No subscription_id in response:', result)
          setPayError('Invalid response from server. Please try again.')
          setProcessing(false)
          return
        }
        options.subscription_id = result.subscription_id
      } catch (err) {
        console.error('Subscription catch:', err)
        setPayError('Failed to create subscription. Please try again.')
        setProcessing(false)
        return
      }
      options.handler = onSuccess
    } else {
      // One-time payment fallback
      options.amount = amount
      options.currency = currency
      options.handler = onSuccess
    }

    const razorpay = new window.Razorpay(options)
    razorpay.on('payment.failed', onFailure)
    razorpay.open()
  }

  if (settingsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10 }}>
        <Loader2 size={22} color={C.teal} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 14, color: C.muted }}>Loading plans...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: C.greenLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Check size={32} color={C.green} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.navy, margin: '0 0 8px' }}>Welcome to Premium!</h2>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 28px', lineHeight: 1.6 }}>
          Your payment was successful. Enjoy unlimited access to all ExamPrep features.
        </p>
        <button onClick={() => navigate('/dashboard')} style={{
          padding: '12px 28px', borderRadius: 12, border: 'none', background: C.teal,
          color: C.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.tealDark}
          onMouseLeave={e => e.currentTarget.style.background = C.teal}
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate('/dashboard')} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
        border: '1px solid ' + C.border, background: C.white, cursor: 'pointer', fontSize: 13,
        fontWeight: 500, color: C.slate, marginBottom: 24, transition: 'all 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = C.bg}
        onMouseLeave={e => e.currentTarget.style.background = C.white}
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Current plan badge */}
      {isPremium && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 12,
          background: C.tealLight, border: '1px solid ' + C.teal, marginBottom: 24,
        }}>
          <Crown size={18} color={C.teal} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.tealDark }}>
            You are on the Premium plan. Enjoy all features!
          </span>
        </div>
      )}

      {/* Error */}
      {payError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 10,
          background: C.redLight, border: '1px solid #fecaca', marginBottom: 20,
        }}>
          <AlertCircle size={16} color={C.red} />
          <span style={{ fontSize: 13, fontWeight: 500, color: C.red }}>{payError}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: '0 0 8px' }}>
          Choose your plan
        </h2>
        <p style={{ fontSize: 15, color: C.muted, margin: 0 }}>
          Invest in your preparation. 7-day free trial included with every plan.
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
          <button onClick={() => setBillingCycle('monthly')} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: billingCycle === 'monthly' ? C.white : 'transparent',
            color: billingCycle === 'monthly' ? C.navy : C.muted,
            boxShadow: billingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}>Monthly</button>
          <button onClick={() => setBillingCycle('yearly')} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: billingCycle === 'yearly' ? C.white : 'transparent',
            color: billingCycle === 'yearly' ? C.navy : C.muted,
            boxShadow: billingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Yearly
            <span style={{ fontSize: 10, fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: 999 }}>
              SAVE 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 700, margin: '0 auto' }}>
        {/* Monthly */}
        <div style={{
          padding: 32, border: `1.5px solid ${billingCycle === 'monthly' ? C.teal : C.border}`,
          borderRadius: 20, background: C.white, transition: 'border-color 0.2s',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Monthly</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: C.navy }}>&#8377;{(monthlyPrice / 100).toLocaleString()}</span>
            <span style={{ fontSize: 15, color: C.muted, fontWeight: 500 }}>/month</span>
          </div>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>Flexible monthly billing</p>
          <button
            onClick={() => handlePayment('monthly')}
            disabled={processing || isPremium}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: processing || isPremium ? 'default' : 'pointer',
              background: billingCycle === 'monthly' && !isPremium ? C.teal : C.white,
              color: billingCycle === 'monthly' && !isPremium ? C.white : C.navy,
              border: billingCycle === 'monthly' && !isPremium ? 'none' : `1.5px solid ${C.border}`,
              transition: 'all 0.2s', marginBottom: 24, opacity: isPremium ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {processing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={16} />}
            {isPremium ? 'Current Plan' : 'Subscribe'}
          </button>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['All features included', 'Daily current affairs', 'Study analytics', 'Exam countdown timers', 'Unlimited study logs'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.slate }}>
                <Check size={15} color={C.teal} /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Yearly */}
        <div style={{
          padding: 32, border: `1.5px solid ${billingCycle === 'yearly' ? C.teal : C.border}`,
          borderRadius: 20, background: billingCycle === 'yearly' ? '#f0fdfa' : C.white,
          position: 'relative', transition: 'all 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: -12, right: 20, background: C.teal, color: C.white,
            padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>Most Popular</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 16px' }}>Yearly</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: C.navy }}>&#8377;{(yearlyPrice / 100).toLocaleString()}</span>
            <span style={{ fontSize: 15, color: C.muted, fontWeight: 500 }}>/year</span>
          </div>
          <p style={{ fontSize: 13, color: '#059669', fontWeight: 600, margin: '0 0 24px' }}>
            &#8377;{((yearlyPrice / 100) / 12).toFixed(0)}/month — Save &#8377;{((monthlyPrice * 12 - yearlyPrice) / 100).toLocaleString()}/year
          </p>
          <button
            onClick={() => handlePayment('yearly')}
            disabled={processing || isPremium}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: processing || isPremium ? 'default' : 'pointer',
              background: isPremium ? C.muted : C.teal, color: C.white, border: 'none',
              boxShadow: billingCycle === 'yearly' && !isPremium ? '0 4px 14px rgba(20,184,166,0.25)' : 'none',
              transition: 'all 0.2s', marginBottom: 24, opacity: isPremium ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {processing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={16} />}
            {isPremium ? 'Current Plan' : 'Subscribe'}
          </button>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Everything in Monthly', 'Priority support', 'Save 25% annually', 'Full preparation cycle coverage', '7-day free trial'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.slate }}>
                <Check size={15} color={C.teal} /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 20 }}>
        Payments are securely processed by Razorpay. Cancel anytime.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 600px) {
          .plans-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
