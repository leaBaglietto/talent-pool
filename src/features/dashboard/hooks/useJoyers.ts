import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Joyer } from '@/lib/types'

export function useInterviewers() {
  return useQuery({
    queryKey: ['interviewers'],
    queryFn: async (): Promise<Joyer[]> => {
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
