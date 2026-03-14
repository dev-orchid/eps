import { useState, useEffect } from 'react'
import { usePaymentSettings } from '../hooks/usePaymentSettings'
import { usePayments } from '../hooks/usePayments'
import { useProfiles } from '../hooks/useProfiles'
import {
  CreditCard, Save, Check, Loader2, Key, IndianRupee, RefreshCw,
  ArrowLeft, Eye, EyeOff, Users, TrendingUp, AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', tealLight: '#e0f7f0',
  navy: '#0f172a', navyLight: '#1e293b', slate: '#334155',
  muted: '#94a3b8', border: '#e2e8f0', bg: '#f8fafc', white: '#ffffff',
  green: '#22c55e', greenLight: '#f0fdf4', red: '#dc2626', redLight: '#fef2f2',
  orange: '#f59e0b', orangeLight: '#fffbeb', purple: '#a855f7',
}

export default function PaymentSettings() {
  const { settings, loading, error, updateMultiple, refetch } = usePaymentSettings()
  const { payments, loading: paymentsLoading } = usePayments()
  const { profiles } = useProfiles()
  const navigate = useNavigate()

  const [keyId, setKeyId] = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [yearlyPrice, setYearlyPrice] = useState('')
  const [monthlyPlanId, setMonthlyPlanId] = useState('')
  const [yearlyPlanId, setYearlyPlanId] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading) {
      setKeyId(settings.razorpay_key_id || '')
      setKeySecret(settings.razorpay_key_secret || '')
      setMonthlyPrice(settings.monthly_price ? String(parseInt(settings.monthly_price) / 100) : '150')
      setYearlyPrice(settings.yearly_price ? String(parseInt(settings.yearly_price) / 100) : '1350')
      setMonthlyPlanId(settings.monthly_plan_id || '')
      setYearlyPlanId(settings.yearly_plan_id || '')
    }
  }, [loading, settings])

  const handleSave = async () => {
    setSaving(true)
    const ok = await updateMultiple({
      razorpay_key_id: keyId,
      razorpay_key_secret: keySecret,
      monthly_price: String(parseInt(monthlyPrice) * 100),
      yearly_price: String(parseInt(yearlyPrice) * 100),
      monthly_plan_id: monthlyPlanId,
      yearly_plan_id: yearlyPlanId,
      monthly_label: `₹${parseInt(monthlyPrice).toLocaleString()}/month`,
      yearly_label: `₹${parseInt(yearlyPrice).toLocaleString()}/year`,
    })
    setSaving(false)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  // Revenue stats
  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalPayments = payments.filter(p => p.status === 'success').length
  const premiumUsers = profiles.filter(p => p.plan === 'Premium').length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10 }}>
        <Loader2 size={22} color={C.teal} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 14, color: C.muted }}>Loading settings...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 10,
          background: C.redLight, border: '1px solid #fecaca', marginBottom: 20,
        }}>
          <AlertCircle size={16} color={C.red} />
          <span style={{ fontSize: 13, fontWeight: 500, color: C.red }}>{error}</span>
        </div>
      )}

      {/* Revenue Stats */}
      <div className="ps-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: C.white, border: '1px solid ' + C.border, borderLeft: '3px solid ' + C.teal,
          borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Total Revenue</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: '6px 0 0' }}>
            &#8377;{(totalRevenue / 100).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: C.muted, margin: '6px 0 0' }}>{totalPayments} successful payments</p>
        </div>
        <div style={{
          background: C.white, border: '1px solid ' + C.border, borderLeft: '3px solid ' + C.purple,
          borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Premium Users</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: '6px 0 0' }}>{premiumUsers}</p>
          <p style={{ fontSize: 11, color: C.muted, margin: '6px 0 0' }}>Active subscriptions</p>
        </div>
        <div style={{
          background: C.white, border: '1px solid ' + C.border, borderLeft: '3px solid ' + C.green,
          borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>Avg. Revenue/User</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: '6px 0 0' }}>
            &#8377;{premiumUsers > 0 ? ((totalRevenue / 100) / premiumUsers).toFixed(0) : '0'}
          </p>
          <p style={{ fontSize: 11, color: C.muted, margin: '6px 0 0' }}>Per premium user</p>
        </div>
      </div>

      <div className="ps-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Razorpay Settings Card */}
        <div style={{
          background: C.white, borderRadius: 12, border: '1px solid ' + C.border,
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px',
            borderBottom: '1px solid ' + C.border, background: C.bg,
          }}>
            <Key size={16} color={C.teal} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.navyLight }}>Razorpay API Keys</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, display: 'block', marginBottom: 6 }}>
                Key ID <span style={{ color: C.red }}>*</span>
              </label>
              <input
                type="text"
                value={keyId}
                onChange={e => setKeyId(e.target.value)}
                placeholder="rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.border,
                  fontSize: 14, color: C.navyLight, background: C.white, outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
              <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>Public key shown to users during checkout</p>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, display: 'block', marginBottom: 6 }}>
                Key Secret <span style={{ color: C.red }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={keySecret}
                  onChange={e => setKeySecret(e.target.value)}
                  placeholder="Enter Razorpay key secret"
                  style={{
                    width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: '1px solid ' + C.border,
                    fontSize: 14, color: C.navyLight, background: C.white, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
                <button onClick={() => setShowSecret(p => !p)} style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}>
                  {showSecret ? <EyeOff size={16} color={C.muted} /> : <Eye size={16} color={C.muted} />}
                </button>
              </div>
              <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>Secret key for server-side verification</p>
            </div>

            <div style={{
              background: C.orangeLight, border: '1px solid #fde68a', borderRadius: 8, padding: 12,
            }}>
              <p style={{ fontSize: 12, color: C.slate, margin: 0, lineHeight: 1.5 }}>
                <strong>Tip:</strong> Use <code style={{ background: '#fff', padding: '1px 4px', borderRadius: 3 }}>rzp_test_</code> keys for testing.
                Switch to <code style={{ background: '#fff', padding: '1px 4px', borderRadius: 3 }}>rzp_live_</code> keys for production.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Settings Card */}
        <div style={{
          background: C.white, borderRadius: 12, border: '1px solid ' + C.border,
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px',
            borderBottom: '1px solid ' + C.border, background: C.bg,
          }}>
            <IndianRupee size={16} color={C.teal} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.navyLight }}>Plan Pricing</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, display: 'block', marginBottom: 6 }}>
                Monthly Price (&#8377;)
              </label>
              <input
                type="number"
                value={monthlyPrice}
                onChange={e => setMonthlyPrice(e.target.value)}
                placeholder="150"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.border,
                  fontSize: 14, color: C.navyLight, background: C.white, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, display: 'block', marginBottom: 6 }}>
                Yearly Price (&#8377;)
              </label>
              <input
                type="number"
                value={yearlyPrice}
                onChange={e => setYearlyPrice(e.target.value)}
                placeholder="1350"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.border,
                  fontSize: 14, color: C.navyLight, background: C.white, outline: 'none', boxSizing: 'border-box',
                }}
              />
              {monthlyPrice && yearlyPrice && (
                <p style={{ fontSize: 12, color: C.green, fontWeight: 500, margin: '6px 0 0' }}>
                  Users save &#8377;{(parseInt(monthlyPrice) * 12 - parseInt(yearlyPrice)).toLocaleString()}/year ({Math.round((1 - parseInt(yearlyPrice) / (parseInt(monthlyPrice) * 12)) * 100)}% off)
                </p>
              )}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 10, border: 'none',
                background: saved ? C.green : C.teal, color: C.white, fontSize: 14, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer', transition: 'background 0.15s', width: '100%',
                marginTop: 8,
              }}
              onMouseEnter={e => { if (!saved && !saving) e.currentTarget.style.background = C.tealDark }}
              onMouseLeave={e => { if (!saved && !saving) e.currentTarget.style.background = saved ? C.green : C.teal }}
            >
              {saving ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              ) : saved ? (
                <><Check size={16} /> Saved!</>
              ) : (
                <><Save size={16} /> Save Settings</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Plan IDs */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          background: C.white, borderRadius: 12, border: '1px solid ' + C.border,
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px',
            borderBottom: '1px solid ' + C.border, background: C.bg,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} color={C.teal} />
              <span style={{ fontSize: 15, fontWeight: 700, color: C.navyLight }}>Subscription Plan IDs</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, color: C.teal, background: C.tealLight,
              padding: '3px 10px', borderRadius: 20,
            }}>Razorpay Subscriptions</span>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px', lineHeight: 1.6 }}>
              Create subscription plans in your <strong>Razorpay Dashboard</strong> &rarr; Subscriptions &rarr; Plans, then paste the Plan IDs below.
              This enables auto-recurring billing for users.
            </p>
            <div className="ps-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, display: 'block', marginBottom: 6 }}>
                  Monthly Plan ID
                </label>
                <input
                  type="text"
                  value={monthlyPlanId}
                  onChange={e => setMonthlyPlanId(e.target.value)}
                  placeholder="plan_xxxxxxxxxxxxxxx"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.border,
                    fontSize: 14, color: C.navyLight, background: C.white, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
                <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>
                  Razorpay plan for &#8377;{monthlyPrice || '150'}/month recurring
                </p>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.navyLight, display: 'block', marginBottom: 6 }}>
                  Yearly Plan ID
                </label>
                <input
                  type="text"
                  value={yearlyPlanId}
                  onChange={e => setYearlyPlanId(e.target.value)}
                  placeholder="plan_xxxxxxxxxxxxxxx"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + C.border,
                    fontSize: 14, color: C.navyLight, background: C.white, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
                <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>
                  Razorpay plan for &#8377;{yearlyPrice || '1350'}/year recurring
                </p>
              </div>
            </div>
            {(!monthlyPlanId && !yearlyPlanId) && (
              <div style={{
                background: C.orangeLight, border: '1px solid #fde68a', borderRadius: 8, padding: 12, marginTop: 16,
              }}>
                <p style={{ fontSize: 12, color: C.slate, margin: 0, lineHeight: 1.5 }}>
                  <strong>Note:</strong> If no plan IDs are configured, checkout will use one-time payments instead of subscriptions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          background: C.white, borderRadius: 12, border: '1px solid ' + C.border,
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px',
            borderBottom: '1px solid ' + C.border, background: C.bg,
          }}>
            <CreditCard size={16} color={C.teal} />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.navyLight }}>Recent Payments</span>
          </div>

          {payments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 14 }}>
              No payments yet.
            </div>
          ) : (
            <div>
              <div className="ps-pay-header" style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                padding: '10px 20px', borderBottom: '1px solid ' + C.border, gap: 12,
              }}>
                {['USER', 'PLAN', 'AMOUNT', 'TYPE', 'STATUS', 'DATE'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                ))}
              </div>
              {payments.slice(0, 20).map((pay, i) => {
                const pUser = profiles.find(p => p.id === pay.user_id)
                const isSub = !!pay.razorpay_subscription_id
                return (
                  <div key={pay.id} className="ps-pay-row" style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.2fr',
                    padding: '12px 20px', alignItems: 'center', gap: 12,
                    borderBottom: i < Math.min(payments.length, 20) - 1 ? '1px solid ' + C.border : 'none',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.navyLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pUser?.email || pay.user_id.slice(0, 8)}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.slate, textTransform: 'capitalize' }}>{pay.plan}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>&#8377;{(pay.amount / 100).toLocaleString()}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, width: 'fit-content',
                      color: isSub ? '#7c3aed' : C.slate,
                      background: isSub ? '#f5f3ff' : C.bg,
                    }}>
                      {isSub ? 'Subscription' : 'One-time'}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                      color: pay.status === 'success' ? C.green : pay.status === 'failed' ? C.red : C.orange,
                      background: pay.status === 'success' ? C.greenLight : pay.status === 'failed' ? C.redLight : C.orangeLight,
                      padding: '2px 8px', borderRadius: 20, width: 'fit-content',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: pay.status === 'success' ? C.green : pay.status === 'failed' ? C.red : C.orange }} />
                      {pay.status}
                    </span>
                    <span style={{ fontSize: 12, color: C.muted }}>
                      {new Date(pay.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .ps-stats-grid { grid-template-columns: 1fr !important; }
          .ps-main-grid { grid-template-columns: 1fr !important; }
          .ps-sub-grid { grid-template-columns: 1fr !important; }
          .ps-pay-header, .ps-pay-row { grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1.2fr !important; }
        }
      `}</style>
    </div>
  )
}
