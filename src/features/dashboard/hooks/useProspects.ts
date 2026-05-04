import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prospect, ProspectWithRating, ProspectStatus } from '@/lib/types'

const MOCK_PROSPECTS: ProspectWithRating[] = [
  {
    id: 'mock-prospect-1',
    full_name: 'Laura Gómez',
    email: 'laura.gomez@example.com',
    phone: '+541123456789',
    portfolio_url: 'https://behance.net/lauragomez',
    linkedin_url: 'https://linkedin.com/in/lauragomez',
    profile_type: 'video_editor',
    country: 'Argentina',
    expected_rate: 20,
    status: 'unassigned',
    is_in_project: false,
    interviewer_id: null,
    created_at: '2026-04-20T10:00:00Z',
    avg_rating: null,
    rating_count: 0
  },
  {
    id: 'mock-prospect-2',
    full_name: 'Martín Rodríguez',
    email: 'martin.rod@example.com',
    phone: '+541198765432',
    portfolio_url: 'https://dribbble.com/martinrod',
    linkedin_url: 'https://linkedin.com/in/martinrod',
    profile_type: 'graphic_designer',
    country: 'Argentina',
    expected_rate: 25,
    status: 'assigned',
    is_in_project: false,
    interviewer_id: 'mock-id',
    created_at: '2026-04-19T14:30:00Z',
    avg_rating: null,
    rating_count: 0
  },
  {
    id: 'mock-prospect-3',
    full_name: 'Camila Fernández',
    email: 'camila.f@example.com',
    phone: '+541155443322',
    portfolio_url: 'https://behance.net/camilaf',
    linkedin_url: 'https://linkedin.com/in/camilaf',
    profile_type: 'content_creator',
    country: 'Uruguay',
    expected_rate: 18,
    status: 'selected',
    is_in_project: true,
    interviewer_id: 'mock-id',
    created_at: '2026-04-15T09:00:00Z',
    avg_rating: 4.8,
    rating_count: 5
  },
  {
    id: 'mock-prospect-4',
    full_name: 'Santiago López',
    email: 'santi.lopez@example.com',
    phone: '+541144556677',
    portfolio_url: 'https://vimeo.com/santilopez',
    linkedin_url: 'https://linkedin.com/in/santilopez',
    profile_type: 'video_editor',
    country: 'Chile',
    expected_rate: 30,
    status: 'selected',
    is_in_project: false,
    interviewer_id: 'mock-id',
    created_at: '2026-04-12T16:45:00Z',
    avg_rating: 4.2,
    rating_count: 3
  },
  {
    id: 'mock-prospect-5',
    full_name: 'Valentina Torres',
    email: 'val.torres@example.com',
    phone: '+541177889900',
    portfolio_url: 'https://behance.net/valtorres',
    linkedin_url: 'https://linkedin.com/in/valtorres',
    profile_type: 'graphic_designer',
    country: 'Colombia',
    expected_rate: 22,
    status: 'unassigned',
    is_in_project: false,
    interviewer_id: null,
    created_at: '2026-04-22T11:15:00Z',
    avg_rating: null,
    rating_count: 0
  }
] as ProspectWithRating[]

function isMockAuth(): boolean {
  return localStorage.getItem('mock_joyer_auth') === 'true'
}

export function useProspectsByStatus(status: ProspectStatus | ProspectStatus[]) {
  const statuses = Array.isArray(status) ? status : [status]

  return useQuery({
    queryKey: ['prospects', statuses],
    queryFn: async (): Promise<ProspectWithRating[]> => {
      if (isMockAuth()) {
        return MOCK_PROSPECTS.filter(p => statuses.includes(p.status as ProspectStatus))
      }

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
      if (isMockAuth()) {
        return MOCK_PROSPECTS
          .filter(p => p.status === 'selected')
          .sort((a, b) => {
            if (a.avg_rating === null && b.avg_rating === null) return 0
            if (a.avg_rating === null) return 1
            if (b.avg_rating === null) return -1
            return b.avg_rating - a.avg_rating
          })
          .slice(0, limit)
      }

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
      if (isMockAuth()) {
        return MOCK_PROSPECTS
          .filter(p => ['unassigned', 'assigned'].includes(p.status))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)
      }

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
