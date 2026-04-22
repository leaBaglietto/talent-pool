import { useNavigate } from 'react-router-dom'
import { Star, Briefcase } from 'lucide-react'
import type { ProspectWithRating } from '@/lib/types'

interface ProspectCardProps {
  prospect: ProspectWithRating
  showRating?: boolean
  showProjectBadge?: boolean
}

export default function ProspectCard({ prospect, showRating, showProjectBadge }: ProspectCardProps) {
  const navigate = useNavigate()

  function getPhotoUrl(path: string | null): string {
    if (!path) return ''
    // If it's a full URL, use it directly
    if (path.startsWith('http')) return path
    // Otherwise, construct from Supabase storage
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`
  }

  const photoUrl = getPhotoUrl(prospect.photo_url)
  const initials = prospect.full_name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      className="prospect-card glass-card"
      onClick={() => navigate(`/joyer/prospecto/${prospect.id}`)}
      aria-label={`Ver perfil de ${prospect.full_name}`}
      id={`prospect-card-${prospect.id}`}
    >
      <div className="card-avatar-section">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Foto de ${prospect.full_name}`}
            className="card-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden-fallback')
            }}
          />
        ) : null}
        <div className={`card-avatar-fallback ${photoUrl ? 'hidden-fallback' : ''}`}>
          {initials}
        </div>
      </div>

      <div className="card-info">
        <h3 className="card-name">{prospect.full_name}</h3>
        <p className="card-profile">{prospect.profile_type}</p>
        <span className="card-team badge badge-neutral">{prospect.team === 'creative' ? 'Creativo' : prospect.team}</span>
      </div>

      <div className="card-meta">
        {showRating && prospect.avg_rating !== null && (
          <div className="card-rating">
            <Star size={14} className="star-icon filled" />
            <span>{prospect.avg_rating.toFixed(1)}</span>
          </div>
        )}
        {showProjectBadge && prospect.status === 'selected' && (
          <div className={`project-badge ${prospect.is_in_project ? 'in-project' : 'available'}`}>
            <Briefcase size={12} />
            {prospect.is_in_project ? 'En Proyecto' : 'Disponible'}
          </div>
        )}
      </div>

      <style>{`
        .prospect-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.5rem 1rem;
          cursor: pointer;
          border: none;
          font-family: inherit;
          width: 100%;
          position: relative;
        }

        .card-avatar-section {
          position: relative;
          width: 72px;
          height: 72px;
          margin-bottom: 0.75rem;
        }

        .card-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-border);
        }

        .card-avatar-fallback {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .hidden-fallback {
          display: none;
        }

        .card-name {
          font-size: 0.9375rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--color-text-primary);
        }

        .card-profile {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.5rem;
        }

        .card-info {
          margin-bottom: 0.5rem;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;
        }

        .card-rating {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-accent);
        }

        .star-icon.filled {
          fill: var(--color-accent);
          color: var(--color-accent);
        }

        .project-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.1875rem 0.5rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .project-badge.in-project {
          background: var(--color-warning-bg);
          color: var(--color-warning);
        }

        .project-badge.available {
          background: var(--color-success-bg);
          color: var(--color-success);
        }
      `}</style>
    </button>
  )
}
