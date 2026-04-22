import { useState, useMemo } from 'react'
import { useProspectsByStatus } from '@/features/dashboard/hooks/useProspects'
import ProspectCard from '@/features/dashboard/components/ProspectCard'
import SpecialtyFilter from '@/features/dashboard/components/SpecialtyFilter'
import { XCircle } from 'lucide-react'

export default function RechazadosPage() {
  const { data: prospects, isLoading } = useProspectsByStatus('rejected')
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
          <XCircle size={22} className="section-icon rejected-icon" />
          <h1>Rechazados</h1>
        </div>
        <p className="list-desc">Perfiles descartados en el proceso de selección</p>
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="card-grid list-grid">
            {filtered.map((prospect) => (
              <ProspectCard key={prospect.id} prospect={prospect} />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <XCircle size={32} />
            <p>{filter ? 'No hay rechazados con esta especialidad' : 'No hay perfiles rechazados'}</p>
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

        .rejected-icon {
          color: var(--color-danger) !important;
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
