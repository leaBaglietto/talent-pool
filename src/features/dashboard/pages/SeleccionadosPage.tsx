import { useState, useMemo } from 'react'
import { useProspectsByStatus } from '@/features/dashboard/hooks/useProspects'
import ProspectCard from '@/features/dashboard/components/ProspectCard'
import SpecialtyFilter from '@/features/dashboard/components/SpecialtyFilter'
import { Star } from 'lucide-react'

export default function SeleccionadosPage() {
  const { data: prospects, isLoading } = useProspectsByStatus('selected')
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    if (!prospects) return []
    if (!filter) return prospects
    return prospects.filter((p) => p.profile_type === filter)
  }, [prospects, filter])

  return (
    <div className="list-page animate-fade-in">
      <div className="list-header">
        <div className="list-title-row">
          <Star size={22} className="section-icon" />
          <h1>Seleccionados</h1>
        </div>
        <p className="list-desc">Talentos que aprobaron el proceso de selección</p>
      </div>

      <SpecialtyFilter
        value={filter}
        onChange={setFilter}
        totalCount={prospects?.length || 0}
        filteredCount={filtered.length}
      />

      <div className="list-content">
        {isLoading ? (
          <div className="card-grid list-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="card-grid list-grid">
            {filtered.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                showRating
                showProjectBadge
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <Star size={32} />
            <p>{filter ? 'No hay talentos con esta especialidad' : 'Aún no hay talentos seleccionados'}</p>
          </div>
        )}
      </div>

      <style>{`
        .list-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .list-header {
          margin-bottom: 0.25rem;
        }

        .list-title-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.25rem;
        }

        .section-icon {
          color: var(--color-accent);
        }

        .list-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .list-desc {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          padding-left: 2.1rem;
        }

        .list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 3rem;
          text-align: center;
          color: var(--color-text-muted);
        }

        .empty-state:hover {
          transform: none;
        }
      `}</style>
    </div>
  )
}
