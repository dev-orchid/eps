import { useState, useMemo, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useStudySessions } from '../hooks/useStudySessions'
import { useTasks } from '../hooks/useTasks'
import { useExams } from '../hooks/useExams'
import { supabase } from '../lib/supabase'
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Flame, Trophy, Clock, Target, Award, Camera, Image } from 'lucide-react'

const DEFAULT_BANNER = 'gradient1'

const BANNER_PRESETS = [
  { id: 'gradient1', style: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #14b8a6 100%)' },
  { id: 'gradient2', style: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 50%, #ec4899 100%)' },
  { id: 'gradient3', style: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)' },
  { id: 'gradient4', style: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #818cf8 100%)' },
  { id: 'gradient5', style: 'linear-gradient(135deg, #431407 0%, #ea580c 50%, #fbbf24 100%)' },
  { id: 'gradient6', style: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #38bdf8 100%)' },
]


export default function Profile() {
  const { user } = useAuth()
  const { sessions } = useStudySessions()
  const { tasks } = useTasks()
  const { exams } = useExams()

  const email = user?.email || ''
  const meta = user?.user_metadata || {}

  const [firstName, setFirstName] = useState(meta.full_name?.split(' ')[0] || '')
  const [lastName, setLastName] = useState(meta.full_name?.split(' ').slice(1).join(' ') || '')
  const [bio, setBio] = useState(meta.bio || '')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)

  // Banner state — store preset ID in user_metadata, default to gradient1
  // Ensure we always have a valid banner ID even if metadata has stale values
  const savedBannerId = meta.banner_id
  const validBannerId = BANNER_PRESETS.some(p => p.id === savedBannerId) ? savedBannerId : DEFAULT_BANNER
  const [bannerId, setBannerId] = useState(validBannerId)
  const [bannerImageUrl, setBannerImageUrl] = useState(null)
  const [showBannerPicker, setShowBannerPicker] = useState(false)
  const bannerFileRef = useRef(null)

  // Load custom banner image from localStorage on mount
  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(`banner_img_${user.id}`)
    if (stored && meta.banner_type === 'image') {
      setBannerImageUrl(stored)
    }
  }, [user, meta.banner_type])

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0]
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = useMemo(() => {
    const totalMinutes = (sessions || []).reduce((s, x) => s + (x.duration_minutes || 0), 0)
    const totalHours = Math.round(totalMinutes / 60)
    const completedTasks = (tasks || []).filter(t => t.completed).length
    const totalTasks = (tasks || []).length

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionDates = new Set((sessions || []).map(s => s.date))
    let streak = 0
    const d = new Date(today)
    while (true) {
      const ds = d.toISOString().split('T')[0]
      if (sessionDates.has(ds)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    let level = 'Beginner'
    if (totalHours >= 500) level = 'Master'
    else if (totalHours >= 200) level = 'Expert'
    else if (totalHours >= 100) level = 'Advanced'
    else if (totalHours >= 30) level = 'Intermediate'

    return { totalHours, completedTasks, totalTasks, streak, level }
  }, [sessions, tasks])

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    // Compress image to a reasonable size using canvas
    const img = new window.Image()
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      // Banner is wide and short — resize to max 1200px wide
      const maxW = 1200
      const scale = Math.min(1, maxW / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      // Store in localStorage (per user)
      try {
        localStorage.setItem(`banner_img_${user.id}`, dataUrl)
      } catch {
        console.error('Image too large for localStorage')
        return
      }
      setBannerImageUrl(dataUrl)
      setBannerId(null)
      setShowBannerPicker(false)
      // Mark in user metadata that banner type is image
      await supabase.auth.updateUser({
        data: { banner_type: 'image', banner_id: null }
      })
    }
    img.src = URL.createObjectURL(file)
  }

  const handleBannerPreset = async (presetId) => {
    setBannerId(presetId)
    setBannerImageUrl(null)
    setShowBannerPicker(false)
    // Remove stored image
    if (user) localStorage.removeItem(`banner_img_${user.id}`)
    await supabase.auth.updateUser({
      data: {
        banner_type: 'gradient',
        banner_id: presetId,
        banner_updated: null,
        banner_image: null,
        banner_gradient: null,
      }
    })
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setProfileMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: [firstName, lastName].filter(Boolean).join(' '),
        bio: bio,
      }
    })
    if (error) {
      setProfileMsg({ type: 'error', text: error.message })
    } else {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
    }
    setSaving(false)
    setTimeout(() => setProfileMsg(null), 3000)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwMsg({ type: 'error', text: error.message })
    } else {
      setPwMsg({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPwSaving(false)
    setTimeout(() => setPwMsg(null), 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 6,
    display: 'block',
  }

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  }

  const cardHeaderStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }

  const isImageBanner = !!(meta.banner_type === 'image' && bannerImageUrl)
  const activeBannerId = bannerId || DEFAULT_BANNER
  const activePreset = BANNER_PRESETS.find(p => p.id === activeBannerId) || BANNER_PRESETS[0]

  return (
    <div className="profile-page">
      {/* Banner — full width, separate from avatar */}
      <div style={{
        height: 160,
        borderRadius: 16,
        backgroundColor: '#0f172a',
        backgroundImage: isImageBanner ? `url(${bannerImageUrl})` : activePreset.style,
        backgroundSize: isImageBanner ? 'cover' : undefined,
        backgroundPosition: isImageBanner ? 'center' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements (only on gradients) */}
        {!isImageBanner && (
          <>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -80, right: -40 }} />
            <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -50, left: '25%' }} />
            <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: 30, left: '55%' }} />
          </>
        )}

        {/* Change Banner button */}
        <button
          onClick={() => setShowBannerPicker(prev => !prev)}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
        >
          <Image size={14} />
          Change Banner
        </button>

        {/* Banner picker dropdown */}
        {showBannerPicker && (
          <div style={{
            position: 'absolute',
            bottom: 48,
            right: 12,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 14,
            zIndex: 10,
            width: 240,
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Choose a gradient</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleBannerPreset(preset.id)}
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 8,
                    background: preset.style,
                    border: activeBannerId === preset.id && !isImageBanner ? '2px solid #14b8a6' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
              <input
                ref={bannerFileRef}
                type="file"
                accept="image/*"
                onChange={handleBannerImageUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => bannerFileRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '8px 10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
              >
                <Camera size={13} />
                Upload custom image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar + User Info row — below the banner, not overlapping */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        padding: '0 8px',
        marginTop: -40,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
              border: '4px solid #ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              {initials}
            </div>
            {/* Camera badge on avatar */}
            <div style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Camera size={12} color="#64748b" />
            </div>
          </div>

          {/* Name + email — positioned below avatar bottom */}
          <div style={{ paddingBottom: 0, marginTop: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{fullName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                <Mail size={13} color="#94a3b8" /> {email}
              </span>
              <span style={{
                padding: '2px 10px',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 999,
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #d1fae5',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats — aligned right */}
        <div className="profile-quick-stats" style={{ display: 'flex', gap: 28, marginTop: 52 }}>
          {[
            { label: 'Level', value: stats.level },
            { label: 'Study Hours', value: stats.totalHours },
            { label: 'Day Streak', value: stats.streak },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              textAlign: 'center',
              minWidth: 60,
              paddingLeft: i > 0 ? 28 : 0,
              borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="profile-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal Information */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={17} color="#14b8a6" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Personal Information</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Update your name and bio</p>
              </div>
            </div>
            <form onSubmit={handleProfileSave} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.08)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.08)' }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{
                  ...inputStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  cursor: 'not-allowed',
                }}>
                  <Mail size={14} color="#94a3b8" />
                  {email}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Bio <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {profileMsg && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: profileMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: profileMsg.type === 'success' ? '#16a34a' : '#dc2626',
                  border: `1px solid ${profileMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  {profileMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {profileMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  backgroundColor: '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Password */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={17} color="#a855f7" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Password</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Change your password</p>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#a855f7'; e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#a855f7'; e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {pwMsg && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: pwMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: pwMsg.type === 'success' ? '#16a34a' : '#dc2626',
                  border: `1px solid ${pwMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  {pwMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {pwMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  backgroundColor: '#a855f7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: pwSaving ? 'not-allowed' : 'pointer',
                  opacity: pwSaving ? 0.7 : 1,
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s',
                }}
              >
                <Lock size={15} />
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Study Stats */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={17} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Study Stats</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Your preparation overview</p>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Total Hours', value: stats.totalHours, icon: Clock, color: '#14b8a6', bg: '#f0fdfa' },
                  { label: 'Day Streak', value: stats.streak, icon: Flame, color: '#f59e0b', bg: '#fffbeb' },
                  { label: 'Tasks Done', value: `${stats.completedTasks}/${stats.totalTasks}`, icon: Target, color: '#22c55e', bg: '#f0fdf4' },
                  { label: 'Total Exams', value: (exams || []).length, icon: Award, color: '#a855f7', bg: '#faf5ff' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid #f1f5f9',
                    background: '#fafbfc',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} color={color} />
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', paddingLeft: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          padding-bottom: 40px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .profile-quick-stats {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
