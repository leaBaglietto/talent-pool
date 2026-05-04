import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Joyer } from '@/lib/types'

export function useInterviewers() {
  return useQuery({
    queryKey: ['interviewers'],
    queryFn: async (): Promise<Joyer[]> => {
      if (localStorage.getItem('mock_joyer_auth') === 'true') {
        return [{
          id: 'mock-id',
          email: 'admin@agencia.com',
          full_name: 'Admin Local',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        }] as Joyer[]
      }

      const { data, error } = await supabase
        .from('joyers')
        .select('*')
        .in('role', ['interviewer', 'admin'])
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      return (data || []) as Joyer[]
    },
  })
}
