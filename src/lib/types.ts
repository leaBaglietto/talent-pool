/* ============================================
   Talent Pool Manager — Database Types
   Generated from SRS v1.1 schema definition
   ============================================ */

// ------- Enum-like constants -------

export const PROSPECT_STATUS = {
  UNASSIGNED: 'unassigned',
  ASSIGNED: 'assigned',
  SELECTED: 'selected',
  REJECTED: 'rejected',
} as const

export type ProspectStatus = (typeof PROSPECT_STATUS)[keyof typeof PROSPECT_STATUS]

export const TEAM = {
  CREATIVE: 'creative',
  ACCOUNTS: 'accounts',
  DIGITAL: 'digital',
} as const

export type Team = (typeof TEAM)[keyof typeof TEAM]

export const PROFILE_TYPES = [
  'Director de Arte',
  'Diseñador Gráfico',
  'Ilustrador/a',
  'Redactor/a Creativo/a',
  'Editor/a de Video',
  'Motion Graphics',
] as const

export type ProfileType = (typeof PROFILE_TYPES)[number]

export const JOYER_ROLE = {
  JOYER: 'joyer',
  INTERVIEWER: 'interviewer',
  ADMIN: 'admin',
} as const

export type JoyerRole = (typeof JOYER_ROLE)[keyof typeof JOYER_ROLE]

export const INTERVIEW_OUTCOME = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const

export type InterviewOutcome = (typeof INTERVIEW_OUTCOME)[keyof typeof INTERVIEW_OUTCOME]

// ------- Table Row Types -------

export interface Prospect {
  id: string
  email: string
  full_name: string
  phone: string | null
  team: Team
  profile_type: ProfileType
  years_experience: number
  portfolio_url: string | null
  cv_url: string | null
  photo_url: string | null
  status: ProspectStatus
  is_in_project: boolean
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  prospect_id: string
  interviewer_id: string
  outcome: InterviewOutcome
  notes: string | null
  outcome_at: string | null
  created_at: string
}

export interface Rating {
  id: string
  prospect_id: string
  joyer_id: string
  score: number // 1-5
  comment: string | null
  created_at: string
  updated_at: string
  // Joined fields
  joyer_name?: string
}

export interface Joyer {
  id: string
  full_name: string
  role: JoyerRole
  team: string | null
  is_active: boolean
  created_at: string
}

export interface StatusLog {
  id: string
  prospect_id: string
  old_status: ProspectStatus | null
  new_status: ProspectStatus
  changed_by: string | null
  note: string | null
  created_at: string
}

// ------- Supabase Database Type -------

export interface Database {
  public: {
    Tables: {
      prospects: {
        Row: Prospect
        Insert: Omit<Prospect, 'id' | 'created_at' | 'updated_at' | 'is_in_project'> & {
          id?: string
          created_at?: string
          updated_at?: string
          is_in_project?: boolean
        }
        Update: Partial<Omit<Prospect, 'id' | 'created_at'>>
      }
      interviews: {
        Row: Interview
        Insert: Omit<Interview, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Interview, 'id' | 'created_at'>>
      }
      ratings: {
        Row: Rating
        Insert: Omit<Rating, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Rating, 'id' | 'created_at'>>
      }
      joyers: {
        Row: Joyer
        Insert: Omit<Joyer, 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Omit<Joyer, 'id' | 'created_at'>>
      }
      status_logs: {
        Row: StatusLog
        Insert: Omit<StatusLog, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: never
      }
    }
    Functions: {
      assign_interviewer: {
        Args: { p_prospect_id: string; p_interviewer_id: string }
        Returns: void
      }
      accept_prospect: {
        Args: { p_prospect_id: string; p_notes: string }
        Returns: void
      }
      reject_prospect: {
        Args: { p_prospect_id: string; p_notes: string }
        Returns: void
      }
    }
  }
}

// ------- View / DTO Types -------

export interface ProspectWithRating extends Prospect {
  avg_rating: number | null
  rating_count: number
}

export interface ProspectDetail extends Prospect {
  interview: Interview | null
  interviewer: Joyer | null
  ratings: (Rating & { joyer_name: string })[]
  avg_rating: number | null
}

// ------- Form Types -------

export interface ApplicationFormData {
  full_name: string
  phone: string
  profile_type: ProfileType
  years_experience: number
  portfolio_url: string
  cv_file: File | null
  photo_file: File | null
}
