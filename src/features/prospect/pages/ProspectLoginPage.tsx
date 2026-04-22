import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function ProspectLoginPage() {
  const navigate = useNavigate()

  return (
    <div className="prospect-page">
      <div className="prospect-container animate-fade-in">
        <div className="brand-section">
          <div className="brand-icon">
            <Sparkles size={40} strokeWidth={1.5} />
          </div>
          <h1>Talent Pool</h1>
          <p className="subtitle">
            Postulate como freelance para trabajar con nuestra agencia creativa.
          </p>
        </div>

        <button
          onClick={() => navigate('/seleccion-equipo')}
          className="btn btn-primary btn-lg"
          id="start-application-btn"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Quiero postularme
          <ArrowRight size={18} />
        </button>

        <div className="login-footer">
          <a href="/joyer/login" className="footer-link" id="joyer-login-link">
            Acceso para el equipo →
          </a>
        </div>
      </div>

      <style>{`
        .prospect-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(ellipse at top, rgba(223, 255, 0, 0.03) 0%, transparent 50%),
                      var(--color-bg-primary);
        }

        .prospect-container {
          width: 100%;
          max-width: 420px;
          text-align: center;
        }

        .brand-section {
          margin-bottom: 2rem;
        }

        .brand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          margin-bottom: 1.5rem;
        }

        .prospect-container h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .login-footer {
          margin-top: 3rem;
        }

        .footer-link {
          color: var(--color-text-muted);
          font-size: 0.8125rem;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-link:hover {
          color: var(--color-accent);
        }
      `}</style>
    </div>
  )
}
