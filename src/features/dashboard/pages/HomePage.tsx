import { useTopTalents, useNewArrivals } from '@/features/dashboard/hooks/useProspects'
import ProspectCard from '@/features/dashboard/components/ProspectCard'
import { Star, UserPlus, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { data: topTalents, isLoading: loadingTop } = useTopTalents()
  const { data: newArrivals, isLoading: loadingNew } = useNewArrivals()

  return (
    <div className="home-page animate-fade-in">
      {/* Top 10 Section */}
      <section className="home-section" aria-labelledby="top10-title">
        <div className="section-header">
          <div className="section-title-row">
            <TrendingUp size={22} className="section-icon" />
            <h2 id="top10-title">Top 10 Talentos</h2>
          </div>
          <p className="section-desc">Los talentos con mayor puntuación promedio</p>
        </div>

        {loadingTop ? (
          <div className="card-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : topTalents && topTalents.length > 0 ? (
          <div className="card-grid scroll-grid">
            {topTalents.map((talent) => (
              <ProspectCard
                key={talent.id}
                prospect={talent}
                showRating
                showProjectBadge
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <Star size={32} />
            <p>Aún no hay talentos seleccionados con calificaciones</p>
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="home-section" aria-labelledby="new-arrivals-title">
        <div className="section-header">
          <div className="section-title-row">
            <UserPlus size={22} className="section-icon" />
            <h2 id="new-arrivals-title">Nuevos Ingresos</h2>
          </div>
          <p className="section-desc">Los últimos prospectos en la lista "En la Mira"</p>
        </div>

        {loadingNew ? (
          <div className="card-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : newArrivals && newArrivals.length > 0 ? (
          <div className="arrivals-list">
            {newArrivals.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={{ ...prospect, avg_rating: null, rating_count: 0 }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <UserPlus size={32} />
            <p>No hay nuevos prospectos todavía</p>
          </div>
        )}
      </section>

      <style>{`
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .home-section {
        }

        .section-header {
          margin-bottom: 1.25rem;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.25rem;
        }

        .section-icon {
          color: var(--color-accent);
        }

        .section-header h2 {
          font-size: 1.375rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .section-desc {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          padding-left: 2.1rem;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .scroll-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .arrivals-list {
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

        @media (max-width: 640px) {
          .card-grid,
          .scroll-grid,
          .arrivals-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
