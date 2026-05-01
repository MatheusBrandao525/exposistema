import React, { useState, useEffect } from 'react'
import { Search, Filter, BarChart3, Users, Tags, ArrowUpRight, Download, Calendar, Wallet, CreditCard, Banknote, Printer, FileText, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const StatCard = ({ title, value, icon, trend, isHighlight }) => (
  <div className={`premium-card stat-card ${isHighlight ? 'highlighted' : ''} animate-fade`}>
    <div className="stat-card-content">
      <div className="stat-header">
        <div className="stat-icon-wrapper">
          {icon}
        </div>
        <div className="stat-trend">
          <span className="trend-badge">{trend}</span>
        </div>
      </div>
      <div className="stat-body">
        <span className="stat-label">{title}</span>
        <h4 className="stat-value">{value}</h4>
      </div>
    </div>
    <div className="card-bg-glow"></div>
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

  const handlePrintReceipt = (sale) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const itemsHtml = sale.item_types.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">
        <span style="color: #444; font-weight: 500;">Espaço / Categoria: <strong>${item}</strong></span>
        <span style="font-weight: 700; color: #000;">1 UN</span>
      </div>
    `).join('');

    const statusLabel = sale.status === 'paid' ? 'LIQUIDADO' : 'PENDENTE';
    const statusColor = sale.status === 'paid' ? '#10b981' : '#f59e0b';
    const statusBg = sale.status === 'paid' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprovante de Venda - ${sale.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; color: #1a1a1a; line-height: 1.5; background: #fff; }
          .container { max-width: 700px; margin: 0 auto; border: 1px solid #eaeaea; padding: 40px; border-radius: 12px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #000; padding-bottom: 25px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
          .header p { margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; }
          .id-badge { background: #000; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 800; }
          
          .section-title { font-size: 11px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .data-item label { display: block; font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; margin-bottom: 4px; }
          .data-item span { font-size: 15px; font-weight: 700; display: block; }
          
          .items-list { margin-bottom: 40px; }
          
          .total-box { background: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #efefef; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
          .total-label { font-size: 14px; font-weight: 800; color: #444; }
          .total-value { font-size: 32px; font-weight: 900; color: #000; }
          
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 900; color: ${statusColor}; background: ${statusBg}; border: 1px solid ${statusColor}33; }
          
          .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-end; }
          .vendedor-info h4 { margin: 0; font-size: 13px; font-weight: 800; }
          .vendedor-info p { margin: 2px 0 0; font-size: 11px; color: #888; }
          .timestamp { font-size: 10px; color: #bbb; text-align: right; font-weight: 600; }
          
          @media print {
            body { padding: 0; }
            .container { border: none; padding: 0; width: 100%; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div className="header">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img src="/logo.png" style="height: 80px; width: auto;" />
              <div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 900;">EXPOVALE APRF</h1>
                <p style="margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase;">Comprovante de Operação Financeira</p>
              </div>
            </div>
            <div class="id-badge">Controle #${sale.id.toString().padStart(4, '0')}</div>
          </div>

          <div class="section-title">Informações do Contratante</div>
          <div class="data-grid">
            <div class="data-item">
              <label>Cliente</label>
              <span>${sale.client_name}</span>
            </div>
            <div class="data-item">
              <label>Tipo de Registro</label>
              <span>${sale.company || 'Investidor Individual'}</span>
            </div>
            <div class="data-item">
              <label>Data Transação</label>
              <span>${new Date(sale.purchase_date || sale.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="data-item">
              <label>Meio de Pagamento</label>
              <span>${sale.payment_method || 'PIX'}</span>
            </div>
          </div>

          <div class="section-title">Detalhamento dos Itens</div>
          <div class="items-list">
            ${itemsHtml}
          </div>

          <div class="total-box">
            <div>
              <span class="total-label">VALOR TOTAL DO CONTRATO</span>
              <div style="margin-top: 8px;">
                <span class="status-badge">${statusLabel}</span>
              </div>
            </div>
            <span class="total-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_price)}</span>
          </div>

          <div class="footer">
            <div class="vendedor-info">
              <h4>Responsável: ${sale.seller_name}</h4>
              <p>Documento gerado automaticamente pelo sistema de gestão.</p>
            </div>
            <div class="timestamp">
              EMITIDO EM: ${new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              // window.close(); // Opcional: fechar após imprimir
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredSales = sales.filter(s => {
    const matchSeller = filters.seller === 'all' || s.seller_name === filters.seller
    const matchCategory = filters.category === 'all' || s.item_types.includes(filters.category)
    const matchSearch = s.client_name.toLowerCase().includes(filters.search.toLowerCase())
    return matchSeller && matchCategory && matchSearch
  })

  const validSales = sales.filter(s => s.status === 'paid' || s.status === 'pending');
  const totalRevenue = validSales.reduce((acc, s) => acc + parseFloat(s.total_price), 0);
  const averageSale = validSales.length > 0 ? (totalRevenue / validSales.length) : 0;
  const totalVolume = validSales.length;
  const getPaymentIcon = (method) => {
    if (method?.toLowerCase().includes('cartão')) return <CreditCard size={14} />
    if (method?.toLowerCase().includes('pix')) return <ArrowUpRight size={14} />
    return <Banknote size={14} />
  }

  return (
    <div className="premium-dashboard">
      <div className="dashboard-noise"></div>
      
      <header className="premium-header mb-60">
        <div className="header-info">
          <h1 className="header-title">Fluxo Financeiro</h1>
          <p className="header-subtitle">Performance analítica e controle de liquidez em tempo real.</p>
        </div>
        <div className="header-actions">
          <button className="premium-btn btn-glass">
            <Calendar size={18} />
            <span>Mensal</span>
          </button>
          <button className="premium-btn btn-gold" onClick={() => sales.length > 0 && handlePrintReceipt(sales[0])}>
            <Download size={18} />
            <span>Exportar Balanço</span>
          </button>
        </div>
      </header>

      {/* Financial KPIs */}
      <div className="premium-grid-stats mb-60">
        <StatCard 
          isHighlight={true}
          title="Receita Prevista" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)} 
          icon={<BarChart3 size={24} />} 
          trend="+12.5%" 
        />
        <StatCard 
          title="Volume de Contratos" 
          value={totalVolume} 
          icon={<Wallet size={24} />} 
          trend="+8%" 
        />
        <StatCard 
          title="Ticket Médio" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageSale)} 
          icon={<ArrowUpRight size={24} />} 
          trend="+5.2%" 
        />
        <StatCard 
          title="Liquidez Real" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue * 0.7)} 
          icon={<Users size={24} />} 
          trend="Equilibrado" 
        />
      </div>

      {/* Filter System */}
      <div className="filter-wrapper glass mb-40">
        <div className="search-box">
          <Search size={20} className="icon-muted" />
          <input 
            type="text"
            className="search-input" 
            placeholder="Pesquisar registros..." 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="select-group">
          <div className="select-control">
            <select 
              value={filters.seller}
              onChange={(e) => setFilters({...filters, seller: e.target.value})}
            >
              <option value="all">Filtro: Vendedores</option>
              {sellers.map(sel => <option key={sel.id} value={sel.name}>{sel.name}</option>)}
            </select>
            <ChevronRight size={14} className="chevron" />
          </div>
          <div className="select-control">
             <select 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">Filtro: Categorias</option>
              {types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <ChevronRight size={14} className="chevron" />
          </div>
        </div>
      </div>

      {/* Premium Table */}
      <div className="table-container-premium glass">
        <table className="premium-table">
          <thead>
            <tr>
              <th className="col-id">ID / Emissão</th>
              <th className="col-client">Contratante</th>
              <th className="col-seller">Emissor</th>
              <th className="col-value">Valor Transação</th>
              <th className="col-method">Pagamento</th>
              <th className="col-status">Status</th>
              <th className="col-actions text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id} className="premium-row" onClick={() => { setSelectedSale(sale); setShowDetail(true); }}>
                <td className="cell-id">
                   <span className="id-tag">#ORD-{sale.id}</span>
                   <span className="date-sub">{new Date(sale.purchase_date || sale.created_at).toLocaleDateString('pt-BR')}</span>
                </td>
                <td className="cell-client">
                   <div className="client-info">
                      <span className="client-name">{sale.client_name}</span>
                      <div className="client-tags">
                         {sale.item_types.map(t => <span key={t} className="item-badge">{t}</span>)}
                      </div>
                   </div>
                </td>
                <td className="cell-seller">
                  <span className="seller-name">{sale.seller_name}</span>
                </td>
                <td className="cell-value">
                  <span className="value-label">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_price)}
                  </span>
                </td>
                <td className="cell-method">
                   <div className="payment-chip">
                      {getPaymentIcon(sale.payment_method)}
                      <span>{sale.payment_method || 'PIX'}</span>
                   </div>
                </td>
                <td className="cell-status">
                  <span className={`status-badge-premium ${sale.status}`}>
                    {sale.status === 'paid' ? 'Liquidado' : sale.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </span>
                </td>
                <td className="cell-actions text-right">
                  <button className="action-btn-minimal">
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AnimatePresence>
        {showDetail && selectedSale && (
          <div className="modal-overlay-premium" onClick={() => setShowDetail(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="modal-container-premium glass"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-top">
                <div className="modal-header-info">
                  <div className="modal-icon-gold">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="modal-title">Detalhamento Financeiro</h3>
                    <span className="modal-subtitle">Controle de Registro #{selectedSale.id.toString().padStart(4, '0')}</span>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setShowDetail(false)}><X size={20}/></button>
              </div>

              <div className="modal-body">
                <div className="stats-row-modal">
                   <div className="modal-stat-card">
                      <label>Status Operacional</label>
                      <div className={`status-badge-premium ${selectedSale.status}`}>
                        {selectedSale.status === 'paid' ? 'Liquidado' : 'Pendente'}
                      </div>
                   </div>
                   <div className="modal-stat-card">
                      <label>Data de Registro</label>
                      <div className="stat-val-modal">{new Date(selectedSale.purchase_date || selectedSale.created_at).toLocaleDateString('pt-BR')}</div>
                   </div>
                   <div className="modal-stat-card highlight">
                      <label>Valor de Contrato</label>
                      <div className="stat-val-modal-gold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSale.total_price)}</div>
                   </div>
                </div>

                <div className="modal-sections-grid">
                   <div className="modal-section glass">
                      <h4 className="section-label-minimal"><Users size={14} /> Dados do Contratante</h4>
                      <h3 className="client-title-modal">{selectedSale.client_name}</h3>
                      <p className="client-sub-modal">{selectedSale.company || 'Investidor Individual'}</p>
                   </div>
                   <div className="modal-section glass">
                      <h4 className="section-label-minimal"><Tags size={14} /> Estrutura de Aquisição</h4>
                      <div className="tags-flex-modal">
                         {selectedSale.item_types.map(t => (
                            <span key={t} className="tag-premium-sm">{t}</span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="finance-sheet glass">
                   <div className="sheet-row">
                      <span>Valor Original Transacionado</span>
                      <strong className="text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSale.total_price)}</strong>
                   </div>
                   <div className="sheet-row no-border">
                      <span>Gateway de Pagamento</span>
                      <div className="method-display">
                         {getPaymentIcon(selectedSale.payment_method)}
                         <strong>{selectedSale.payment_method || 'PIX'}</strong>
                      </div>
                   </div>
                </div>
              </div>

              <div className="modal-bottom">
                 <div className="footer-meta">
                    <span className="meta-label">Auditado por</span>
                    <span className="meta-val">{selectedSale.seller_name}</span>
                 </div>
                 <div className="footer-btns">
                    <button className="premium-btn btn-ghost" onClick={() => setShowDetail(false)}>Fechar Janela</button>
                    <button className="premium-btn btn-gold" onClick={() => handlePrintReceipt(selectedSale)}>
                       <Printer size={16} /> Imprimir Comprovante
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        :root {
          --bg-main: #06070a;
          --bg-card: rgba(13, 16, 23, 0.7);
          --bg-highlight: rgba(251, 191, 36, 0.05);
          --primary: #fbbf24;
          --primary-glow: rgba(251, 191, 36, 0.2);
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --text-dim: #64748b;
          --border: rgba(255, 255, 255, 0.06);
          --border-active: rgba(255, 255, 255, 0.12);
          --glass-bg: rgba(255, 255, 255, 0.02);
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --shadow-premium: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .premium-dashboard {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #0c0e14 0%, #06070a 100%);
          color: var(--text-main);
          font-family: 'Inter', -apple-system, sans-serif;
          padding: 40px;
          overflow-x: hidden;
        }

        .dashboard-noise {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.02;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1000;
        }

        .premium-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .header-subtitle {
          color: var(--text-muted);
          font-size: 16px;
          font-weight: 500;
        }
        .header-actions {
          display: flex;
          gap: 12px;
        }

        .premium-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border);
        }
        .btn-glass {
          background: var(--glass-bg);
          color: var(--text-main);
          backdrop-filter: blur(10px);
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--border-active);
          transform: translateY(-1px);
        }
        .btn-gold {
          background: var(--primary);
          color: #000;
          border: none;
        }
        .btn-gold:hover {
          background: #f59e0b;
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.2);
          transform: translateY(-1px);
        }
        .btn-ghost {
          background: transparent;
          border-color: transparent;
          color: var(--text-muted);
        }
        .btn-ghost:hover {
          color: var(--text-main);
          background: var(--glass-bg);
        }

        .premium-grid-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .premium-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          backdrop-filter: blur(20px);
        }
        .premium-card:hover {
          border-color: var(--border-active);
          transform: translateY(-4px);
          box-shadow: var(--shadow-premium);
        }
        .premium-card.highlighted {
          border-color: rgba(251, 191, 36, 0.2);
          background: linear-gradient(135deg, rgba(13, 16, 23, 0.8) 0%, rgba(251, 191, 36, 0.02) 100%);
        }
        .premium-card.highlighted .stat-value {
          color: var(--primary);
          text-shadow: 0 0 20px var(--primary-glow);
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          background: var(--glass-bg);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          border: 1px solid var(--border);
        }
        .trend-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--success);
          background: rgba(16, 185, 129, 0.08);
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid rgba(16, 185, 129, 0.1);
        }
        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .card-bg-glow {
          position: absolute;
          bottom: -50px; right: -50px;
          width: 150px; height: 150px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          opacity: 0.3;
          pointer-events: none;
        }

        .filter-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          backdrop-filter: blur(10px);
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .search-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 15px;
          font-weight: 500;
          width: 100%;
          outline: none;
        }
        .search-input::placeholder {
          color: var(--text-dim);
        }
        .select-group {
          display: flex;
          gap: 12px;
        }
        .select-control {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding-right: 12px;
          transition: 0.2s;
        }
        .select-control:hover {
          border-color: var(--border-active);
          background: rgba(255, 255, 255, 0.05);
        }
        .select-control select {
          appearance: none;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 10px 32px 10px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }
        .select-control .chevron {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%) rotate(90deg);
          color: var(--text-dim);
          pointer-events: none;
        }

        .table-container-premium {
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-premium);
        }
        .premium-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .premium-table th {
          padding: 20px 24px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.01);
        }
        .premium-row {
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .premium-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .premium-row:last-child {
          border-bottom: none;
        }
        .premium-row:nth-child(even) {
          background: rgba(255, 255, 255, 0.005);
        }
        .premium-table td {
          padding: 24px;
          vertical-align: middle;
        }

        .id-tag {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
          display: block;
          margin-bottom: 4px;
        }
        .date-sub {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-dim);
        }
        .client-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          display: block;
          margin-bottom: 6px;
        }
        .client-tags {
          display: flex;
          gap: 6px;
        }
        .item-badge {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .seller-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .value-label {
          font-size: 16px;
          font-weight: 800;
          color: var(--primary);
        }
        .payment-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          width: fit-content;
        }
        
        .status-badge-premium {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border: 1px solid transparent;
          display: inline-block;
        }
        .status-badge-premium.paid {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border-color: rgba(16, 185, 129, 0.15);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.05);
        }
        .status-badge-premium.pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          border-color: rgba(245, 158, 11, 0.15);
        }
        .status-badge-premium.cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border-color: rgba(239, 68, 68, 0.15);
        }

        .action-btn-minimal {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--glass-bg);
          border: 1px solid var(--border);
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
          margin-left: auto;
        }
        .action-btn-minimal:hover {
          color: var(--text-main);
          border-color: var(--border-active);
          background: rgba(255, 255, 255, 0.05);
          transform: rotate(45deg);
        }

        .modal-overlay-premium {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .modal-container-premium {
          width: 100%;
          max-width: 760px;
          background: #0b0d11;
          border-radius: 32px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-premium);
          overflow: hidden;
        }
        .modal-top {
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
        }
        .modal-header-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .modal-icon-gold {
          width: 52px;
          height: 52px;
          background: var(--primary);
          color: #000;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(251, 191, 36, 0.2);
        }
        .modal-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }
        .modal-subtitle {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .modal-close-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--glass-bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 0 32px 32px;
        }
        .stats-row-modal {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1.8fr;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 8px;
          margin-bottom: 32px;
          border: 1px solid var(--border);
        }
        .modal-stat-card {
           background: #0f1218;
           padding: 20px 24px;
           border-radius: 14px;
        }
        .modal-stat-card.highlight {
          background: rgba(251, 191, 36, 0.04);
        }
        .modal-stat-card label {
           font-size: 10px;
           font-weight: 800;
           color: var(--text-dim);
           text-transform: uppercase;
           letter-spacing: 0.08em;
           margin-bottom: 12px;
           display: block;
        }
        .stat-val-modal {
          font-size: 17px;
          font-weight: 700;
        }
        .stat-val-modal-gold {
          font-size: 22px;
          font-weight: 900;
          color: var(--primary);
        }

        .modal-sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .modal-section {
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--border);
        }
        .section-label-minimal {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .client-title-modal {
          font-size: 18px;
          font-weight: 700;
          margin: 16px 0 6px;
        }
        .client-sub-modal {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }
        .tags-flex-modal {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .tag-premium-sm {
          background: var(--glass-bg);
          border: 1px solid var(--border);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
        }

        .finance-sheet {
           border-radius: 20px;
           border: 1px solid var(--border);
           overflow: hidden;
        }
        .sheet-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
          color: var(--text-muted);
        }
        .sheet-row.no-border {
          border-bottom: none;
        }
        .method-display {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--primary);
        }

        .modal-bottom {
          padding: 24px 32px;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-meta {
          display: flex;
          flex-direction: column;
        }
        .meta-label {
          font-size: 9px;
          font-weight: 800;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .meta-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .footer-btns {
          display: flex;
          gap: 12px;
        }

        .print-view-hidden { display: none; }
        
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden !important; }
        }

        .glass {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
        }
        .animate-fade {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Sales
