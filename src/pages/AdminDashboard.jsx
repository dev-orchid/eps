import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfiles } from '../hooks/useProfiles'
import { useRoles } from '../hooks/useRoles'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Users, Shield, UserPlus, UserCheck, Clock, AlertTriangle,
  ArrowRight, CalendarDays, TrendingUp, Crown, Search,
  CalendarPlus, ChevronDown, Trash2, Loader2, RefreshCw,
  CheckCircle, XCircle, Bell,
} from 'lucide-react'

const C = {
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
  purple: '#a855f7',
  purpleLight: '#faf5ff',
  blue: '#3b82f6',
  blueLight: '#eff6ff',
}

function getTrialStatus(trialEnd) {
  if (!trialEnd) return { label: null, color: null }
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const [y, m, d] = trialEnd.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff > 0) return { label: `${diff}d left`, color: 'active' }
  return { label: 'Expired', color: 'expired' }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitials(name, email) {
  if (name && name.trim()) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (email || '?')[0].toUpperCase()
}

function ExtendDropdown({ onExtend }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6,
        border: '1px solid ' + C.border, background: C.white, cursor: 'pointer', fontSize: 13, color: C.slate, transition: 'all 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
      >
        <CalendarPlus size={14} color={C.teal} />
        <ChevronDown size={12} color={C.muted} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: C.white,
          border: '1px solid ' + C.border, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 100, overflow: 'hidden', minWidth: 110, animation: 'fadeIn 0.12s ease-out',
        }}>
          {[7, 15].map(days => (
            <button key={days} onClick={() => { onExtend(days); setOpen(false) }} style={{
              display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 500, color: C.navyLight, textAlign: 'left', transition: 'background 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.tealLight}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >+{days} days</button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, bg, borderColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className="admin-stat-card"
      style={{
        background: C.white, border: '1px solid ' + C.border, borderLeft: '3px solid ' + borderColor,
        borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.navy, margin: '6px 0 0' }}>{value}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      {sub && <p style={{ fontSize: 11, color: C.muted, margin: '8px 0 0' }}>{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const { profiles, loading: profilesLoading, updateProfile, deleteProfile, extendTrial, refetch } = useProfiles()
  const { roles, loading: rolesLoading } = useRoles()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [extensionRequests, setExtensionRequests] = useState([])
  const [extensionLoading, setExtensionLoading] = useState(true)

  const fetchExtensionRequests = async () => {
    const { data } = await supabase
      .from('trial_extension_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    setExtensionRequests(data || [])
    setExtensionLoading(false)
  }

  useEffect(() => { fetchExtensionRequests() }, [])

  const handleApproveExtension = async (reqId, userId) => {
    await extendTrial(userId, 7)
    await supabase
      .from('trial_extension_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString(), resolved_by: user.id })
      .eq('id', reqId)
    fetchExtensionRequests()
  }

  const handleDenyExtension = async (reqId) => {
    await supabase
      .from('trial_extension_requests')
      .update({ status: 'denied', resolved_at: new Date().toISOString(), resolved_by: user.id })
      .eq('id', reqId)
    fetchExtensionRequests()
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'
  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const loading = profilesLoading || rolesLoading

  // Stats
  const totalUsers = profiles.length
  const adminCount = profiles.filter(p => p.role === 'Admin').length
  const trialUsers = profiles.filter(p => p.plan === 'Trial').length
  const premiumUsers = profiles.filter(p => p.plan === 'Premium').length
  const expiredTrials = profiles.filter(p => {
    if (p.plan !== 'Trial' || !p.trial_end) return false
    return getTrialStatus(p.trial_end).color === 'expired'
  }).length
  const activeTrials = trialUsers - expiredTrials

  // Recent signups (last 7 days)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const recentSignups = profiles.filter(p => new Date(p.created_at) >= weekAgo).length

  // Filtered users for the table
  const roleNames = roles.length > 0 ? roles.map(r => r.name) : ['User', 'Admin']
  const filtered = profiles.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = async (id, role) => { await updateProfile(id, { role }) }
  const handlePlanChange = async (id, plan) => {
    if (plan === 'Premium') await updateProfile(id, { plan, trial_end: null })
    else {
      const end = new Date(); end.setDate(end.getDate() + 7)
      await updateProfile(id, { plan, trial_end: end.toISOString().slice(0, 10) })
    }
  }
  const handleExtend = async (id, days) => { await extendTrial(id, days) }
  const handleDelete = async (id) => { await deleteProfile(id); setConfirmDelete(null) }
  const handleRefresh = async () => { setRefreshing(true); await refetch(); await fetchExtensionRequests(); setRefreshing(false) }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10 }}>
        <Loader2 size={22} color={C.teal} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 14, color: C.muted }}>Loading dashboard...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div className="admin-dash-root">
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.navy, margin: 0 }}>
          {greeting}, {firstName}!
        </h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 4, fontWeight: 500 }}>
          <CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 4, marginTop: -2 }} />
          {dateStr}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        <StatCard
          icon={Users} label="Total Users" value={totalUsers}
          sub={`+${recentSignups} this week`}
          color={C.teal} bg={C.tealLight} borderColor={C.teal}
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          icon={Crown} label="Premium Users" value={premiumUsers}
          sub={`${totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0}% conversion`}
          color={C.purple} bg={C.purpleLight} borderColor={C.purple}
        />
        <StatCard
          icon={Clock} label="Active Trials" value={activeTrials}
          sub={`${trialUsers} total trial users`}
          color={C.green} bg={C.greenLight} borderColor={C.green}
        />
        <StatCard
          icon={AlertTriangle} label="Expired Trials" value={expiredTrials}
          sub="May need attention"
          color={C.orange} bg={C.orangeLight} borderColor={C.orange}
        />
      </div>

      {/* Pending Trial Extension Requests */}
      {extensionRequests.length > 0 && (
        <div style={{
          background: C.white, border: '1px solid ' + C.border, borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 8, background: C.orangeLight,
          }}>
            <Bell size={16} color={C.orange} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: 0 }}>
              Trial Extension Requests ({extensionRequests.length})
            </h2>
          </div>
          <div>
            {extensionRequests.map((req, i) => {
              const reqUser = profiles.find(p => p.id === req.user_id)
              return (
                <div key={req.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', gap: 12,
                  borderBottom: i < extensionRequests.length - 1 ? '1px solid ' + C.border : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: C.orange, color: C.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{getInitials(reqUser?.full_name, reqUser?.email)}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.navyLight }}>
                        {reqUser?.full_name || reqUser?.email || 'Unknown User'}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
                        {reqUser?.email} &middot; Requested {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleApproveExtension(req.id, req.user_id)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                      border: 'none', background: C.green, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <CheckCircle size={14} /> Approve (+7d)
                    </button>
                    <button onClick={() => handleDenyExtension(req.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                      border: '1px solid ' + C.border, background: C.white, color: C.red, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <XCircle size={14} /> Deny
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Two-column: Recent Activity + Role Overview */}
      <div className="admin-mid-grid">
        {/* Role Distribution */}
        <div style={{
          background: C.white, border: '1px solid ' + C.border, borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color={C.teal} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: 0 }}>Role Distribution</h2>
            </div>
            <button onClick={() => navigate('/admin/roles')} style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
              color: C.teal, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>Manage <ArrowRight size={13} /></button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {roles.map(role => {
              const count = profiles.filter(p => p.role === role.name).length
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
              return (
                <div key={role.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={14} color={role.name === 'Admin' ? C.teal : role.name === 'Moderator' ? C.purple : C.muted} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navyLight }}>{role.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>{count} <span style={{ color: C.muted, fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 3, transition: 'width 0.4s ease',
                      background: role.name === 'Admin' ? C.teal : role.name === 'Moderator' ? C.purple : C.blue,
                    }} />
                  </div>
                </div>
              )
            })}
            {roles.length === 0 && <p style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: 16 }}>No roles configured</p>}
          </div>
        </div>

        {/* Plan Overview */}
        <div style={{
          background: C.white, border: '1px solid ' + C.border, borderRadius: 14,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <TrendingUp size={16} color={C.teal} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.navy, margin: 0 }}>Plan Overview</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {/* Donut-style visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  {totalUsers > 0 && (
                    <circle cx="50" cy="50" r="40" fill="none" stroke={C.teal} strokeWidth="12"
                      strokeDasharray={`${(premiumUsers / totalUsers) * 251.2} 251.2`}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  )}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>{totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0}%</span>
                  <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>PREMIUM</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: C.teal }} />
                  <span style={{ fontSize: 13, color: C.slate }}><strong>{premiumUsers}</strong> Premium</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: C.green }} />
                  <span style={{ fontSize: 13, color: C.slate }}><strong>{activeTrials}</strong> Active Trials</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: C.red }} />
                  <span style={{ fontSize: 13, color: C.slate }}><strong>{expiredTrials}</strong> Expired</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/admin/users')} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 10, border: 'none', background: C.teal, color: C.white,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.tealDark}
                onMouseLeave={e => e.currentTarget.style.background = C.teal}
              >
                <Users size={15} /> Manage Users
              </button>
              <button onClick={() => navigate('/admin/roles')} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 10, border: '1px solid ' + C.border, background: C.white, color: C.slate,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = C.white}
              >
                <Shield size={15} /> Manage Roles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full User Table */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={20} color={C.teal} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navyLight, margin: 0 }}>All Users ({filtered.length})</h2>
            <button onClick={handleRefresh} disabled={refreshing} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
              borderRadius: 7, border: '1px solid ' + C.border, background: C.white, cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = C.white}
            >
              <RefreshCw size={13} color={C.muted} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: C.white,
            border: '1px solid ' + C.border, borderRadius: 10, padding: '7px 14px', minWidth: 200,
          }}>
            <Search size={15} color={C.muted} />
            <input type="text" placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 13, color: C.navyLight, background: 'transparent', width: '100%' }}
            />
          </div>
        </div>

        <div style={{
          background: C.white, borderRadius: 12, border: '1px solid ' + C.border,
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div className="adm-table-header" style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 0.6fr',
            padding: '12px 20px', background: C.bg, borderBottom: '1px solid ' + C.border, gap: 12,
          }}>
            {['USER', 'ROLE', 'PLAN', 'TRIAL STATUS', 'JOINED', 'ACTIONS'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 14 }}>No users found.</div>
          )}

          {filtered.map((u, i) => {
            const trial = getTrialStatus(u.trial_end)
            const displayName = u.full_name || u.email || 'Unknown'
            return (
              <div key={u.id} className="adm-table-row" style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 0.6fr',
                padding: '13px 20px', alignItems: 'center', gap: 12,
                borderBottom: i < filtered.length - 1 ? '1px solid ' + C.border : 'none', transition: 'background 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: C.teal, color: C.white,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{getInitials(u.full_name, u.email)}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.navyLight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                  </div>
                </div>

                {/* Role */}
                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} style={{
                  padding: '5px 8px', borderRadius: 6, border: '1px solid ' + C.border, fontSize: 12, fontWeight: 600,
                  color: u.role === 'Admin' ? C.tealDark : C.slate, background: u.role === 'Admin' ? C.tealLight : C.white,
                  cursor: 'pointer', outline: 'none', minWidth: 75,
                }}>
                  {roleNames.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {/* Plan */}
                <select value={u.plan} onChange={e => handlePlanChange(u.id, e.target.value)} style={{
                  padding: '5px 8px', borderRadius: 6, border: '1px solid ' + C.border, fontSize: 12, fontWeight: 500,
                  color: C.slate, background: C.white, cursor: 'pointer', outline: 'none', minWidth: 85,
                }}>
                  <option value="Trial">Trial</option>
                  <option value="Premium">Premium</option>
                </select>

                {/* Trial Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {u.plan === 'Trial' && trial.label ? (
                    <>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                        color: trial.color === 'active' ? C.green : C.red,
                        background: trial.color === 'active' ? C.greenLight : C.redLight,
                        padding: '2px 8px', borderRadius: 20,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: trial.color === 'active' ? C.green : C.red }} />
                        {trial.label}
                      </span>
                      <ExtendDropdown onExtend={(days) => handleExtend(u.id, days)} />
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: C.muted }}>—</span>
                  )}
                </div>

                {/* Joined */}
                <span style={{ fontSize: 12, color: C.slate, fontWeight: 500 }}>{formatDate(u.created_at)}</span>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {confirmDelete === u.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleDelete(u.id)} style={{
                        padding: '3px 8px', borderRadius: 5, border: 'none', background: C.red, color: C.white, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}>Yes</button>
                      <button onClick={() => setConfirmDelete(null)} style={{
                        padding: '3px 8px', borderRadius: 5, border: '1px solid ' + C.border, background: C.white, color: C.slate, fontSize: 11, cursor: 'pointer',
                      }}>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(u.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
                      borderRadius: 7, border: '1px solid ' + C.border, background: C.white, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.redLight; e.currentTarget.style.borderColor = '#fecaca' }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border }}
                    >
                      <Trash2 size={14} color={C.red} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .admin-stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
        }
        .admin-mid-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media (max-width: 1024px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .admin-mid-grid { grid-template-columns: 1fr; }
          .adm-table-header, .adm-table-row { grid-template-columns: 1.5fr 1fr 1fr 1.3fr 1fr 0.6fr !important; }
        }
        @media (max-width: 767px) {
          .adm-table-header { display: none !important; }
          .adm-table-row { display: flex !important; flex-direction: column !important; gap: 8px !important; padding: 14px 16px !important; }
        }
        @media (max-width: 480px) {
          .admin-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
