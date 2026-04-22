import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prospect, ProspectWithRating, ProspectStatus } from '@/lib/types'

export function useProspectsByStatus(status: ProspectStatus | ProspectStatus[]) {
  const statuses = Array.isArray(status) ? status : [status]

  return useQuery({
    queryKey: ['prospects', statuses],
    queryFn: async (): Promise<ProspectWithRating[]> => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .in('status', statuses)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch ratings for avg calculation
      const prospectIds = (data || []).map((p) => p.id)
      let ratingsMap: Record<string, { sum: number; count: number }> = {}

      if (prospectIds.length > 0) {
        const { data: ratings } = await supabase
          .from('ratings')
          .select('prospect_id, score')
          .in('prospect_id', prospectIds)

        if (ratings) {
          ratingsMap = ratings.reduce(
            (acc, r) => {
              if (!acc[r.prospect_id]) acc[r.prospect_id] = { sum: 0, count: 0 }
              acc[r.prospect_id]!.sum += r.score
              acc[r.prospect_id]!.count += 1
              return acc
            },
            {} as Record<string, { sum: number; count: number }>
          )
        }
      }

      return (data || []).map((p) => ({
        ...p,
        avg_rating: ratingsMap[p.id]
          ? ratingsMap[p.id]!.sum / ratingsMap[p.id]!.count
          : null,
        rating_count: ratingsMap[p.id]?.count || 0,
      })) as ProspectWithRating[]
    },
  })
}

export function useTopTalents(limit = 10) {
  return useQuery({
    queryKey: ['top-talents', limit],
    queryFn: async (): Promise<ProspectWithRating[]> => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('status', 'selected')

      if (error) throw error

      const prospectIds = (data || []).map((p) => p.id)
      let ratingsMap: Record<string, { sum: number; count: number }> = {}

      if (prospectIds.length > 0) {
        const { data: ratings } = await supabase
          .from('ratings')
          .select('prospect_id, score')
          .in('prospect_id', prospectIds)

        if (ratings) {
          ratingsMap = ratings.reduce(
            (acc, r) => {
              if (!acc[r.prospect_id]) acc[r.prospect_id] = { sum: 0, count: 0 }
              acc[r.prospect_id]!.sum += r.score
              acc[r.prospect_id]!.count += 1
              return acc
            },
            {} as Record<string, { sum: number; count: number }>
          )
        }
      }

      const withRatings = (data || []).map((p) => ({
        ...p,
        avg_rating: ratingsMap[p.id]
          ? ratingsMap[p.id]!.sum / ratingsMap[p.id]!.count
          : null,
        rating_count: ratingsMap[p.id]?.count || 0,
      })) as ProspectWithRating[]

      // Sort by avg rating desc, unrated last
      return withRatings
        .sort((a, b) => {
          if (a.avg_rating === null && b.avg_rating === null) return 0
          if (a.avg_rating === null) return 1
          if (b.avg_rating === null) return -1
          return b.avg_rating - a.avg_rating
        })
        .slice(0, limit)
    },
  })
}

export function useNewArrivals(limit = 10) {
  return useQuery({
    queryKey: ['new-arrivals', limit],
    queryFn: async (): Promise<Prospect[]> => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .in('status', ['unassigned', 'assigned'])
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as Prospect[]
    },
  })
}

export function useToggleInProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isInProject }: { id: string; isInProject: boolean }) => {
      const { error } = await supabase
        .from('prospects')
        .update({ is_in_project: isInProject })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      queryClient.invalidateQueries({ queryKey: ['top-talents'] })
    },
  })
}
