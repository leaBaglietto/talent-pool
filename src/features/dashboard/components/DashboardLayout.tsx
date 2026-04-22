import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthState } from '@/hooks/useAuthState'
import { supabase } from '@/lib/supabase'
import {
  Home,
  Eye,
  Star,
  XCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/joyer', end: true, icon: Home, label: 'Inicio' },
  { to: '/joyer/en-la-mira', end: false, icon: Eye, label: 'En la Mira' },
  { to: '/joyer/seleccionados', end: false, icon: Star, label: 'Seleccionados' },
  { to: '/joyer/rechazados', end: false, icon: XCircle, label: 'Rechazados' },
]

export default function DashboardLayout() {
  const { joyer } = useAuthState()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/joyer/login')
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Sparkles size={24} />
            <span>Talent Pool</span>
          </div>
          <button
            className="sidebar-close btn btn-ghost"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          {joyer && (
            <div className="user-info">
              <div className="user-avatar">
                {joyer.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{joyer.full_name}</span>
                <span className="user-role">{joyer.role}</span>
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost logout-btn"
            onClick={handleLogout}
            id="logout-btn"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="btn btn-ghost mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            id="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>
          <div className="header-greeting">
            {joyer && <span>Hola, <strong>{joyer.full_name.split(' ')[0]}</strong></span>}
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-overlay {
          display: none;
        }

        .sidebar-close {
          display: none;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-weight: 800;
          font-size: 1.125rem;
          color: var(--color-accent);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-primary);
        }

        .nav-item.active {
          background: var(--color-accent-dim);
          color: var(--color-accent);
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--color-border);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
          margin-bottom: 0.5rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-accent-dim);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: capitalize;
        }

        .logout-btn {
          width: 100%;
          justify-content: flex-start;
          padding: 0.625rem 1rem;
          color: var(--color-text-muted);
        }

        .logout-btn:hover {
          color: var(--color-danger) !important;
        }

        /* Main area */
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-primary);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .mobile-menu-btn {
          display: none;
        }

        .header-greeting {
          font-size: 0.9375rem;
          color: var(--color-text-secondary);
        }

        .header-greeting strong {
          color: var(--color-text-primary);
        }

        .dashboard-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }

          .sidebar-close {
            display: flex;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .dashboard-main {
            margin-left: 0;
          }

          .dashboard-content {
            padding: 1.25rem;
          }

          .dashboard-header {
            padding: 1rem 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}
