import { useState, useEffect } from 'react'
import { Shield, Search, Plus, Pencil, ArrowLeft, Check, Users, Save, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useRoles } from '../hooks/useRoles'
import { useProfiles } from '../hooks/useProfiles'

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
  purple: '#a855f7',
  purpleLight: '#faf5ff',
}

const ALL_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'exams', label: 'Exams' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'study', label: 'Study Log' },
  { key: 'progress', label: 'Progress' },
  { key: 'alarms', label: 'Alarms' },
  { key: 'current_affairs', label: 'Current Affairs' },
  { key: 'profile', label: 'Profile' },
  { key: 'user_management', label: 'User Management' },
  { key: 'role_management', label: 'Role Management' },
]

function RoleList({ roles, profiles, search, setSearch, onEdit, onCreate, onRefresh, refreshing }) {
  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const getUserCount = (roleName) => {
    return profiles.filter(p => p.role === roleName).length
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
          <Shield size={22} color={COLORS.teal} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navyLight, margin: 0 }}>
            All Roles ({filtered.length})
          </h2>
          <button
            onClick={onRefresh}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: COLORS.white,
            border: '1px solid ' + COLORS.border,
            borderRadius: 10,
            padding: '8px 14px',
            minWidth: 200,
          }}>
            <Search size={16} color={COLORS.muted} />
            <input
              type="text"
              placeholder="Search roles..."
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
          <button
            onClick={onCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: COLORS.teal,
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.tealDark}
            onMouseLeave={e => e.currentTarget.style.background = COLORS.teal}
          >
            <Plus size={16} />
            Create Role
          </button>
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
        <div className="rm-table-header" style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 140px 120px 80px',
          padding: '12px 20px',
          background: COLORS.bg,
          borderBottom: '1px solid ' + COLORS.border,
          gap: 16,
        }}>
          {['ROLE', 'DESCRIPTION', 'USERS', 'TYPE', 'ACTIONS'].map(h => (
            <span key={h} style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: COLORS.muted, fontSize: 14 }}>
            No roles found.
          </div>
        )}

        {filtered.map((role, i) => (
          <div
            key={role.id}
            className="rm-table-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 140px 120px 80px',
              padding: '16px 20px',
              alignItems: 'center',
              gap: 16,
              borderBottom: i < filtered.length - 1 ? '1px solid ' + COLORS.border : 'none',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: role.name === 'Admin' ? COLORS.tealLight : role.name === 'Moderator' ? COLORS.purpleLight : COLORS.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={16} color={role.name === 'Admin' ? COLORS.teal : role.name === 'Moderator' ? COLORS.purple : COLORS.muted} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.navyLight }}>{role.name}</span>
            </div>

            <span style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.4 }}>{role.description}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color={COLORS.muted} />
              <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.slate }}>
                {getUserCount(role.name)} users
              </span>
            </div>

            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: role.type === 'System' ? COLORS.teal : COLORS.orange,
            }}>
              {role.type}
            </span>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => onEdit(role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid ' + COLORS.border,
                  background: COLORS.white,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.tealLight
                  e.currentTarget.style.borderColor = COLORS.teal
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.white
                  e.currentTarget.style.borderColor = COLORS.border
                }}
              >
                <Pencil size={15} color={COLORS.teal} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 767px) {
          .rm-table-header { display: none !important; }
          .rm-table-row {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}

function RoleEditor({ role, isNew, onSave, onDelete, onBack }) {
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [permissions, setPermissions] = useState(
    role?.permissions || ['dashboard', 'exams', 'tasks', 'study', 'progress', 'alarms', 'current_affairs', 'profile']
  )
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const isSystem = role?.type === 'System'

  const togglePermission = (key) => {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    )
  }

  const selectAll = () => setPermissions(ALL_PERMISSIONS.map(p => p.key))
  const deselectAll = () => setPermissions([])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      id: role?.id,
      name: isSystem ? role.name : name,
      description,
      permissions,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid ' + COLORS.border,
          background: COLORS.white,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: COLORS.slate,
          marginBottom: 20,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
        onMouseLeave={e => e.currentTarget.style.background = COLORS.white}
      >
        <ArrowLeft size={15} />
        Back to Roles
      </button>

      <div className="rm-editor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Role Details */}
          <div style={{
            background: COLORS.white,
            borderRadius: 12,
            border: '1px solid ' + COLORS.border,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 20px',
              borderBottom: '1px solid ' + COLORS.border,
              background: COLORS.bg,
            }}>
              <Shield size={16} color={COLORS.teal} />
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navyLight }}>Role Details</span>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navyLight, display: 'block', marginBottom: 6 }}>
                  Role Name <span style={{ color: COLORS.red }}>*</span>
                </label>
                <input
                  type="text"
                  value={isSystem ? role.name : name}
                  onChange={e => !isSystem && setName(e.target.value)}
                  disabled={isSystem}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid ' + COLORS.border,
                    fontSize: 14,
                    color: COLORS.navyLight,
                    background: isSystem ? COLORS.bg : COLORS.white,
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: isSystem ? 'not-allowed' : 'text',
                  }}
                  placeholder="Enter role name"
                />
                {isSystem && (
                  <p style={{ fontSize: 12, color: COLORS.teal, margin: '6px 0 0', fontWeight: 500 }}>
                    System role names cannot be changed
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navyLight, display: 'block', marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid ' + COLORS.border,
                    fontSize: 14,
                    color: COLORS.navyLight,
                    background: COLORS.white,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  placeholder="Describe what this role can do..."
                />
              </div>
            </div>
          </div>

          {/* Menu Permissions */}
          <div style={{
            background: COLORS.white,
            borderRadius: 12,
            border: '1px solid ' + COLORS.border,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid ' + COLORS.border,
              background: COLORS.bg,
              flexWrap: 'wrap',
              gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} color={COLORS.teal} />
                <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navyLight }}>Menu Permissions</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={selectAll}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid ' + COLORS.teal,
                    background: COLORS.white,
                    color: COLORS.teal,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLORS.tealLight }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLORS.white }}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid ' + COLORS.border,
                    background: COLORS.white,
                    color: COLORS.slate,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLORS.bg }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLORS.white }}
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 16px', lineHeight: 1.5 }}>
                Select which menu items this role can access. Users with this role will only see the selected items in their sidebar.
              </p>
              <div className="rm-perm-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
              }}>
                {ALL_PERMISSIONS.map(perm => {
                  const active = permissions.includes(perm.key)
                  return (
                    <button
                      key={perm.key}
                      onClick={() => togglePermission(perm.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid ' + (active ? COLORS.teal : COLORS.border),
                        background: active ? COLORS.tealLight : COLORS.white,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        if (!active) e.currentTarget.style.borderColor = COLORS.teal
                      }}
                      onMouseLeave={e => {
                        if (!active) e.currentTarget.style.borderColor = COLORS.border
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        border: active ? 'none' : '2px solid ' + COLORS.border,
                        background: active ? COLORS.teal : COLORS.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}>
                        {active && <Check size={13} color={COLORS.white} strokeWidth={3} />}
                      </div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        color: active ? COLORS.tealDark : COLORS.slate,
                      }}>
                        {perm.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Summary */}
        <div style={{
          background: COLORS.white,
          borderRadius: 12,
          border: '1px solid ' + COLORS.border,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 24,
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid ' + COLORS.border,
            background: COLORS.bg,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.navyLight }}>Summary</span>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>
                Selected Permissions
              </p>
              <p style={{ fontSize: 24, fontWeight: 700, color: COLORS.navyLight, margin: 0 }}>
                {permissions.length} / {ALL_PERMISSIONS.length}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>
                Role Type
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.teal, margin: 0 }}>
                {isSystem ? 'System Role' : 'Custom Role'}
              </p>
            </div>

            {isSystem && (
              <div style={{
                background: COLORS.orangeLight,
                border: '1px solid #fde68a',
                borderRadius: 8,
                padding: 14,
              }}>
                <p style={{ fontSize: 13, color: COLORS.slate, margin: 0, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: COLORS.navyLight }}>Note: </span>
                  System roles cannot be deleted. You can only modify their permissions.
                </p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || (!isNew && !isSystem && !name.trim())}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: saved ? COLORS.green : COLORS.teal,
                color: COLORS.white,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                transition: 'background 0.15s',
                width: '100%',
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!saved && !saving) e.currentTarget.style.background = COLORS.tealDark }}
              onMouseLeave={e => { if (!saved && !saving) e.currentTarget.style.background = COLORS.teal }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>

            {!isSystem && !isNew && (
              <>
                {confirmDel ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => onDelete(role.id)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: 'none',
                        background: COLORS.red,
                        color: COLORS.white,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >Confirm Delete</button>
                    <button
                      onClick={() => setConfirmDel(false)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: '1px solid ' + COLORS.border,
                        background: COLORS.white,
                        color: COLORS.slate,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDel(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      borderRadius: 10,
                      border: '1px solid #fecaca',
                      background: COLORS.redLight,
                      color: COLORS.red,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                    onMouseLeave={e => { e.currentTarget.style.background = COLORS.redLight }}
                  >
                    <Trash2 size={14} />
                    Delete Role
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 900px) {
          .rm-editor-grid {
            grid-template-columns: 1fr !important;
          }
          .rm-perm-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 500px) {
          .rm-perm-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function RoleManagement() {
  const { roles, loading, error, addRole, updateRole, deleteRole, refetch } = useRoles()
  const { profiles } = useProfiles()
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list')
  const [editingRole, setEditingRole] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleEdit = (role) => {
    setEditingRole(role)
    setView('edit')
  }

  const handleCreate = () => {
    setEditingRole(null)
    setView('create')
  }

  const handleSave = async ({ id, name, description, permissions }) => {
    if (view === 'create') {
      const newRole = await addRole(name, description, permissions)
      if (newRole) {
        setEditingRole(newRole)
        setView('edit')
      }
    } else {
      await updateRole(id, { description, permissions })
    }
  }

  const handleDelete = async (id) => {
    await deleteRole(id)
    setView('list')
    setEditingRole(null)
  }

  const handleBack = () => {
    setView('list')
    setEditingRole(null)
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
        <span style={{ fontSize: 14, color: COLORS.muted }}>Loading roles...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <>
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
            maxWidth: 1200,
            margin: '0 auto 16px',
          }}>
            {error}
          </div>
        )}
        <RoleList
          roles={roles}
          profiles={profiles}
          search={search}
          setSearch={setSearch}
          onEdit={handleEdit}
          onCreate={handleCreate}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </>
    )
  }

  return (
    <RoleEditor
      role={editingRole}
      isNew={view === 'create'}
      onSave={handleSave}
      onDelete={handleDelete}
      onBack={handleBack}
    />
  )
}
