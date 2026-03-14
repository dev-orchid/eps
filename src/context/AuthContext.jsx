import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const profileFetchedFor = useRef(null)
  const currentUserId = useRef(null)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return }
    if (profileFetchedFor.current === userId) return
    profileFetchedFor.current = userId
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data || null)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      const u = session?.user ?? null
      currentUserId.current = u?.id || null
      setUser(u)
      if (u) {
        fetchProfile(u.id).then(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      const newUserId = session?.user?.id || null
      // Only update user state if the user actually changed
      if (newUserId !== currentUserId.current) {
        currentUserId.current = newUserId
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          profileFetchedFor.current = null
        }
      } else {
        // Same user, just update session (token refresh) without triggering re-renders on user
        setSession(session)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const isAdmin = profile?.role === 'Admin'

  const refreshProfile = useCallback(async () => {
    if (!currentUserId.current) return
    profileFetchedFor.current = null
    await fetchProfile(currentUserId.current)
  }, [fetchProfile])

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setProfile(null)
    profileFetchedFor.current = null
    currentUserId.current = null
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
