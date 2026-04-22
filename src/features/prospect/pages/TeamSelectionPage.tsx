import { useNavigate } from 'react-router-dom'
import { Palette, Users, Globe, Lock, ArrowLeft } from 'lucide-react'

const teams = [
  {
    id: 'creative',
    name: 'Equipo Creativo',
    description: 'Dirección de arte, diseño gráfico, ilustración, redacción creativa, edición de video y motion graphics.',
    icon: Palette,
    enabled: true,
  },
  {
    id: 'accounts',
    name: 'Equipo de Cuentas',
    description: 'Gestión de clientes, planificación estratégica y coordinación de proyectos.',
    icon: Users,
    enabled: false,
  },
  {
    id: 'digital',
    name: 'Equipo Digital',
    description: 'Redes sociales, contenido digital, community management y marketing online.',
    icon: Globe,
    enabled: false,
  },
]

export default function TeamSelectionPage() {
  const navigate = useNavigate()

  function handleSelect(teamId: string, enabled: boolean) {
    if (enabled) {
      navigate(`/postulacion?team=${teamId}`)
    }
  }

  return (
    <div className="team-page">
      <div className="team-container animate-fade-in">
        <button
          className="btn btn-ghost back-btn"
          onClick={() => navigate('/')}
          aria-label="Volver al inicio"
          id="back-to-login-btn"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="team-header">
          <h1>¿A qué equipo te gustaría unirte?</h1>
          <p className="subtitle">
            Seleccioná el área que mejor se ajusta a tu perfil profesional.
          </p>
        </div>

        <div className="team-grid">
          {teams.map((team, index) => {
            const Icon = team.icon
            return (
              <button
                key={team.id}
                className={`team-card glass-card ${team.enabled ? 'enabled' : 'disabled'}`}
                onClick={() => handleSelect(team.id, team.enabled)}
                disabled={!team.enabled}
                style={{ animationDelay: `${index * 0.1}s` }}
                aria-label={`${team.name}${team.enabled ? '' : ' - Próximamente'}`}
                id={`team-card-${team.id}`}
              >
                <div className="team-card-icon">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <h2>{team.name}</h2>
                <p>{team.description}</p>
                {!team.enabled && (
                  <div className="coming-soon-badge">
                    <Lock size={12} />
                    Próximamente
                  </div>
                )}
                {team.enabled && (
                  <div className="available-badge">
                    Postularse →
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        .team-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(ellipse at top, rgba(223, 255, 0, 0.03) 0%, transparent 50%),
                      var(--color-bg-primary);
        }

        .team-container {
          width: 100%;
          max-width: 800px;
        }

        .back-btn {
          margin-bottom: 1.5rem;
        }

        .team-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .team-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }

        .subtitle {
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .team-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1.5rem;
          cursor: pointer;
          border: none;
          font-family: inherit;
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .team-card.disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .team-card.disabled:hover {
          transform: none;
          background: var(--color-bg-glass);
        }

        .team-card-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          transition: all 0.3s ease;
        }

        .team-card.enabled:hover .team-card-icon {
          background: var(--color-accent);
          color: var(--color-bg-primary);
          box-shadow: var(--shadow-glow);
        }

        .team-card h2 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .team-card p {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          flex: 1;
        }

        .coming-soon-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          margin-top: 1.25rem;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .available-badge {
          margin-top: 1.25rem;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
