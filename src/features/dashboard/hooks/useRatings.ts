import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Rating } from '@/lib/types'

export function useRatings(prospectId: string) {
  return useQuery({
    queryKey: ['ratings', prospectId],
    queryFn: async (): Promise<(Rating & { joyer_name: string })[]> => {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          joyers!ratings_joyer_id_fkey (full_name)
        `)
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((r: Record<string, unknown>) => ({
        ...r,
        joyer_name: (r.joyers as { full_name: string } | null)?.full_name || 'Desconocido',
      })) as (Rating & { joyer_name: string })[]
    },
    enabled: !!prospectId,
  })
}

export function useUpsertRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      prospectId,
      score,
      comment,
    }: {
      prospectId: string
      score: number
      comment: string
    }) => {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('No autenticado')

      // Check if rating exists for this joyer
      const { data: existing } = await supabase
        .from('ratings')
        .select('id')
        .eq('prospect_id', prospectId)
        .eq('joyer_id', user.id)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('ratings')
          .update({ score, comment, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert({
            prospect_id: prospectId,
            joyer_id: user.id,
            score,
            comment,
          })
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.prospectId] })
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      queryClient.invalidateQueries({ queryKey: ['top-talents'] })
    },
  })
}
