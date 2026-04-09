import React, { useState, useEffect } from 'react'
import { Search, Filter, BarChart3, Users, Tags, ArrowUpRight, Download, Calendar, Wallet, CreditCard, Banknote, Printer, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

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
  const [selectedSale, setSelectedSale] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [salesRes, usersRes, typesRes] = await Promise.all([
        api.get('/sales').then(r => r.json()),
        api.get('/users').then(r => r.json()),
        api.get('/types').then(r => r.json())
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
                  <button 
                    className="action-button-finance" 
                    onClick={() => { setSelectedSale(sale); setShowDetail(true); }}
                  >
                    <ArrowUpRight size={18} strokeWidth={2.5}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AnimatePresence>
        {showDetail && selectedSale && (
          <div className="modal-overlay" onClick={() => setShowDetail(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-content glass"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header flex justify-between align-center p-32 border-bottom">
                <div className="flex align-center gap-12">
                   <div className="stat-icon-circle color-primary bg-amber-soft">
                      <FileText size={24} />
                   </div>
                   <div className="flex-column">
                      <h3 className="text-xl font-black">Detalhes do Contrato</h3>
                      <span className="text-xs color-muted font-bold tracking-widest uppercase">ORD-{selectedSale.id}</span>
                   </div>
                </div>
                <button className="close-btn" onClick={() => setShowDetail(false)}><X size={24}/></button>
              </div>

              <div className="modal-body p-48" id="printable-contract">
                <div className="print-only mb-40 text-center">
                   <h1 className="text-3xl font-black mb-10">EXPOSISTEMA 2026</h1>
                   <p className="text-sm color-muted">Comprovante de Reserva de Espaço Publicitário</p>
                </div>

                <div className="grid-2 gap-48 mb-40">
                   <div className="info-block">
                      <span className="label">CONTRATANTE</span>
                      <strong className="text-lg block mt-5">{selectedSale.client_name}</strong>
                      <span className="text-sm color-muted block mt-2">Documento: ---</span>
                   </div>
                   <div className="info-block text-right">
                      <span className="label">DATA DE EMISSÃO</span>
                      <strong className="text-lg block mt-5">{new Date(selectedSale.purchase_date || selectedSale.created_at).toLocaleDateString('pt-BR')}</strong>
                   </div>
                </div>

                <div className="receipt-box mb-40">
                   <table className="w-full">
                      <thead>
                         <tr>
                            <th className="text-left py-10 color-muted text-xs uppercase font-black">Descrição do Item</th>
                            <th className="text-right py-10 color-muted text-xs uppercase font-black">Valor Unitário</th>
                         </tr>
                      </thead>
                      <tbody>
                         {selectedSale.item_types.map((type, idx) => (
                            <tr key={idx} className="border-bottom-soft">
                               <td className="py-16">
                                  <strong className="text-white text-md">Espaço Publicitário: {type}</strong>
                               </td>
                               <td className="py-16 text-right">
                                  <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSale.total_price / selectedSale.item_types.length)}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="total-receipt-footer flex justify-between align-center p-32 glass border-amber">
                   <div className="flex-column">
                      <span className="label-amber">VALOR TOTAL DO CONTRATO</span>
                      <span className="text-xs opacity-50">Pagamento: {selectedSale.payment_method?.toUpperCase()}</span>
                   </div>
                   <h2 className="text-3xl font-black color-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSale.total_price)}
                   </h2>
                </div>

                <div className="print-only mt-80">
                   <div className="flex justify-between gap-60">
                      <div className="flex-1 border-top pt-10 text-center">
                         <span className="text-xs color-muted uppercase font-bold">Assinatura do Contratante</span>
                      </div>
                      <div className="flex-1 border-top pt-10 text-center">
                         <span className="text-xs color-muted uppercase font-bold">Assinatura do Vendedor</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="modal-footer p-32 border-top flex justify-between align-center">
                 <div className="flex align-center gap-12 text-sm color-muted">
                    <Users size={18} />
                    <span>Emissor: <strong>{selectedSale.seller_name}</strong></span>
                 </div>
                 <div className="flex gap-16">
                    <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>Fechar</button>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                       <Printer size={18} /> Imprimir Comprovante
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .modal-content { width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto; border-radius: 32px; box-shadow: 0 40px 100px rgba(0,0,0,0.5); border: 1px solid var(--border); }
        .border-bottom { border-bottom: 1px solid var(--border); }
        .border-top { border-top: 1px solid var(--border); }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
        .close-btn:hover { color: white; transform: rotate(90deg); }
        
        .label { font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; }
        .label-amber { font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .receipt-box { background: rgba(255,255,255,0.02); border-radius: 20px; padding: 24px 32px; border: 1px solid var(--border); }
        .border-bottom-soft { border-bottom: 1px solid rgba(255,255,255,0.03); }
        .border-amber { border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.05) !important; }
        
        .print-only { display: none; }
        
        @media print {
           body * { visibility: hidden; }
           #printable-contract, #printable-contract * { visibility: visible; }
           #printable-contract { position: fixed; left: 0; top: 0; width: 100%; padding: 40px; background: white !important; color: black !important; }
           #printable-contract .text-white { color: black !important; }
           #printable-contract .glass { background: white !important; border: 1px solid #ddd !important; }
           #printable-contract .color-primary { color: black !important; }
           #printable-contract .color-muted { color: #666 !important; }
           #printable-contract .label { color: #888 !important; }
           #printable-contract .tiny-tag { border: 1px solid #ddd !important; color: black !important; }
           #printable-contract .print-only { display: block; }
           #printable-contract .border-amber { border: 1px solid black !important; }
           .modal-footer { display: none !important; }
           .modal-header { display: none !important; }
           .modal-overlay { background: white !important; backdrop-filter: none !important; padding: 0 !important; }
        }

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
