import { useState, useRef, useEffect } from 'react'
import { Users, Search, Trash2, CalendarPlus, ChevronDown, RefreshCw, Loader2 } from 'lucide-react'
import { useProfiles } from '../hooks/useProfiles'
import { useRoles } from '../hooks/useRoles'

const COLORS = {
  teal: '#14b8a6',
  tealDark: '#0d9488',
  tealLight: '#e0f7f0',
  navy: '#0f172a',
  navyLight: '#1e293b',
  slate: '#334155',
  muted: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  white: '#ffffff',
  red: '#dc2626',
  redLight: '#fef2f2',
  orange: '#f59e0b',
  orangeLight: '#fffbeb',
  green: '#22c55e',
  greenLight: '#f0fdf4',
}

function getTrialStatus(trialEnd) {
  if (!trialEnd) return { label: null, color: null }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  // Parse as local date to avoid UTC timezone offset
  const [y, m, d] = trialEnd.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff > 0) return { label: `${diff}d left`, color: 'active' }
  return { label: 'Expired', color: 'expired' }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitials(name, email) {
  if (name && name.trim()) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return (email || '?')[0].toUpperCase()
}

function RoleDropdown({ value, onChange, roleNames }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '5px 8px',
        borderRadius: 6,
        border: '1px solid ' + COLORS.border,
        fontSize: 13,
        fontWeight: 600,
        color: value === 'Admin' ? COLORS.tealDark : COLORS.slate,
        background: value === 'Admin' ? COLORS.tealLight : COLORS.white,
        cursor: 'pointer',
        outline: 'none',
        minWidth: 80,
      }}
    >
      {roleNames.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}

function PlanDropdown({ value, onChange }) {
  const plans = ['Trial', 'Premium']
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '5px 8px',
        borderRadius: 6,
        border: '1px solid ' + COLORS.border,
        fontSize: 13,
        fontWeight: 500,
        color: COLORS.slate,
        background: COLORS.white,
        cursor: 'pointer',
        outline: 'none',
        minWidth: 90,
      }}
    >
      {plans.map(p => <option key={p} value={p}>{p}</option>)}
    </select>
  )
}

function ExtendDropdown({ onExtend }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          borderRadius: 6,
          border: '1px solid ' + COLORS.border,
          background: COLORS.white,
          cursor: 'pointer',
          fontSize: 13,
          color: COLORS.slate,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.teal }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border }}
      >
        <CalendarPlus size={14} color={COLORS.teal} />
        <ChevronDown size={12} color={COLORS.muted} />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          background: COLORS.white,
          border: '1px solid ' + COLORS.border,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 100,
          overflow: 'hidden',
          minWidth: 110,
          animation: 'fadeIn 0.12s ease-out',
        }}>
          {[7, 15].map(days => (
            <button
              key={days}
              onClick={() => { onExtend(days); setOpen(false) }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: COLORS.navyLight,
                textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.tealLight}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              +{days} days
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UserManagement() {
  const { profiles, loading, error, updateProfile, deleteProfile, extendTrial, refetch } = useProfiles()
  const { roles } = useRoles()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const roleNames = roles.length > 0 ? roles.map(r => r.name) : ['User', 'Admin']

  const filtered = profiles.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = async (id, role) => {
    await updateProfile(id, { role })
  }

  const handlePlanChange = async (id, plan) => {
    if (plan === 'Premium') {
      await updateProfile(id, { plan, trial_end: null })
    } else {
      const end = new Date()
      end.setDate(end.getDate() + 7)
      await updateProfile(id, { plan, trial_end: end.toISOString().slice(0, 10) })
    }
  }

  const handleExtend = async (id, days) => {
    await extendTrial(id, days)
  }

  const handleDelete = async (id) => {
    await deleteProfile(id)
    setConfirmDelete(null)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10 }}>
        <Loader2 size={22} color={COLORS.teal} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 14, color: COLORS.muted }}>Loading users...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Error banner */}
      {error && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: COLORS.redLight,
          border: '1px solid #fecaca',
          color: COLORS.red,
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={22} color={COLORS.teal} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navyLight, margin: 0 }}>
            All Users ({filtered.length})
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 8,
              border: '1px solid ' + COLORS.border,
              background: COLORS.white,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
          >
            <RefreshCw size={14} color={COLORS.muted} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: COLORS.white,
          border: '1px solid ' + COLORS.border,
          borderRadius: 10,
          padding: '8px 14px',
          minWidth: 220,
        }}>
          <Search size={16} color={COLORS.muted} />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: COLORS.navyLight,
              background: 'transparent',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: COLORS.white,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* Table header */}
        <div className="um-table-header" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 0.6fr',
          padding: '12px 20px',
          background: COLORS.bg,
          borderBottom: '1px solid ' + COLORS.border,
          gap: 12,
        }}>
          {['USER', 'ROLE', 'PLAN', 'TRIAL STATUS', 'JOINED', 'ACTIONS'].map(h => (
            <span key={h} style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
            No users found.
          </div>
        )}
        {filtered.map((user, i) => {
          const trial = getTrialStatus(user.trial_end)
          const displayName = user.full_name || user.email || 'Unknown'
          return (
            <div
              key={user.id}
              className="um-table-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 0.6fr',
                padding: '14px 20px',
                alignItems: 'center',
                gap: 12,
                borderBottom: i < filtered.length - 1 ? '1px solid ' + COLORS.border : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* User */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: COLORS.teal,
                    color: COLORS.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {getInitials(user.full_name, user.email)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.navyLight,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{displayName}</p>
                    <p style={{
                      margin: 0,
                      fontSize: 12,
                      color: COLORS.muted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <RoleDropdown value={user.role} onChange={v => handleRoleChange(user.id, v)} roleNames={roleNames} />
              </div>

              {/* Plan */}
              <div>
                <PlanDropdown value={user.plan} onChange={v => handlePlanChange(user.id, v)} />
              </div>

              {/* Trial Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user.plan === 'Trial' && trial.label ? (
                  <>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: trial.color === 'active' ? COLORS.green : COLORS.red,
                      background: trial.color === 'active' ? COLORS.greenLight : COLORS.redLight,
                      padding: '3px 10px',
                      borderRadius: 20,
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: trial.color === 'active' ? COLORS.green : COLORS.red,
                      }} />
                      {trial.label}
                    </span>
                    <ExtendDropdown onExtend={(days) => handleExtend(user.id, days)} />
                  </>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}>—</span>
                )}
              </div>

              {/* Joined */}
              <span style={{ fontSize: 13, color: COLORS.slate, fontWeight: 500 }}>
                {formatDate(user.created_at)}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {confirmDelete === user.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: 'none',
                        background: COLORS.red,
                        color: COLORS.white,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >Yes</button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid ' + COLORS.border,
                        background: COLORS.white,
                        color: COLORS.slate,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid ' + COLORS.border,
                      background: COLORS.white,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = COLORS.redLight
                      e.currentTarget.style.borderColor = '#fecaca'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = COLORS.white
                      e.currentTarget.style.borderColor = COLORS.border
                    }}
                  >
                    <Trash2 size={15} color={COLORS.red} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 900px) {
          .um-table-header, .um-table-row {
            grid-template-columns: 1.5fr 1fr 1fr 1.3fr 1fr 0.6fr !important;
          }
        }
        @media (max-width: 767px) {
          .um-table-header {
            display: none !important;
          }
          .um-table-row {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            padding: 16px 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
