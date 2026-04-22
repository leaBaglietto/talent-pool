import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ConfirmationPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: authData }) => {
      // Si tenemos usuario y ya NO es anónimo (porque entró con el link de confirmación)
      if (authData.user && !authData.user.is_anonymous) {
        const { data: prospect } = await supabase
          .from('prospects')
          .select('status')
          .eq('id', authData.user.id)
          .single()

        if (prospect && prospect.status === 'pending') {
          await supabase
            .from('prospects')
            .update({ status: 'unassigned' })
            .eq('id', authData.user.id)
        }
      }
    })
  }, [])

  return (
    <div className="confirmation-page">
      <div className="confirmation-container animate-scale-in">
        <div className="success-circle">
          <CheckCircle size={72} strokeWidth={1.5} />
        </div>

        <h1>¡Postulación recibida!</h1>

        <p className="confirmation-text">
          Tu perfil fue enviado correctamente. Nuestro equipo lo revisará y se pondrá
          en contacto con vos a la brevedad.
        </p>

        <div className="next-steps">
          <h3>¿Qué sigue?</h3>
          <ul>
            <li>📋 Tu perfil será revisado por nuestro equipo</li>
            <li>📞 Un entrevistador se pondrá en contacto contigo</li>
            <li>⭐ Si sos seleccionado, ingresarás a nuestro pool de talentos</li>
          </ul>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/')}
          id="go-home-btn"
        >
          Volver al inicio
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .confirmation-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(ellipse at top, rgba(223, 255, 0, 0.06) 0%, transparent 50%),
                      var(--color-bg-primary);
        }

        .confirmation-container {
          text-align: center;
          max-width: 480px;
        }

        .success-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          margin-bottom: 2rem;
          position: relative;
        }

        .success-circle::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid var(--color-accent);
          opacity: 0.3;
          animation: pulse-ring 2s ease-in-out infinite;
        }

        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.1; }
        }

        .confirmation-container h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .confirmation-text {
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .next-steps {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .next-steps h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--color-accent);
        }

        .next-steps ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .next-steps li {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .confirmation-page .btn-lg {
          width: 100%;
        }
      `}</style>
    </div>
  )
}
