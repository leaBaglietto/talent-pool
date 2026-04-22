import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Joyer } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  joyer: Joyer | null
  loading: boolean
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [joyer, setJoyer] = useState<Joyer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchJoyer(currentUser.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          fetchJoyer(currentUser.id)
        } else {
          setJoyer(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchJoyer(userId: string) {
    try {
      const { data, error } = await supabase
        .from('joyers')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setJoyer(null)
      } else {
        setJoyer(data as Joyer)
      }
    } catch {
      setJoyer(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, joyer, loading }
}
