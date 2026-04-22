import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Rating } from '@/lib/types'
import { useRatings, useUpsertRating } from '@/features/dashboard/hooks/useRatings'
import { toast } from 'sonner'

interface RatingBlockProps {
  prospectId: string
}

function StarSelector({ value, onChange, readonly }: { value: number; onChange?: (val: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0)

  return (
    <div className={`star-rating ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={readonly ? 16 : 24}
          className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(star)}
          fill={star <= (hover || value) ? 'var(--color-accent)' : 'none'}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        />
      ))}
    </div>
  )
}

export default function RatingBlock({ prospectId }: RatingBlockProps) {
  const { data: ratings, isLoading } = useRatings(prospectId)
  const upsertRating = useUpsertRating()

  const [newScore, setNewScore] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [showForm, setShowForm] = useState(false)

  const avgRating = ratings && ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length)
    : null

  async function handleSubmit() {
    if (newScore === 0) {
      toast.error('Seleccioná una puntuación')
      return
    }

    try {
      await upsertRating.mutateAsync({
        prospectId,
        score: newScore,
        comment: newComment.trim(),
      })
      toast.success('Calificación guardada')
      setShowForm(false)
      setNewScore(0)
      setNewComment('')
    } catch {
      toast.error('Error al guardar la calificación')
    }
  }

  return (
    <div className="rating-block">
      <div className="rating-header">
        <h3>Calificaciones</h3>
        {avgRating !== null && (
          <div className="avg-rating">
            <StarSelector value={Math.round(avgRating)} readonly />
            <span className="avg-number">{avgRating.toFixed(1)}</span>
            <span className="avg-count">({ratings?.length} {ratings?.length === 1 ? 'evaluación' : 'evaluaciones'})</span>
          </div>
        )}
      </div>

      {!showForm && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowForm(true)}
          id="add-rating-btn"
        >
          <Star size={14} />
          Calificar talento
        </button>
      )}

      {showForm && (
        <div className="rating-form glass-card">
          <h4>Tu calificación</h4>
          <div className="rating-form-stars">
            <StarSelector value={newScore} onChange={setNewScore} />
          </div>
          <textarea
            className="input-field rating-comment"
            placeholder="Comentario sobre el desempeño en el proyecto..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            id="rating-comment-input"
          />
          <div className="rating-form-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={upsertRating.isPending}
              id="submit-rating-btn"
            >
              {upsertRating.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="ratings-list">
        {isLoading ? (
          <div className="skeleton" style={{ height: '80px' }} />
        ) : ratings && ratings.length > 0 ? (
          ratings.map((rating: Rating & { joyer_name: string }) => (
            <div key={rating.id} className="rating-item">
              <div className="rating-item-header">
                <span className="rating-author">{rating.joyer_name}</span>
                <StarSelector value={rating.score} readonly />
                <span className="rating-date">
                  {new Date(rating.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
              {rating.comment && (
                <p className="rating-comment-text">{rating.comment}</p>
              )}
            </div>
          ))
        ) : !showForm ? (
          <p className="no-ratings">Aún no hay calificaciones</p>
        ) : null}
      </div>

      <style>{`
        .rating-block {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rating-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .rating-header h3 {
          font-size: 1rem;
          font-weight: 700;
        }

        .avg-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .avg-number {
          font-weight: 700;
          color: var(--color-accent);
          font-size: 1.125rem;
        }

        .avg-count {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .rating-form {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rating-form:hover {
          transform: none;
        }

        .rating-form h4 {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .rating-form-stars {
          padding: 0.25rem 0;
        }

        .rating-comment {
          resize: vertical;
          min-height: 60px;
        }

        .rating-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .ratings-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rating-item {
          padding: 0.875rem;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .rating-item-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
          margin-bottom: 0.375rem;
        }

        .rating-author {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .rating-date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-left: auto;
        }

        .rating-comment-text {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .no-ratings {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          text-align: center;
          padding: 1rem;
        }
      `}</style>
    </div>
  )
}
