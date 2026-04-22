import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'

export default function JoyerLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Completá email y contraseña')
      return
    }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) throw authError
      navigate('/joyer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="joyer-login-page">
      <div className="login-container animate-fade-in">
        <div className="brand-section">
          <div className="brand-icon">
            <Sparkles size={36} strokeWidth={1.5} />
          </div>
          <h1>Talent Pool</h1>
          <p className="subtitle">Dashboard interno — Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="joyer-email" className="input-label">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="joyer-email"
                type="email"
                className="input-field"
                placeholder="tu@agencia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="joyer-password" className="input-label">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="joyer-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="error-text" role="alert" style={{ textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            id="joyer-login-btn"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <a href="/" className="footer-link" id="prospect-portal-link">
            ← Portal de postulación
          </a>
        </div>
      </div>

      <style>{`
        .joyer-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(ellipse at top, rgba(223, 255, 0, 0.03) 0%, transparent 50%),
                      var(--color-bg-primary);
        }

        .login-container {
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .brand-section {
          margin-bottom: 2rem;
        }

        .brand-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          margin-bottom: 1.25rem;
        }

        .login-container h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.375rem;
        }

        .subtitle {
          color: var(--color-text-muted);
          font-size: 0.875rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          text-align: left;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 1rem;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .input-with-icon .input-field {
          padding-left: 2.75rem;
        }

        .login-form .btn-lg {
          width: 100%;
          margin-top: 0.5rem;
        }

        .login-footer {
          margin-top: 2rem;
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
