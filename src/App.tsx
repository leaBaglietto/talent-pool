import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthState } from '@/hooks/useAuthState'

// Prospect portal
import ProspectLoginPage from '@/features/prospect/pages/ProspectLoginPage'
import TeamSelectionPage from '@/features/prospect/pages/TeamSelectionPage'
import ApplicationFormPage from '@/features/prospect/pages/ApplicationFormPage'
import ConfirmationPage from '@/features/prospect/pages/ConfirmationPage'

// Joyer dashboard
import JoyerLoginPage from '@/features/dashboard/pages/JoyerLoginPage'
import DashboardLayout from '@/features/dashboard/components/DashboardLayout'
import HomePage from '@/features/dashboard/pages/HomePage'
import EnLaMiraPage from '@/features/dashboard/pages/EnLaMiraPage'
import SeleccionadosPage from '@/features/dashboard/pages/SeleccionadosPage'
import RechazadosPage from '@/features/dashboard/pages/RechazadosPage'
import ProspectDetailPage from '@/features/dashboard/pages/ProspectDetailPage'

function ProtectedJoyerRoute({ children }: { children: React.ReactNode }) {
  const { joyer, loading } = useAuthState()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="skeleton" style={{ width: '3rem', height: '3rem', borderRadius: '50%' }} />
      </div>
    )
  }

  if (!joyer) {
    return <Navigate to="/joyer/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Prospect Portal */}
      <Route path="/" element={<ProspectLoginPage />} />
      <Route path="/seleccion-equipo" element={<TeamSelectionPage />} />
      <Route path="/postulacion" element={<ApplicationFormPage />} />
      <Route path="/confirmacion" element={<ConfirmationPage />} />

      {/* Joyer Dashboard */}
      <Route path="/joyer/login" element={<JoyerLoginPage />} />
      <Route
        path="/joyer"
        element={
          <ProtectedJoyerRoute>
            <DashboardLayout />
          </ProtectedJoyerRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="en-la-mira" element={<EnLaMiraPage />} />
        <Route path="seleccionados" element={<SeleccionadosPage />} />
        <Route path="rechazados" element={<RechazadosPage />} />
        <Route path="prospecto/:id" element={<ProspectDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
