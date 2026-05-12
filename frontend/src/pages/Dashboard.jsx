import React, { useState, useEffect } from 'react'
import { TrendingUp, Package, Clock, CheckCircle2 } from 'lucide-react'
import api from '../api'

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="glass stat-card animate-fade">
    <div className="stat-header">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-trend">{trend}</div>
    </div>
    <div className="stat-body">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
    <style>{`
      .stat-card {
        padding: 24px;
        transition: transform 0.2s;
        min-width: 240px;
      }
      .stat-card:hover { transform: translateY(-4px); }
      .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
      .stat-icon { padding: 12px; border-radius: 12px; }
      .bg-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      .bg-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
      .bg-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      .bg-rose { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }
      .stat-body h3 { font-size: 14px; color: var(--text-muted); font-weight: 500; }
      .stat-body p { font-size: 28px; font-weight: 700; color: var(--text-white); margin-top: 4px; }
    `}</style>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_sales: 0,
    total_clients: 0,
    available_spaces: 0
  })
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          api.get('/stats'),
          api.get('/sales')
        ])
        
        const statsData = await statsRes.json()
        const salesData = await salesRes.json()
        
        const validSalesData = salesData.filter(s => s.status === 'paid' || s.status === 'pending')
        
        setStats(statsData)
        setRecentSales(validSalesData.slice(0, 5)) // Pegar as 5 últimas válidas
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="dashboard-content">
      <header className="page-header">
        <h1>Visão Geral</h1>
        <p>Bem-vindo ao dashboard do ExpoSistema.</p>
      </header>

      <section className="stats-grid">
        <StatCard 
          title="Total Vendido" 
          value={formatCurrency(stats.total_revenue)} 
          icon={<TrendingUp />} 
          color="bg-amber" 
          trend="Total Pago" 
        />
        <StatCard 
          title="Vendas Realizadas" 
          value={stats.total_sales} 
          icon={<Package />} 
          color="bg-blue" 
          trend="Total Geral" 
        />
        <StatCard 
          title="Clientes Cadastrados" 
          value={stats.total_clients} 
          icon={<Clock />} 
          color="bg-rose" 
          trend="Base Ativa" 
        />
        <StatCard 
          title="Espaços Disponíveis" 
          value={stats.available_spaces} 
          icon={<CheckCircle2 />} 
          color="bg-emerald" 
          trend="Prontos para Venda" 
        />
      </section>

      <section className="recent-activity">
        <h3>Vendas Recentes</h3>
        <div className="glass activity-table">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {(recentSales || []).map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.client_name}</td>
                  <td>
                    <span className={`badge ${sale.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {sale.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>{formatCurrency(sale.total_price)}</td>
                  <td>{new Date(sale.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {recentSales.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .dashboard-content { animation: fadeIn 0.4s ease; }
        .page-header { margin-bottom: 32px; }
        .page-header h1 { font-size: 32px; font-weight: 800; color: var(--text-white); }
        .page-header p { color: var(--text-muted); margin-top: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
        .recent-activity h3 { margin-bottom: 20px; font-size: 20px; font-weight: 700; color: var(--text-white); }
        .activity-table { padding: 8px; overflow-x: auto; }
        .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
        .custom-table th, .custom-table td { padding: 16px; border-bottom: 1px solid var(--border); }
        .custom-table th { color: var(--text-muted); font-weight: 500; font-size: 13px; }
        .badge { padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .badge-success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      `}</style>
    </div>
  )
}

export default Dashboard
