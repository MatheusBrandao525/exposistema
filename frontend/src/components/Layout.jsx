import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image, ShoppingCart, Users, DollarSign, Settings, LogOut, Menu, X } from 'lucide-react'

export const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false)
  const navigate = useNavigate()

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Espaços', icon: <Image size={20} />, path: '/spaces' },
    { name: 'Vendas', icon: <ShoppingCart size={20} />, path: '/sales' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/customers' },
    { name: 'Financeiro', icon: <DollarSign size={20} />, path: '/financial' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
  ]

  const handleLogout = () => {
    // Implement logic later
    navigate('/login')
  }

  return (
    <div className="layout-wrapper">
      {/* Mobile Header */}
      <header className="mobile-header glass">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
        <span className="logo">ExpoSistema</span>
        <div className="user-avatar" />
      </header>

      {/* Sidebar */}
      <aside className={`sidebar glass ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>ExpoS</h1>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
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
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-radius: 0 24px 24px 0;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-logo h1 {
          font-size: 24px;
          color: var(--primary);
          margin-bottom: 40px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }

        .nav-link:hover, .nav-link.active {
          color: var(--text-white);
          background: rgba(245, 158, 11, 0.1);
        }

        .nav-link.active {
          color: var(--primary);
          background: rgba(245, 158, 11, 0.15);
        }

        .nav-link.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

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
