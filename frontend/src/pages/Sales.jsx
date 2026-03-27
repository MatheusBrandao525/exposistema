import React, { useState, useEffect } from 'react'
import { Search, Filter, BarChart3, Users, Tags, ArrowUpRight, Download, Calendar, Wallet, CreditCard, Banknote } from 'lucide-react'

const StatCard = ({ title, value, icon, trend }) => (
  <div className="glass p-24 flex gap-24 align-center animate-fade">
    <div className="stat-icon-circle bg-amber-soft color-primary">{icon}</div>
    <div className="stat-info">
      <span className="text-muted text-xs uppercase font-bold tracking-wider">{title}</span>
      <h4 className="text-3xl font-extrabold mt-4">{value}</h4>
      <div className="text-xs color-success font-bold mt-6">+ {trend} de performance</div>
    </div>
    <style>{`
      .bg-amber-soft { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.1); }
      .stat-icon-circle { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; transform: rotate(-5deg); transition: 0.3s; }
      .stat-icon-circle:hover { transform: rotate(0deg) scale(1.1); }
      .tracking-wider { letter-spacing: 0.05em; }
      .text-3xl { font-size: 28px; }
      .mt-6 { margin-top: 6px; }
    `}</style>
  </div>
)

const Sales = () => {
  const [sales, setSales] = useState([])
  const [sellers, setSellers] = useState([])
  const [types, setTypes] = useState([])
  const [filters, setFilters] = useState({ seller: 'all', category: 'all', search: '' })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [salesRes, usersRes, typesRes] = await Promise.all([
        fetch('http://localhost:8000/api/sales').then(r => r.json()),
        fetch('http://localhost:8000/api/users').then(r => r.json()),
        fetch('http://localhost:8000/api/types').then(r => r.json())
      ])
      setSales(salesRes)
      setSellers(usersRes)
      setTypes(typesRes)
    } catch (err) {
      console.error("Erro ao carregar dados financeiros", err)
    }
  }

  const filteredSales = sales.filter(s => {
    const matchSeller = filters.seller === 'all' || s.seller_name === filters.seller
    const matchCategory = filters.category === 'all' || s.item_types.includes(filters.category)
    const matchSearch = s.client_name.toLowerCase().includes(filters.search.toLowerCase())
    return matchSeller && matchCategory && matchSearch
  })

  const totalRevenue = sales.reduce((acc, s) => acc + parseFloat(s.total_price), 0)
  const averageSale = sales.length > 0 ? (totalRevenue / sales.length) : 0

  const getPaymentIcon = (method) => {
    if (method?.toLowerCase().includes('cartão')) return <CreditCard size={14} />
    if (method?.toLowerCase().includes('pix')) return <ArrowUpRight size={14} />
    return <Banknote size={14} />
  }

  return (
    <div className="financial-dashboard animate-fade pb-80">
      <header className="page-header flex justify-between align-center mb-60 mt-20">
        <div className="info">
          <h1 className="text-4xl font-extrabold mb-12">Gestão Financeira</h1>
          <p className="color-muted text-lg max-w-lg">Fluxo de caixa, recebíveis e controle de contratos em tempo real.</p>
        </div>
        <div className="actions flex gap-12">
          <button className="btn btn-secondary"><Calendar size={18} strokeWidth={2.5}/> Mensal</button>
          <button className="btn btn-primary"><Download size={18} strokeWidth={2.5} /> Exportar Balanço</button>
        </div>
      </header>

      {/* Financial KPIs */}
      <div className="grid-auto gap-24 mb-60">
        <StatCard title="Receita Prevista" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)} icon={<BarChart3 size={32} strokeWidth={2.5}/>} trend="12.5%" />
        <StatCard title="Volume de Contratos" value={sales.length} icon={<Wallet size={32} strokeWidth={2.5}/>} trend="8%" />
        <StatCard title="Ticket Médio" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageSale)} icon={<ArrowUpRight size={32} strokeWidth={2.5}/>} trend="5.2%" />
        <StatCard title="Liquidez Atual" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue * 0.7)} icon={<Users size={32} strokeWidth={2.5}/>} trend="Pago" />
      </div>

      {/* Advanced Filters Overlay */}
      <div className="glass p-32 mb-60 flex flex-wrap gap-40 align-center justify-between">
        <div className="search-group flex align-center gap-24 border rounded-20 px-24 py-16 flex-1">
          <Search size={26} className="color-muted" strokeWidth={2.5} />
          <input 
            className="clean-input-finance" 
            placeholder="Pesquise o cliente ou número da venda..." 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="flex gap-20">
           <select 
              className="premium-select" 
              value={filters.seller}
              onChange={(e) => setFilters({...filters, seller: e.target.value})}
            >
              <option value="all">Vendedor: Todos</option>
              {sellers.map(sel => <option key={sel.id} value={sel.name}>{sel.name}</option>)}
            </select>
            <select 
              className="premium-select"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">Categoria: Todas</option>
              {types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
        </div>
      </div>

      {/* Unified Sales & Cashflow Table */}
      <div className="glass overflow-hidden container-table mb-80">
        <table className="premium-table-finance w-full">
          <thead>
            <tr>
              <th className="pl-48 col-id">Emissão / ID</th>
              <th className="col-client">CLIENTE / ITENS</th>
              <th className="col-seller">VENDEDOR</th>
              <th className="col-value">VALOR TOTAL</th>
              <th className="col-method">FORMA</th>
              <th className="col-status">STATUS</th>
              <th className="text-right pr-48 col-actions">AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id} className="row-hover">
                <td className="pl-40">
                   <div className="flex-column">
                      <span className="font-bold text-sm">{new Date(sale.purchase_date || sale.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className="text-xs color-muted font-bold tracking-tighter">#ORD-{sale.id}</span>
                   </div>
                </td>
                <td>
                  <div className="flex-column">
                    <span className="font-bold text-white text-sm">{sale.client_name}</span>
                    <div className="flex gap-4 mt-4">
                       {sale.item_types.map(t => <span key={t} className="tiny-tag">{t}</span>)}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-sm font-medium color-muted">{sale.seller_name}</span>
                </td>
                <td>
                  <span className="font-extrabold text-base color-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_price)}
                  </span>
                </td>
                <td>
                   <div className="flex align-center gap-8 text-xs font-bold color-muted border px-10 py-4 rounded-8 w-fit bg-alpha-10">
                      {getPaymentIcon(sale.payment_method)}
                      {sale.payment_method || 'A definir'}
                   </div>
                </td>
                <td>
                  <span className={`finance-badge ${sale.status}`}>
                    {sale.status === 'paid' ? 'Liquidado' : sale.status === 'pending' ? 'Em aberto' : 'Cancelado'}
                  </span>
                </td>
                <td className="text-right pr-40">
                  <button className="action-button-finance"><ArrowUpRight size={18} strokeWidth={2.5}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .financial-dashboard { width: 100%; max-width: 1400px; margin: 0 auto; }
        .text-4xl { font-size: 36px; }
        .text-base { font-size: 16px; }
        .flex { display: flex; }
        .flex-1 { flex: 1; }
        .flex-column { display: flex; flex-direction: column; }
        .align-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-16 { gap: 16px; }
        .gap-24 { gap: 24px; }
        .mr-12 { margin-right: 12px; }
        .mb-60 { margin-bottom: 60px; }
        .pb-80 { padding-bottom: 80px; }
        
        .stat-icon-circle { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; transform: rotate(-5deg); transition: 0.3s; }
        .stat-info { display: flex; flex-direction: column; gap: 4px; }
        
        .clean-input-finance { border: none; background: transparent; color: white; width: 100%; font-size: 18px; outline: none; }
        .premium-select { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 16px; padding: 14px 24px; color: white; font-size: 14px; font-weight: 600; outline: none; cursor: pointer; transition: 0.2s; }
        .premium-select:hover { border-color: var(--primary); }

        /* Perfect Column Distribution */
        .col-id { width: 15%; padding-left: 48px !important; }
        .col-client { width: 30%; }
        .col-seller { width: 15%; }
        .col-value { width: 15%; }
        .col-method { width: 12%; }
        .col-status { width: 13%; }
        .col-actions { width: 10%; padding-right: 48px !important; }
        
        .premium-table-finance th { background: rgba(255,255,255,0.01); text-align: left; padding: 28px 20px; font-size: 10px; color: var(--text-dim); text-transform: uppercase; font-weight: 800; letter-spacing: 0.22em; border-bottom: 1px solid var(--border); }
        .premium-table-finance td { padding: 36px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
        
        .pl-48 { padding-left: 48px !important; }
        .pr-48 { padding-right: 48px !important; }
        
        .tiny-tag { font-size: 9px; font-weight: 900; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; text-transform: uppercase; color: var(--text-muted); opacity: 0.7; }
        .bg-alpha-10 { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); }
        .rounded-16 { border-radius: 16px; }

        .finance-badge { font-size: 11px; font-weight: 800; padding: 8px 16px; border-radius: 100px; text-transform: uppercase; display: inline-block; }
        .finance-badge.paid { background: rgba(16, 185, 129, 0.08); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.15); }
        .finance-badge.pending { background: rgba(251, 191, 36, 0.08); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.15); }
        .finance-badge.cancelled { background: rgba(244, 63, 94, 0.08); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.15); }

        .action-button-finance { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .action-button-finance:hover { color: var(--primary); background: rgba(251, 191, 36, 0.1); border-color: var(--primary); transform: translateY(-3px) rotate(45deg); }
      `}</style>
    </div>
  )
}

export default Sales
