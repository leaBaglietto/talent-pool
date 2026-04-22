import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PROFILE_TYPES } from '@/lib/types'
import type { ProfileType } from '@/lib/types'
import { ArrowLeft, Upload, X, FileText, Camera, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FormErrors {
  full_name?: string
  profile_type?: string
  years_experience?: string
  portfolio_url?: string
  cv_file?: string
  photo_file?: string
  email?: string
}

export default function ApplicationFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const team = searchParams.get('team') || 'creative'

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileType, setProfileType] = useState<ProfileType | ''>('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [authUser, setAuthUser] = useState<{ id: string; email: string, isAnonymous: boolean } | null>(null)
  const [sent, setSent] = useState(false)

  const cvInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!fullName.trim()) newErrors.full_name = 'Este campo es obligatorio'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Ingresá un email válido'
    if (!profileType) newErrors.profile_type = 'Seleccioná una especialidad'
    if (!yearsExperience || parseInt(yearsExperience) < 0) {
      newErrors.years_experience = 'Ingresá un número válido (0 o más)'
    }
    if (portfolioUrl && !/^https?:\/\/.+\..+/.test(portfolioUrl)) {
      newErrors.portfolio_url = 'Ingresá una URL válida (ej: https://...)'
    }
    if (!cvFile) newErrors.cv_file = 'El CV es obligatorio'
    else if (cvFile.size > 5 * 1024 * 1024) newErrors.cv_file = 'El archivo no puede superar 5 MB'
    else if (cvFile.type !== 'application/pdf') newErrors.cv_file = 'Solo se aceptan archivos PDF'

    if (!photoFile) newErrors.photo_file = 'La foto es obligatoria'
    else if (photoFile.size > 2 * 1024 * 1024) newErrors.photo_file = 'La imagen no puede superar 2 MB'
    else if (!['image/jpeg', 'image/png'].includes(photoFile.type)) {
      newErrors.photo_file = 'Solo se aceptan imágenes JPG o PNG'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Cargar usuario real autenticado apenas entra a la página
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthUser({ id: data.user.id, email: data.user.email || '', isAnonymous: data.user.is_anonymous || false })
        if (data.user.email) setEmail(data.user.email)
      }
    })
  }, [])

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      let prospectId = authUser?.id
      let currentEmail = email.trim()

      if (!authUser) {
        // Create anonymous session
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) throw new Error('Error al iniciar sesión anónima: ' + anonError.message)
        prospectId = anonData.user?.id
        
        if (!prospectId) throw new Error('No se pudo crear la sesión') // Failsafe
        
        setAuthUser({ id: prospectId, email: currentEmail, isAnonymous: true })
      } else if (!authUser.isAnonymous && authUser.email) {
        currentEmail = authUser.email
      }

      // Upload CV
      let cvUrl = ''
      if (cvFile) {
        const cvPath = `${prospectId}/cv_${Date.now()}.pdf`
        const { error: cvError } = await supabase.storage
          .from('cvs')
          .upload(cvPath, cvFile, { upsert: true })
        if (cvError) throw new Error('Error al subir el CV: ' + cvError.message)
        cvUrl = cvPath
      }

      // Upload Photo
      let photoUrl = ''
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const photoPath = `${prospectId}/photo_${Date.now()}.${ext}`
        const { error: photoError } = await supabase.storage
          .from('avatars')
          .upload(photoPath, photoFile, { upsert: true })
        if (photoError) throw new Error('Error al subir la foto: ' + photoError.message)
        photoUrl = photoPath
      }

      // Insert prospect
      const { error: insertError } = await supabase
        .from('prospects')
        .upsert({
          id: prospectId,
          email: currentEmail,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          team,
          profile_type: profileType as ProfileType,
          years_experience: parseInt(yearsExperience),
          portfolio_url: portfolioUrl.trim() || null,
          cv_url: cvUrl,
          photo_url: photoUrl,
          status: 'pending',
        }, {
          onConflict: 'email',
        })

      if (insertError) throw new Error('Error al guardar: ' + insertError.message)

      // Request email confirmation (upgrade user)
      const { error: updateError } = await supabase.auth.updateUser({
        email: currentEmail
      }, {
        emailRedirectTo: `${window.location.origin}/confirmacion`
      })

      if (updateError) throw new Error('Error enviando el correo de confirmación: ' + updateError.message)

      toast.success('¡Postulación enviada a tu email!')
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="form-page">
        <div className="form-container animate-scale-in" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-accent)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle size={64} strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>¡Verificá tu email!</h1>
          <p className="subtitle" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
            Te enviamos un link de validación a <strong>{email}</strong>.
            <br /><br />
            Por favor, hacé clic en ese link para confirmar tu cuenta y completar definitivamente tu postulación. Tu progreso está guardado de forma segura.
          </p>
        </div>
        <style>{`
          .form-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.5rem;
            background: radial-gradient(ellipse at top, rgba(223, 255, 0, 0.03) 0%, transparent 50%), var(--color-bg-primary);
          }
          .form-container { width: 100%; max-width: 480px; }
          .subtitle { color: var(--color-text-secondary); }
        `}</style>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-container animate-fade-in">
        <button
          className="btn btn-ghost back-btn"
          onClick={() => navigate('/seleccion-equipo')}
          id="back-to-teams-btn"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="form-header">
          <span className="badge badge-accent">Equipo Creativo</span>
          <h1>Formulario de Postulación</h1>
          <p className="subtitle">
            Completá todos los campos obligatorios (*) para enviar tu postulación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="application-form" noValidate>
          {/* Name */}
          <div className="field-group">
            <label htmlFor="full-name" className="input-label">Nombre y Apellido *</label>
            <input
              id="full-name"
              type="text"
              className={`input-field ${errors.full_name ? 'input-error' : ''}`}
              placeholder="Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
            />
            {errors.full_name && <p className="error-text">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div className="field-group">
            <label htmlFor="email" className="input-label">Email *</label>
            <input
              id="email"
              type="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting || (authUser ? !authUser.isAnonymous : false)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="field-group">
            <label htmlFor="phone" className="input-label">Teléfono (con código de área)</label>
            <input
              id="phone"
              type="tel"
              className="input-field"
              placeholder="+54 11 1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Profile Type */}
          <div className="field-group">
            <label htmlFor="profile-type" className="input-label">Perfil / Especialidad *</label>
            <select
              id="profile-type"
              className={`input-field ${errors.profile_type ? 'input-error' : ''}`}
              value={profileType}
              onChange={(e) => setProfileType(e.target.value as ProfileType)}
              disabled={submitting}
            >
              <option value="">Seleccioná tu especialidad</option>
              {PROFILE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.profile_type && <p className="error-text">{errors.profile_type}</p>}
          </div>

          {/* Years Experience */}
          <div className="field-group">
            <label htmlFor="years-exp" className="input-label">Años de experiencia *</label>
            <input
              id="years-exp"
              type="number"
              className={`input-field ${errors.years_experience ? 'input-error' : ''}`}
              placeholder="0"
              min="0"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              disabled={submitting}
            />
            {errors.years_experience && <p className="error-text">{errors.years_experience}</p>}
          </div>

          {/* Portfolio URL */}
          <div className="field-group">
            <label htmlFor="portfolio-url" className="input-label">Link al Portfolio</label>
            <input
              id="portfolio-url"
              type="url"
              className={`input-field ${errors.portfolio_url ? 'input-error' : ''}`}
              placeholder="https://behance.net/tu-perfil"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              disabled={submitting}
            />
            {errors.portfolio_url && <p className="error-text">{errors.portfolio_url}</p>}
          </div>

          {/* CV Upload */}
          <div className="field-group">
            <label className="input-label">CV (PDF, máx. 5 MB) *</label>
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf"
              className="hidden-input"
              onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              id="cv-upload-input"
            />
            {cvFile ? (
              <div className="file-preview">
                <FileText size={20} />
                <span className="file-name">{cvFile.name}</span>
                <button type="button" className="remove-file" onClick={() => { setCvFile(null); if (cvInputRef.current) cvInputRef.current.value = '' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="upload-area"
                onClick={() => cvInputRef.current?.click()}
                id="cv-upload-btn"
              >
                <Upload size={24} />
                <span>Click para subir tu CV</span>
              </button>
            )}
            {errors.cv_file && <p className="error-text">{errors.cv_file}</p>}
          </div>

          {/* Photo Upload */}
          <div className="field-group">
            <label className="input-label">Foto de perfil (JPG/PNG, máx. 2 MB) *</label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden-input"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              id="photo-upload-input"
            />
            {photoPreview ? (
              <div className="photo-preview-container">
                <img src={photoPreview} alt="Preview de foto" className="photo-preview" />
                <button type="button" className="remove-file photo-remove" onClick={() => { handlePhotoChange(null); if (photoInputRef.current) photoInputRef.current.value = '' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="upload-area photo-upload"
                onClick={() => photoInputRef.current?.click()}
                id="photo-upload-btn"
              >
                <Camera size={24} />
                <span>Click para subir tu foto</span>
              </button>
            )}
            {errors.photo_file && <p className="error-text">{errors.photo_file}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg submit-btn"
            disabled={submitting}
            id="submit-application-btn"
          >
            {submitting ? 'Enviando postulación...' : 'Enviar postulación'}
          </button>
        </form>
      </div>

      <style>{`
        .form-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: radial-gradient(ellipse at top, rgba(223, 255, 0, 0.03) 0%, transparent 50%),
                      var(--color-bg-primary);
        }

        .form-container {
          width: 100%;
          max-width: 560px;
        }

        .back-btn {
          margin-bottom: 1rem;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .application-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
        }

        .hidden-input {
          display: none;
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem;
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-bg-input);
          color: var(--color-text-muted);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .upload-area:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background: var(--color-accent-dim);
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
        }

        .file-name {
          flex: 1;
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-file {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .remove-file:hover {
          color: var(--color-danger);
          background: var(--color-danger-bg);
        }

        .photo-upload {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          padding: 1rem;
        }

        .photo-preview-container {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .photo-preview {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid var(--color-border);
        }

        .photo-remove {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--color-bg-card) !important;
          border: 1px solid var(--color-border) !important;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit-btn {
          width: 100%;
          margin-top: 1rem;
          margin-bottom: 2rem;
        }

        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        select.input-field option {
          background: var(--color-bg-card);
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  )
}
