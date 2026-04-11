import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image, ShoppingCart, Users, DollarSign, Settings, LogOut, Menu, X } from 'lucide-react'

export const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false)
  const [eventName, setEventName] = React.useState('EXPOVALE')
  const navigate = useNavigate()

  React.useEffect(() => {
    fetch('http://localhost:8000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.event_name) setEventName(data.event_name)
      })
  }, [])

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={2.5} />, path: '/' },
    { name: 'Espaços', icon: <Image size={18} strokeWidth={2.5} />, path: '/spaces' },
    { name: 'Financeiro', icon: <DollarSign size={18} strokeWidth={2.5} />, path: '/sales' },
    { name: 'Vendedores', icon: <Users size={18} strokeWidth={2.5} />, path: '/sellers' },
    { name: 'Clientes', icon: <Users size={18} strokeWidth={2.5} />, path: '/customers' },
    { name: 'Configurações', icon: <Settings size={18} strokeWidth={2.5} />, path: '/settings' },
  ]

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="layout-wrapper">
      {/* Mobile Header */}
      <header className="mobile-header glass">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="logo-text">{eventName}</span>
        <div className="user-avatar" />
      </header>

      {/* Sidebar */}
      <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Expovale 2026" className="main-logo" />
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-icon-wrapper">{item.icon}</div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link logout" onClick={handleLogout}>
            <div className="nav-icon-wrapper"><LogOut size={18} strokeWidth={2.5} /></div>
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>

      <style>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          border-radius: 0;
          border-right: 1px solid var(--border);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
          padding: 10px;
        }

        .main-logo {
          width: 100%;
          max-width: 200px;
          height: auto;
          filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.1));
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.25s;
          font-weight: 500;
          font-size: 14px;
        }

        .nav-icon-wrapper {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.25s;
          color: var(--text-dim);
        }

        .nav-link:hover {
          color: var(--text-white);
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-link:hover .nav-icon-wrapper {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-white);
        }

        .nav-link.active {
          color: var(--primary);
          background: rgba(251, 191, 36, 0.08);
          font-weight: 600;
        }

        .nav-link.active .nav-icon-wrapper {
          background: rgba(251, 191, 36, 0.15);
          color: var(--primary);
        }

        .sidebar-footer {
          padding-top: 24px;
          border-top: 1px solid var(--border-muted);
        }

        .nav-link.logout:hover {
          background: rgba(244, 63, 94, 0.1);
          color: var(--error);
        }
        
        .nav-link.logout:hover .nav-icon-wrapper {
          background: rgba(244, 63, 94, 0.15);
          color: var(--error);
        }

        .logo-text { font-weight: 800; letter-spacing: 0.1em; font-size: 18px; }

        .content {
          flex: 1;
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .mobile-header {
          display: none;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 900;
          border-radius: 0 0 16px 16px;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -260px;
          }
          .sidebar.open {
            left: 0;
          }
          .mobile-header {
            display: flex;
          }
          .content {
            padding: 80px 20px 20px;
          }
        }
      `}</style>
    </div>
  )
}
