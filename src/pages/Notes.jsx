import { useState, useMemo, useRef, useEffect } from 'react'
import { useNotes } from '../hooks/useNotes'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  Plus, Search, Pin, PinOff, Trash2, Edit3, Save, X, ChevronDown,
  FileText, BookOpen, Tag, Clock, Filter, StickyNote, ArrowLeft,
} from 'lucide-react'

const SUBJECTS = [
  { id: 'polity', label: 'Polity & Governance', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'economy', label: 'Economy', color: '#22c55e', bg: '#f0fdf4' },
  { id: 'history', label: 'History', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'geography', label: 'Geography', color: '#14b8a6', bg: '#f0fdfa' },
  { id: 'science', label: 'Science & Tech', color: '#a855f7', bg: '#faf5ff' },
  { id: 'environment', label: 'Environment', color: '#10b981', bg: '#ecfdf5' },
  { id: 'ir', label: 'International Relations', color: '#6366f1', bg: '#eef2ff' },
  { id: 'ethics', label: 'Ethics & Integrity', color: '#ec4899', bg: '#fdf2f8' },
  { id: 'essay', label: 'Essay', color: '#f97316', bg: '#fff7ed' },
  { id: 'csat', label: 'CSAT / Aptitude', color: '#64748b', bg: '#f8fafc' },
  { id: 'current', label: 'Current Affairs', color: '#ef4444', bg: '#fef2f2' },
  { id: 'general', label: 'General', color: '#94a3b8', bg: '#f8fafc' },
]

function getSubject(id) {
  return SUBJECTS.find(s => s.id === id) || SUBJECTS[SUBJECTS.length - 1]
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const C = {
  teal: '#14b8a6', tealDark: '#0d9488', navy: '#0f172a', navyLight: '#1e293b',
  slate: '#334155', muted: '#94a3b8', border: '#e2e8f0', bg: '#f8fafc', white: '#fff',
}

export default function Notes() {
  const { notes, loading, error, addNote, updateNote, deleteNote, togglePin } = useNotes()
  const [view, setView] = useState('list') // 'list' | 'edit'
  const [activeNote, setActiveNote] = useState(null) // note object being edited
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Editor state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editSubject, setEditSubject] = useState('general')
  const [editTags, setEditTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSubjectDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filtered & sorted notes
  const filteredNotes = useMemo(() => {
    let result = [...notes]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }

    // Subject filter
    if (filterSubject !== 'all') {
      result = result.filter(n => n.subject === filterSubject)
    }

    // Pinned first, then by updated_at
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updated_at) - new Date(a.updated_at)
    })

    return result
  }, [notes, searchQuery, filterSubject])

  // Subject counts
  const subjectCounts = useMemo(() => {
    const counts = { all: notes.length }
    notes.forEach(n => {
      const s = n.subject || 'general'
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [notes])

  const openNewNote = () => {
    setIsNew(true)
    setEditTitle('')
    setEditContent('')
    setEditSubject('general')
    setEditTags('')
    setActiveNote(null)
    setView('edit')
    setTimeout(() => titleRef.current?.focus(), 100)
  }

  const openEditNote = (note) => {
    setIsNew(false)
    setEditTitle(note.title || '')
    setEditContent(note.content || '')
    setEditSubject(note.subject || 'general')
    setEditTags((note.tags || []).join(', '))
    setActiveNote(note)
    setView('edit')
  }

  const handleSave = async () => {
    if (!editTitle.trim() && !editContent.trim()) return
    setSaving(true)
    const tags = editTags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      title: editTitle.trim() || 'Untitled Note',
      content: editContent,
      subject: editSubject,
      tags,
    }

    if (isNew) {
      const created = await addNote(payload)
      if (created) setActiveNote(created)
    } else if (activeNote) {
      await updateNote(activeNote.id, payload)
    }
    setSaving(false)
    setIsNew(false)
    setView('list')
  }

  const handleDelete = async (id) => {
    await deleteNote(id)
    setDeleteConfirm(null)
    if (activeNote?.id === id) {
      setView('list')
      setActiveNote(null)
    }
  }

  const handleBack = () => {
    setView('list')
    setActiveNote(null)
  }

  if (loading) return <LoadingSpinner />

  // ─── EDITOR VIEW ───
  if (view === 'edit') {
    const subj = getSubject(editSubject)
    return (
      <div>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, gap: 12, flexWrap: 'wrap',
        }}>
          <button onClick={handleBack} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
            fontSize: 13, fontWeight: 500, color: C.slate, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.bg}
            onMouseLeave={e => e.currentTarget.style.background = C.white}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleBack} style={{
              padding: '8px 16px', background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 10, fontSize: 13, fontWeight: 500, color: C.slate, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', background: C.teal, border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 600, color: '#fff', cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
            }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

        {/* Editor card */}
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          {/* Subject & Tags bar */}
          <div style={{
            padding: '14px 20px', borderBottom: `1px solid #f1f5f9`,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSubjectDropdown(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', background: subj.bg, border: `1px solid ${subj.color}20`,
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: subj.color,
                  cursor: 'pointer',
                }}
              >
                <BookOpen size={13} /> {subj.label} <ChevronDown size={12} />
              </button>
              {showSubjectDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
                  background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 6, width: 220,
                  maxHeight: 280, overflowY: 'auto',
                }}>
                  {SUBJECTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setEditSubject(s.id); setShowSubjectDropdown(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '8px 10px', border: 'none', borderRadius: 8,
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                        background: editSubject === s.id ? s.bg : 'transparent',
                        color: editSubject === s.id ? s.color : C.slate,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (editSubject !== s.id) e.currentTarget.style.background = '#f8fafc' }}
                      onMouseLeave={e => { if (editSubject !== s.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={13} color={C.muted} />
              <input
                type="text"
                value={editTags}
                onChange={e => setEditTags(e.target.value)}
                placeholder="Tags (comma separated)"
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: 13,
                  color: C.slate, background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div style={{ padding: '20px 20px 0' }}>
            <input
              ref={titleRef}
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Note title..."
              style={{
                width: '100%', border: 'none', outline: 'none',
                fontSize: 22, fontWeight: 700, color: C.navy, background: 'transparent',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ padding: '12px 20px 24px' }}>
            <textarea
              ref={contentRef}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              placeholder="Start writing your notes here...

Tips:
- Use this for revision notes on any topic
- Summarize newspaper editorials
- Write key points from NCERTs
- Draft answer frameworks for Mains"
              style={{
                width: '100%', minHeight: 400, border: 'none', outline: 'none',
                fontSize: 15, lineHeight: 1.8, color: C.navyLight, background: 'transparent',
                resize: 'vertical', boxSizing: 'border-box',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // ─── LIST VIEW ───
  const activeSubj = filterSubject === 'all' ? null : getSubject(filterSubject)

  return (
    <div>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', background: C.white, border: `1px solid ${C.border}`,
            borderRadius: 10, minWidth: 200,
          }}>
            <Search size={15} color={C.muted} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              style={{
                border: 'none', outline: 'none', fontSize: 13, color: C.slate,
                background: 'transparent', width: '100%',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex',
              }}>
                <X size={14} color={C.muted} />
              </button>
            )}
          </div>
        </div>
        <button onClick={openNewNote} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', background: C.teal, border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
          transition: 'background 0.15s', flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.tealDark}
          onMouseLeave={e => e.currentTarget.style.background = C.teal}
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Subject filter chips */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap',
        overflowX: 'auto', paddingBottom: 4,
      }}>
        <button
          onClick={() => setFilterSubject('all')}
          style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            background: filterSubject === 'all' ? C.navy : C.white,
            color: filterSubject === 'all' ? '#fff' : C.slate,
            border: filterSubject === 'all' ? 'none' : `1px solid ${C.border}`,
            transition: 'all 0.15s',
          }}
        >
          All ({subjectCounts.all || 0})
        </button>
        {SUBJECTS.filter(s => subjectCounts[s.id]).map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSubject(filterSubject === s.id ? 'all' : s.id)}
            style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              background: filterSubject === s.id ? s.bg : C.white,
              color: filterSubject === s.id ? s.color : C.muted,
              border: `1px solid ${filterSubject === s.id ? s.color + '30' : C.border}`,
              transition: 'all 0.15s',
            }}
          >
            {s.label} ({subjectCounts[s.id]})
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          title={searchQuery || filterSubject !== 'all' ? 'No notes found' : 'No notes yet'}
          subtitle={searchQuery || filterSubject !== 'all'
            ? 'Try a different search or filter'
            : 'Create your first note to start organizing your preparation'}
        />
      ) : (
        <div className="notes-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        }}>
          {filteredNotes.map(note => {
            const subj = getSubject(note.subject)
            const preview = (note.content || '').slice(0, 160)
            return (
              <div
                key={note.id}
                onClick={() => openEditNote(note)}
                style={{
                  background: C.white,
                  border: `1px solid ${note.pinned ? C.teal + '40' : C.border}`,
                  borderRadius: 14,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 160,
                }}
                className="note-card"
              >
                {/* Pin indicator */}
                {note.pinned && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                  }}>
                    <Pin size={13} color={C.teal} fill={C.teal} />
                  </div>
                )}

                {/* Subject badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 6,
                  background: subj.bg, fontSize: 11, fontWeight: 600,
                  color: subj.color, marginBottom: 10, width: 'fit-content',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: subj.color }} />
                  {subj.label}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 15, fontWeight: 700, color: C.navy,
                  margin: '0 0 6px', lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {note.title || 'Untitled Note'}
                </h3>

                {/* Preview */}
                <p style={{
                  fontSize: 13, color: C.muted, lineHeight: 1.5, margin: '0 0 12px',
                  flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                }}>
                  {preview || 'Empty note'}
                </p>

                {/* Footer: tags + time + actions */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: `1px solid #f1f5f9`, paddingTop: 10, marginTop: 'auto',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {(note.tags || []).slice(0, 2).map(t => (
                      <span key={t} style={{
                        fontSize: 10, fontWeight: 600, color: C.muted,
                        background: C.bg, padding: '2px 7px', borderRadius: 4,
                      }}>
                        #{t}
                      </span>
                    ))}
                    {(note.tags || []).length > 2 && (
                      <span style={{ fontSize: 10, color: C.muted }}>+{note.tags.length - 2}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>
                      {timeAgo(note.updated_at)}
                    </span>
                    {/* Action buttons */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(note.id, note.pinned) }}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                        display: 'flex', borderRadius: 6, transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {note.pinned
                        ? <PinOff size={13} color={C.muted} />
                        : <Pin size={13} color={C.muted} />
                      }
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (deleteConfirm === note.id) {
                          handleDelete(note.id)
                        } else {
                          setDeleteConfirm(note.id)
                          setTimeout(() => setDeleteConfirm(null), 3000)
                        }
                      }}
                      title={deleteConfirm === note.id ? 'Click again to confirm' : 'Delete'}
                      style={{
                        background: deleteConfirm === note.id ? '#fef2f2' : 'none',
                        border: 'none', cursor: 'pointer', padding: 4,
                        display: 'flex', borderRadius: 6, transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (deleteConfirm !== note.id) e.currentTarget.style.background = C.bg }}
                      onMouseLeave={e => { if (deleteConfirm !== note.id) e.currentTarget.style.background = 'none' }}
                    >
                      <Trash2 size={13} color={deleteConfirm === note.id ? '#ef4444' : C.muted} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .note-card:hover {
          border-color: ${C.teal}60 !important;
          box-shadow: 0 4px 16px rgba(20,184,166,0.06);
        }
        @media (max-width: 1024px) {
          .notes-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .notes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
