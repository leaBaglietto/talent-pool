import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthState } from '@/hooks/useAuthState'
import { useInterviewers } from '@/features/dashboard/hooks/useJoyers'
import { useToggleInProject } from '@/features/dashboard/hooks/useProspects'
import RatingBlock from '@/features/dashboard/components/RatingBlock'
import type { Prospect, Interview, Joyer } from '@/lib/types'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ExternalLink,
  FileDown,
  Calendar,
  Briefcase,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { joyer } = useAuthState()
  const { data: interviewers } = useInterviewers()
  const toggleProject = useToggleInProject()

  const [notes, setNotes] = useState('')
  const [selectedInterviewer, setSelectedInterviewer] = useState('')

  // Fetch prospect
  const { data: prospect, isLoading } = useQuery({
    queryKey: ['prospect', id],
    queryFn: async (): Promise<Prospect> => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Prospect
    },
    enabled: !!id,
  })

  // Fetch interview
  const { data: interview } = useQuery({
    queryKey: ['interview', id],
    queryFn: async (): Promise<(Interview & { interviewer?: Joyer }) | null> => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          joyers!interviews_interviewer_id_fkey (*)
        `)
        .eq('prospect_id', id!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const result = data as Record<string, unknown>
      return {
        ...result,
        interviewer: result.joyers as Joyer | undefined,
      } as Interview & { interviewer?: Joyer }
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (interview?.notes) setNotes(interview.notes)
    if (interview?.interviewer_id) setSelectedInterviewer(interview.interviewer_id)
  }, [interview])

  // Assign interviewer mutation
  const assignMutation = useMutation({
    mutationFn: async (interviewerId: string) => {
      // Try RPC first, fall back to direct operations
      try {
        const { error } = await supabase.rpc('assign_interviewer', {
          p_prospect_id: id!,
          p_interviewer_id: interviewerId,
        })
        if (error) throw error
      } catch {
        // Fallback: direct operations
        const { error: updateError } = await supabase
          .from('prospects')
          .update({ status: 'assigned' })
          .eq('id', id!)
        if (updateError) throw updateError

        const { error: interviewError } = await supabase
          .from('interviews')
          .upsert({
            prospect_id: id!,
            interviewer_id: interviewerId,
            outcome: 'pending',
          }, { onConflict: 'prospect_id' })
        if (interviewError) throw interviewError
      }
    },
    onSuccess: () => {
      toast.success('Entrevistador asignado')
      queryClient.invalidateQueries({ queryKey: ['prospect', id] })
      queryClient.invalidateQueries({ queryKey: ['interview', id] })
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
    onError: () => toast.error('Error al asignar entrevistador'),
  })

  // Accept mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase.rpc('accept_prospect', {
          p_prospect_id: id!,
          p_notes: notes,
        })
        if (error) throw error
      } catch {
        const { error: updateError } = await supabase
          .from('prospects')
          .update({ status: 'selected' })
          .eq('id', id!)
        if (updateError) throw updateError

        if (interview) {
          await supabase
            .from('interviews')
            .update({
              outcome: 'accepted',
              notes,
              outcome_at: new Date().toISOString(),
            })
            .eq('id', interview.id)
        }
      }
    },
    onSuccess: () => {
      toast.success('¡Talento seleccionado!')
      queryClient.invalidateQueries({ queryKey: ['prospect', id] })
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
    onError: () => toast.error('Error al aceptar'),
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase.rpc('reject_prospect', {
          p_prospect_id: id!,
          p_notes: notes,
        })
        if (error) throw error
      } catch {
        const { error: updateError } = await supabase
          .from('prospects')
          .update({ status: 'rejected' })
          .eq('id', id!)
        if (updateError) throw updateError

        if (interview) {
          await supabase
            .from('interviews')
            .update({
              outcome: 'rejected',
              notes,
              outcome_at: new Date().toISOString(),
            })
            .eq('id', interview.id)
        }
      }
    },
    onSuccess: () => {
      toast.success('Prospecto rechazado')
      queryClient.invalidateQueries({ queryKey: ['prospect', id] })
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
    },
    onError: () => toast.error('Error al rechazar'),
  })

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      if (interview) {
        const { error } = await supabase
          .from('interviews')
          .update({ notes })
          .eq('id', interview.id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast.success('Observaciones guardadas')
      queryClient.invalidateQueries({ queryKey: ['interview', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="detail-loading">
        <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="detail-empty">
        <p>Prospecto no encontrado</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    )
  }

  const isEnLaMira = prospect.status === 'unassigned' || prospect.status === 'assigned'
  const isSelected = prospect.status === 'selected'
  const isRejected = prospect.status === 'rejected'
  const canAssign = joyer && (joyer.role === 'admin' || joyer.role === 'interviewer')
  const canDecide = joyer && (joyer.role === 'admin' || joyer.role === 'interviewer')

  function getPhotoUrl(path: string | null): string {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`
  }

  function getCvUrl(path: string | null): string {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/cvs/${path}`
  }

  const photoUrl = getPhotoUrl(prospect.photo_url)
  const initials = prospect.full_name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusBadge = isSelected
    ? { className: 'badge-success', text: 'Seleccionado' }
    : isRejected
      ? { className: 'badge-danger', text: 'Rechazado' }
      : prospect.status === 'assigned'
        ? { className: 'badge-warning', text: 'Entrevista asignada' }
        : { className: 'badge-info', text: 'Sin asignar' }

  return (
    <div className="detail-page animate-fade-in">
      <button
        className="btn btn-ghost back-btn"
        onClick={() => navigate(-1)}
        id="back-from-detail-btn"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      {/* Profile Header */}
      <div className="profile-header glass-card">
        <div className="profile-avatar-section">
          {photoUrl ? (
            <img src={photoUrl} alt={prospect.full_name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-fallback">{initials}</div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name-row">
            <h1>{prospect.full_name}</h1>
            <span className={`badge ${statusBadge.className}`}>{statusBadge.text}</span>
          </div>
          <p className="profile-specialty">{prospect.profile_type}</p>

          <div className="profile-meta">
            <div className="meta-item">
              <Mail size={14} />
              <span>{prospect.email}</span>
            </div>
            {prospect.phone && (
              <div className="meta-item">
                <Phone size={14} />
                <span>{prospect.phone}</span>
              </div>
            )}
            <div className="meta-item">
              <Clock size={14} />
              <span>{prospect.years_experience} años de experiencia</span>
            </div>
            <div className="meta-item">
              <Calendar size={14} />
              <span>Ingresó {new Date(prospect.created_at).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column - Main Info */}
        <div className="detail-main">
          {/* Links */}
          <div className="detail-section glass-card">
            <h3>Documentos y enlaces</h3>
            <div className="links-row">
              {prospect.cv_url && (
                <a
                  href={getCvUrl(prospect.cv_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  id="download-cv-btn"
                >
                  <FileDown size={16} />
                  Descargar CV
                </a>
              )}
              {prospect.portfolio_url && (
                <a
                  href={prospect.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  id="view-portfolio-btn"
                >
                  <ExternalLink size={16} />
                  Ver Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Observations */}
          {(isEnLaMira || isSelected) && (
            <div className="detail-section glass-card">
              <h3>Observaciones</h3>
              <textarea
                className="input-field"
                placeholder="Escribí tus observaciones sobre este perfil..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={isRejected && joyer?.role !== 'admin'}
                id="notes-textarea"
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => saveNotesMutation.mutate()}
                disabled={saveNotesMutation.isPending}
                id="save-notes-btn"
              >
                {saveNotesMutation.isPending ? 'Guardando...' : 'Guardar observaciones'}
              </button>
            </div>
          )}

          {/* Ratings (Selected only) */}
          {isSelected && (
            <div className="detail-section glass-card">
              <RatingBlock prospectId={prospect.id} />
            </div>
          )}

          {/* Rejected info */}
          {isRejected && interview && (
            <div className="detail-section glass-card">
              <h3>Información del rechazo</h3>
              <div className="rejection-info">
                {interview.interviewer && (
                  <div className="meta-item">
                    <User size={14} />
                    <span>Rechazado por: <strong>{(interview as Interview & { interviewer?: Joyer }).interviewer?.full_name}</strong></span>
                  </div>
                )}
                {interview.outcome_at && (
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Fecha: {new Date(interview.outcome_at).toLocaleDateString('es-AR')}</span>
                  </div>
                )}
                {interview.notes && (
                  <div className="rejection-notes">
                    <p>{interview.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="detail-sidebar">
          {/* Interviewer Assignment (En la Mira) */}
          {isEnLaMira && canAssign && (
            <div className="action-card glass-card">
              <h3>Asignar entrevistador</h3>
              <select
                className="input-field"
                value={selectedInterviewer}
                onChange={(e) => {
                  setSelectedInterviewer(e.target.value)
                  if (e.target.value) assignMutation.mutate(e.target.value)
                }}
                disabled={assignMutation.isPending}
                id="interviewer-select"
              >
                <option value="">Seleccionar entrevistador</option>
                {interviewers?.map((i) => (
                  <option key={i.id} value={i.id}>{i.full_name}</option>
                ))}
              </select>

              {interview?.interviewer && (
                <p className="assigned-info">
                  <User size={14} />
                  Asignado a: <strong>{(interview as Interview & { interviewer?: Joyer }).interviewer?.full_name}</strong>
                </p>
              )}
            </div>
          )}

          {/* Accept / Reject Actions */}
          {isEnLaMira && canDecide && (
            <div className="action-card glass-card">
              <h3>Decisión</h3>
              <div className="action-buttons">
                <button
                  className="btn btn-success"
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                  id="accept-btn"
                >
                  <CheckCircle size={18} />
                  {acceptMutation.isPending ? 'Aceptando...' : 'Mover a Seleccionados'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => rejectMutation.mutate()}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                  id="reject-btn"
                >
                  <XCircle size={18} />
                  {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          )}

          {/* In Project Toggle (Selected) */}
          {isSelected && (
            <div className="action-card glass-card">
              <h3>Estado de proyecto</h3>
              <div className="project-toggle-row">
                <span className="toggle-label">
                  <Briefcase size={16} />
                  En Proyecto
                </span>
                <button
                  className={`toggle-switch ${prospect.is_in_project ? 'active' : ''}`}
                  onClick={() =>
                    toggleProject.mutate({
                      id: prospect.id,
                      isInProject: !prospect.is_in_project,
                    })
                  }
                  aria-label={prospect.is_in_project ? 'Desactivar En Proyecto' : 'Activar En Proyecto'}
                  id="toggle-project-btn"
                />
              </div>
              <span className={`project-status ${prospect.is_in_project ? 'active' : ''}`}>
                {prospect.is_in_project ? '🟡 Actualmente en un proyecto' : '🟢 Disponible para proyectos'}
              </span>
            </div>
          )}

          {/* Selected info */}
          {isSelected && interview && (
            <div className="action-card glass-card">
              <h3>Aprobación</h3>
              {interview.interviewer && (
                <div className="meta-item">
                  <User size={14} />
                  <span>Aprobado por: <strong>{(interview as Interview & { interviewer?: Joyer }).interviewer?.full_name}</strong></span>
                </div>
              )}
              {interview.outcome_at && (
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>Fecha: {new Date(interview.outcome_at).toLocaleDateString('es-AR')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .detail-page {
          max-width: 1000px;
        }

        .detail-loading {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem;
          color: var(--color-text-muted);
        }

        .back-btn {
          margin-bottom: 1rem;
        }

        /* Profile Header */
        .profile-header {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .profile-header:hover {
          transform: none;
        }

        .profile-avatar-section {
          flex-shrink: 0;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--color-border);
        }

        .profile-avatar-fallback {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 2rem;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }

        .profile-name-row h1 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .profile-specialty {
          font-size: 0.9375rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.75rem;
        }

        .profile-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        /* Grid */
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          align-items: start;
        }

        .detail-main {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-section {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-section:hover {
          transform: none;
        }

        .detail-section h3 {
          font-size: 0.9375rem;
          font-weight: 700;
        }

        .links-row {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        /* Action cards */
        .action-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-card:hover {
          transform: none;
        }

        .action-card h3 {
          font-size: 0.9375rem;
          font-weight: 700;
        }

        .assigned-info {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          margin-top: 0.25rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-buttons .btn {
          width: 100%;
          justify-content: center;
        }

        /* Project toggle */
        .project-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .project-status {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }

        .project-status.active {
          color: var(--color-warning);
        }

        /* Rejection */
        .rejection-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rejection-notes {
          padding: 0.75rem;
          background: var(--color-bg-input);
          border-radius: var(--radius-md);
          margin-top: 0.25rem;
        }

        .rejection-notes p {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-name-row {
            justify-content: center;
          }

          .profile-meta {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
