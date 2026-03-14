import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const profileFetchedFor = useRef(null)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return }
    // Skip if we already fetched for this user
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
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        profileFetchedFor.current = null
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const isAdmin = profile?.role === 'Admin'

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    profileFetchedFor.current = null // force re-fetch
    await fetchProfile(user.id)
  }, [user?.id, fetchProfile])

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
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
