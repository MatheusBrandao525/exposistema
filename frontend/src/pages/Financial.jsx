import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  ArrowDownCircle,
  Clock,
  X,
  Printer,
  User,
  Building,
  ShoppingCart,
  LayoutGrid
} from 'lucide-react'
import api from '../api'
import * as XLSX from 'xlsx'

const FinancialStat = ({ title, value, icon, subtitle, colorClass }) => (
  <div className="glass stat-card-financial animate-fade">
    <div className={`icon-box ${colorClass}`}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="stat-title">{title}</span>
      <h2 className="stat-value">{value}</h2>
      <span className="stat-subtitle">{subtitle}</span>
    </div>
    <style>{`
      .stat-card-financial {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px;
        flex: 1;
        min-width: 280px;
      }
      .icon-box {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-box.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }
      .icon-box.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      .icon-box.rose { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
      .icon-box.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
      .stat-title { font-size: 14px; color: var(--text-muted); display: block; }
      .stat-value { font-size: 24px; font-weight: 800; color: white; margin: 4px 0; }
      .stat-subtitle { font-size: 12px; color: var(--text-dim); }
    `}</style>
  </div>
)

const Financial = () => {
  const [installments, setInstallments] = useState([])
  const [stats, setStats] = useState({
    total_paid: 0,
    total_pending: 0,
    total_overdue: 0,
    total_net_profit: 0
  })
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sellers, setSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    seller: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  })

  const [selectedSale, setSelectedSale] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleOpenSaleDetail = async (saleId) => {
    setShowDetail(true)
    setSelectedSale(null)
    try {
      const res = await api.get(`/sales/${saleId}`)
      const data = await res.json()
      if (data && !data.error) {
        setSelectedSale(data)
      } else {
        alert("Erro ao buscar detalhes da venda.")
        setShowDetail(false)
      }
    } catch (err) {
      alert("Erro de conexão ao buscar venda.")
      setShowDetail(false)
    }
  }

  const handlePrintReceipt = (saleData) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    const items = saleData.items || [];

    const itemsHtml = items.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="color: #444; font-weight: 500;"><strong>${item.item_name || 'Espaço / Categoria'}</strong></span>
          <span style="font-size: 11px; color: #888;">Serviço de Mídia & Reservas</span>
        </div>
        <div style="text-align: right;">
          <span style="font-weight: 700; color: #000; display: block;">${item.quantity || 1} UN</span>
          <span style="font-size: 11px; color: #666;">${formatCurrency(item.item_price)}</span>
        </div>
      </div>
    `).join('');

    const statusLabel = saleData.status === 'paid' ? 'LIQUIDADO' : 'PENDENTE';
    const statusColor = saleData.status === 'paid' ? '#10b981' : '#f59e0b';
    const statusBg = saleData.status === 'paid' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Venda - #${saleData.id}</title>
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
          
          .items-list { margin-bottom: 30px; }
          
          .total-box { background: #000; padding: 30px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; color: #fff; }
          .total-label { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
          .total-value { font-size: 36px; font-weight: 900; color: #fff; }
          
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 900; color: ${statusColor}; background: ${statusBg}; border: 1px solid ${statusColor}33; }
          
          .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-end; }
          .timestamp { font-size: 10px; color: #bbb; text-align: right; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900;">EXPOVALE APRF</h1>
              <div style="font-size: 11px; font-weight: 700; color: #666; margin-top: 2px;">CNPJ: 04.710.150/0001-40</div>
              <p style="margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase;">Comprovante de Operação Financeira</p>
            </div>
            <div class="id-badge">Controle #${saleData.id.toString().padStart(4, '0')}</div>
          </div>

          <div class="section-title">Informações do Contratante</div>
          <div class="data-grid">
            <div class="data-item">
              <label>Cliente</label>
              <span>${saleData.client_name}</span>
            </div>
            <div class="data-item">
              <label>Emissor / Vendedor</label>
              <span>${saleData.seller_name}</span>
            </div>
            <div class="data-item">
              <label>Data Transação</label>
              <span>${new Date(saleData.purchase_date || saleData.created_at || new Date()).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="data-item">
              <label>Meio de Pagamento</label>
              <span>${(saleData.payment_method || 'PIX').toUpperCase()}</span>
            </div>
          </div>

          <div class="section-title">Detalhamento dos Itens</div>
          <div class="items-list">
            ${itemsHtml}
          </div>

          <div class="total-box">
            <div>
              <span class="total-label">VALOR FINAL DO CONTRATO</span>
              <div style="margin-top: 8px;">
                <span class="status-badge">${statusLabel}</span>
              </div>
            </div>
            <span class="total-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleData.total_price)}</span>
          </div>

          <div class="footer">
            <div class="vendedor-info">
              <h4 style="margin:0;">Responsável Técnico: ${saleData.seller_name}</h4>
              <p style="margin:2px 0 0; font-size:11px; color:#888;">Documento gerado eletronicamente. Reservas sujeitas aos termos de contrato.</p>
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
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [instRes, statsRes, usersRes, typesRes] = await Promise.all([
        api.get('/financial'),
        api.get('/financial/stats'),
        api.get('/users'),
        api.get('/types')
      ])
      const instData = await instRes.json()
      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      const typesData = await typesRes.json()
      setInstallments(instData)
      setStats(statsData)
      setSellers(usersData || [])
      setCategories(typesData || [])
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      // 0. Buscar todas as vendas para um relatório mais completo
      const salesRes = await api.get('/sales')
      const salesData = await salesRes.json()

      // 1. Preparar os dados das parcelas
      const worksheetData = installments.map(inst => ({
        'ID Parcela': inst.id,
        'ID Venda': inst.sale_id,
        'Cliente': inst.client_name,
        'Empresa': inst.client_company || 'Pessoa Física',
        'Nº Parcela': inst.installment_number,
        'Vencimento': new Date(inst.due_date).toLocaleDateString('pt-BR'),
        'Valor Parcela (R$)': parseFloat(inst.amount),
        'Status': inst.status === 'paid' ? 'LIQUIDADO' : 
                  inst.status === 'cancelled' ? 'CANCELADO' : 
                  inst.status === 'refused' ? 'RECUSADO' : 
                  inst.status === 'expired' ? 'EXPIRADO' : 'PENDENTE',
        'Data de Pagamento': inst.paid_at ? new Date(inst.paid_at).toLocaleDateString('pt-BR') : '-'
      }))

      // 2. Preparar os dados das vendas (Consolidado)
      const formattedSalesData = salesData.map(sale => {
        const originalPrice = parseFloat(sale.original_price) || parseFloat(sale.total_price);
        const negotiatedPrice = parseFloat(sale.total_price);
        const discountValue = originalPrice - negotiatedPrice;
        const discountPercentage = originalPrice > 0 ? (discountValue / originalPrice) * 100 : 0;

        return {
          'ID Venda': sale.id,
          'Data': new Date(sale.purchase_date || sale.created_at).toLocaleDateString('pt-BR'),
          'Cliente': sale.client_name,
          'Vendedor': sale.seller_name,
          'Itens': (sale.item_types || []).join(', '),
          'Valor Original (R$)': originalPrice,
          'Valor com Desconto (R$)': negotiatedPrice,
          'Desconto Aplicado (R$)': discountValue,
          'Desconto (%)': discountPercentage.toFixed(2) + '%',
          'Método Pagto': sale.payment_method || 'PIX',
          'Status': sale.status === 'paid' ? 'LIQUIDADO' : 
                    sale.status === 'cancelled' ? 'CANCELADO' : 
                    sale.status === 'refused' ? 'RECUSADO' : 
                    sale.status === 'expired' ? 'EXPIRADO' : 'PENDENTE'
        };
      })

      // 3. Adicionar uma folha de resumo
      const summaryData = [
        { 'Métrica': 'Total Recebido (Líquido)', 'Valor': parseFloat(stats.total_paid) },
        { 'Métrica': 'Total a Receber (Pendente)', 'Valor': parseFloat(stats.total_pending) },
        { 'Métrica': 'Total em Atraso', 'Valor': parseFloat(stats.total_overdue) },
        { 'Métrica': 'Receita Bruta Total (Original)', 'Valor': salesData.reduce((acc, s) => acc + (parseFloat(s.original_price) || parseFloat(s.total_price)), 0) },
        { 'Métrica': 'Receita Líquida Total (Negociada)', 'Valor': salesData.reduce((acc, s) => acc + parseFloat(s.total_price), 0) },
        { 'Métrica': 'Volume de Vendas', 'Valor': salesData.length }
      ]

      // 4. Criar Workbook e Worksheets
      const wb = XLSX.utils.book_new()

      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      const wsInstallments = XLSX.utils.json_to_sheet(worksheetData)
      const wsSales = XLSX.utils.json_to_sheet(formattedSalesData)

      // 5. Configurar larguras de colunas
      wsInstallments['!cols'] = [
        { wch: 10 }, { wch: 10 }, { wch: 35 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 20 }
      ]
      wsSales['!cols'] = [
        { wch: 10 }, { wch: 12 }, { wch: 35 }, { wch: 20 }, { wch: 40 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ]
      wsSummary['!cols'] = [{ wch: 35 }, { wch: 20 }]

      // 6. Adicionar ao Workbook
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo Executivo")
      XLSX.utils.book_append_sheet(wb, wsSales, "Vendas Consolidadas")
      XLSX.utils.book_append_sheet(wb, wsInstallments, "Detalhamento de Parcelas")

      // 7. Gerar arquivo
      const fileName = `Relatorio_Financeiro_Completo_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      // Mostrar tela de sucesso
      setExportSuccess(true)
    } catch (error) {
      console.error("Erro ao exportar Excel:", error)
      alert("Erro ao gerar relatório Excel. Verifique o console para mais detalhes.")
    } finally {
      setIsExporting(false)
    }
  }



  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const filteredInstallments = installments.filter(i => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      i.client_name?.toLowerCase().includes(searchLower) ||
      i.client_company?.toLowerCase().includes(searchLower) ||
      i.sale_id?.toString().includes(searchLower);

    const matchesStatus = filters.status === 'all' || i.status === filters.status;
    const matchesSeller = filters.seller === 'all' || i.seller_id?.toString() === filters.seller.toString();
    const matchesCategory = filters.category === 'all' || (i.category_ids && i.category_ids.includes(filters.category.toString()));

    let matchesDate = true;
    if (filters.startDate || filters.endDate) {
      const instDate = new Date(i.due_date);
      instDate.setHours(0, 0, 0, 0);

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (instDate < start) matchesDate = false;
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(0, 0, 0, 0);
        if (instDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesSeller && matchesCategory && matchesDate;
  })

  if (exportSuccess) {
    return (
      <div className="success-screen animate-fade flex-column align-center justify-center">
        <div className="glass success-card text-center p-60">
          <div className="success-icon-wrapper mb-32">
            <CheckCircle2 size={80} className="color-emerald" />
          </div>
          <h1 className="text-white mb-16">Relatório Exportado!</h1>
          <p className="color-muted mb-40 text-lg">O arquivo Excel foi gerado com sucesso e o download já deve ter iniciado no seu navegador.</p>

          <div className="flex gap-16 justify-center">
            <button className="btn btn-secondary px-32 py-16" onClick={() => setExportSuccess(false)}>
              Voltar ao Financeiro
            </button>
            <button className="btn btn-primary px-32 py-16" onClick={() => window.location.href = '/'}>
              Ir para o Dashboard
            </button>
          </div>
        </div>

        <style>{`
        .success-screen {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.95);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .success-card {
          max-width: 540px;
          width: 100%;
          border-radius: 32px;
          border: 1px solid rgba(251, 191, 36, 0.2);
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          background: #0f172a;
          padding: 60px 40px;
          position: relative;
        }
        .success-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          width: 120px;
          height: 120px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .text-lg { font-size: 18px; }
      `}</style>
      </div>
    )
  }

  return (
    <div className="financial-page animate-fade">
      <header className="page-header">
        <div className="flex justify-between align-center">
          <div>
            <h1>Módulo Financeiro</h1>
            <p>Controle de fluxo de caixa, recebimentos e parcelas em aberto.</p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || installments.length === 0}
              className="btn btn-secondary flex align-center gap-8"
            >
              {isExporting ? (
                <>Processando...</>
              ) : (
                <><TrendingUp size={18} /> Exportar Excel (Completo)</>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="grid-auto mb-40">
        <FinancialStat
          title="Total Recebido"
          value={formatCurrency(stats.total_paid)}
          icon={<CheckCircle2 size={24} />}
          subtitle="Valor liquidado no sistema"
          colorClass="emerald"
        />
        <FinancialStat
          title="Lucro Livre (Arrecadado)"
          value={formatCurrency(stats.total_net_profit || 0)}
          icon={<TrendingUp size={24} />}
          subtitle="Recebido já descontado taxas"
          colorClass="cyan"
        />
        <FinancialStat
          title="A Receber (No Prazo)"
          value={formatCurrency(stats.total_pending)}
          icon={<Clock size={24} />}
          subtitle="Parcelas futuras pendentes"
          colorClass="amber"
        />
        <FinancialStat
          title="Em Atraso"
          value={formatCurrency(stats.total_overdue)}
          icon={<AlertCircle size={24} />}
          subtitle="Atenção: Cobrança necessária"
          colorClass="rose"
        />
      </section>

      <div className="glass search-bar mb-32">
        <div className="flex align-center gap-16 px-24 py-16">
          <Search size={20} className="color-muted" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa ou venda..."
            className="flex-1 bg-transparent border-none color-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter
            size={20}
            style={{
              color: showFilters ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: showFilters ? 'scale(1.1)' : 'scale(1)'
            }}
            onClick={() => setShowFilters(!showFilters)}
          />
        </div>
      </div>

      {showFilters && (
        <div className="glass p-24 mb-32 animate-fade flex flex-wrap gap-20 filter-panel">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">Todos os Status</option>
              <option value="paid">Liquidado</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelado</option>
              <option value="refused">Recusado</option>
              <option value="expired">Expirado</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Vendedor</label>
            <select
              className="filter-select"
              value={filters.seller}
              onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
            >
              <option value="all">Todos os Vendedores</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Categoria (Espaço)</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Vencimento Inicial</label>
            <input
              type="date"
              className="filter-input-date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Vencimento Final</label>
            <input
              type="date"
              className="filter-input-date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="flex align-end">
            <button
              className="btn btn-secondary py-10 px-20 btn-clear-filters"
              style={{ height: '42px', fontSize: '13px' }}
              onClick={() => setFilters({ status: 'all', seller: 'all', category: 'all', startDate: '', endDate: '' })}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      <div className="glass table-container overflow-hidden">
        <table className="custom-table w-full">
          <thead>
            <tr>
              <th>Cliente / Empresa</th>
              <th>Parcela</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th className="text-right pr-20">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map((inst) => (
              <tr key={inst.id} className="row-hover">
                <td>
                  <div className="flex-column">
                    <span className="font-bold text-white">{inst.client_name}</span>
                    <span className="text-xs color-muted">{inst.client_company || 'Pessoa Física'}</span>
                  </div>
                </td>
                <td>
                  <span className="badge-pill">Nº {inst.installment_number}</span>
                </td>
                <td>
                  <div className="flex align-center gap-8 text-sm">
                    <Calendar size={14} className="color-muted" />
                    {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td>
                  <span className="font-bold text-white">{formatCurrency(inst.amount)}</span>
                </td>
                <td>
                  <span className={`status-badge ${inst.status}`}>
                    {inst.status === 'paid' ? 'Liquidado' : 
                     inst.status === 'cancelled' ? 'Cancelado' : 
                     inst.status === 'refused' ? 'Recusado' : 
                     inst.status === 'expired' ? 'Expirado' : 'Pendente'}
                  </span>
                </td>
                <td className="text-right pr-20">
                  <div className="flex justify-end">
                    <button
                      className="action-btn-financial"
                      onClick={() => handleOpenSaleDetail(inst.sale_id)}
                      title="Ver Detalhes da Venda"
                    >
                      <Search size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInstallments.length === 0 && !loading && (
          <div className="empty-state py-80 text-center color-muted">
            Nenhuma parcela encontrada para os critérios de busca.
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {showDetail && (
          <div className="modal-overlay-premium" onClick={() => setShowDetail(false)}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="modal-card-premium glass"
               style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 60px)', overflow: 'hidden' }}
               onClick={e => e.stopPropagation()}
            >
               <div className="modal-header">
                  <div className="space-badge-icon" style={{ background: 'var(--primary)', color: '#000' }}>
                    <DollarSign size={24} />
                  </div>
                  <div className="header-text">
                    <h3>{selectedSale ? `Venda #${selectedSale.id.toString().padStart(4, '0')}` : 'Carregando...'}</h3>
                    <span className="type-meta">Operação Comercial / Financeira</span>
                  </div>
                  <button className="close-x" onClick={() => setShowDetail(false)}><X size={20}/></button>
               </div>

               {!selectedSale ? (
                  <div className="loading-details" style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                     <div className="mini-spinner"></div>
                     <span style={{ color: 'var(--text-muted)' }}>Recuperando dados da transação...</span>
                  </div>
               ) : (
                  <div className="modal-content-grid" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                     {/* Coluna Esquerda: Ficha da Transação */}
                     <div className="modal-column space-info-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h4 className="section-title-sm"><LayoutGrid size={14} /> Ficha da Transação</h4>
                        <div className="info-list-glass">
                           <div className="info-entry">
                              <label>Identificação</label>
                              <strong>ID #{selectedSale.id.toString().padStart(4, '0')}</strong>
                           </div>
                           <div className="info-entry">
                              <label>Vendedor Executivo</label>
                              <strong>{selectedSale.seller_name}</strong>
                           </div>
                           <div className="info-entry">
                              <label>Data de Fechamento</label>
                              <strong>{new Date(selectedSale.purchase_date || selectedSale.created_at).toLocaleDateString('pt-BR')}</strong>
                           </div>
                           <div className="info-entry highlight">
                              <label>Valor de Tabela</label>
                              <strong>{formatCurrency(selectedSale.original_price || selectedSale.total_price)}</strong>
                           </div>
                            <div className="info-entry highlight" style={{ background: 'rgba(251, 191, 36, 0.05)', borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                               <label>Valor Final Negociado</label>
                               <strong style={{ color: 'var(--primary)' }}>{formatCurrency(selectedSale.total_price)}</strong>
                            </div>
                            {selectedSale.payment_method === 'credito' && selectedSale.card_brand && (
                               <>
                                  <div className="info-entry highlight" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                                     <label>Taxa de Cartão ({selectedSale.card_brand} {parseFloat(selectedSale.card_fee_rate || 0).toFixed(2)}%)</label>
                                     <strong style={{ color: '#f43f5e' }}>- {formatCurrency(selectedSale.card_fee_amount || 0)}</strong>
                                  </div>
                                  <div className="info-entry highlight" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                     <label>Valor Líquido Recebido</label>
                                     <strong style={{ color: '#10b981' }}>{formatCurrency(selectedSale.total_price - (selectedSale.card_fee_amount || 0))}</strong>
                                  </div>
                               </>
                            )}
                        </div>
                     </div>

                     {/* Coluna Direita: Cliente e Itens */}
                     <div className="modal-column sale-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 className="section-title-sm"><ShoppingCart size={14} /> Dados do Contratante e Itens</h4>
                        
                        <div className="booking-card">
                           <div className="client-header" style={{ marginBottom: '16px' }}>
                              <div className="client-avatar" style={{ background: '#fbbf24', color: '#000' }}>
                                 {selectedSale.client_name ? selectedSale.client_name[0].toUpperCase() : 'C'}
                              </div>
                              <div className="client-names">
                                 <strong>{selectedSale.client_name}</strong>
                                 <span>{selectedSale.company || 'Pessoa Física'}</span>
                              </div>
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <div>Método de Recebimento: <strong style={{ color: '#fff' }}>{(selectedSale.payment_method || 'PIX').toUpperCase()}</strong></div>
                           </div>
                        </div>

                        <div className="booking-card">
                           <h4 className="section-title-sm" style={{ marginBottom: '16px' }}><ShoppingCart size={14} /> Itens Contratados</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {selectedSale.items && selectedSale.items.map((item, idx) => (
                                 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{item.item_name}</span>
                                    <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>{formatCurrency(item.item_price)}</strong>
                                 </div>
                              ))}
                              {selectedSale.items && selectedSale.items.length === 0 && (
                                 <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Nenhum item registrado nesta venda.</span>
                              )}
                           </div>
                        </div>

                        {selectedSale.observations && (
                           <div className="booking-card">
                              <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Observações</label>
                              <p style={{ fontSize: '13px', color: '#fff', opacity: 0.9, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{selectedSale.observations}</p>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               <div className="modal-footer-premium">
                  <button className="btn-minimal" onClick={() => setShowDetail(false)} style={{ marginRight: '20px' }}>Fechar Janela</button>
                  {selectedSale && (
                     <button className="btn btn-primary" onClick={() => handlePrintReceipt(selectedSale)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={16} /> Imprimir Comprovante
                     </button>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .financial-page { padding: 8px 0; }
        .page-header h1 { font-size: 32px; font-weight: 800; color: white; }
        .page-header p { color: var(--text-muted); margin-top: 4px; }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-badge.paid { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-badge.cancelled { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
        .status-badge.refused { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .status-badge.expired { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }
        
        .badge-pill {
          background: rgba(255,255,255,0.05);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn.pay:hover { background: #10b981; color: white; border-color: #10b981; }
        .action-btn.undo:hover { background: #f43f5e; color: white; border-color: #f43f5e; }
        
        .custom-table th { text-align: left; padding: 20px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .custom-table td { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .row-hover:hover { background: rgba(255,255,255,0.01); }

        .filter-panel {
          background: rgba(30, 41, 59, 0.2) !important;
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex;
          align-items: flex-end;
          margin-bottom: 32px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 180px;
        }
        .filter-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-select, .filter-input-date {
          background: rgba(2, 6, 23, 0.4);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-size: 14px;
          outline: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-select option {
          background: #0f172a;
          color: white;
        }
        .filter-select:focus, .filter-input-date:focus {
          border-color: var(--primary);
        }
        .btn-clear-filters {
          font-size: 12px;
          padding: 10px 16px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn-financial {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-btn-financial:hover {
          background: rgba(56, 189, 248, 0.1);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
          transform: translateY(-2px);
        }
        .action-btn-financial.pay:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--success);
          color: var(--success);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
          transform: translateY(-2px);
        }
        .action-btn-financial.undo:hover {
          background: rgba(244, 63, 94, 0.1);
          border-color: var(--error);
          color: var(--error);
          box-shadow: 0 0 12px rgba(244, 63, 94, 0.4);
          transform: translateY(-2px);
        }

        /* Modal Styles matching Espaços Page */
        .modal-overlay-premium { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card-premium { width: 100%; max-width: 900px; background: #0c0e14; border-radius: 32px; border: 1px solid var(--border); overflow: hidden; }
        .modal-header { padding: 32px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--border); position: relative; }
        .space-badge-icon { width: 56px; height: 56px; background: var(--primary); color: #000; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .header-text h3 { font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 4px; margin-top: 0; }
        .type-meta { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .close-x { position: absolute; right: 24px; top: 24px; background: transparent; border: none; color: var(--text-dim); cursor: pointer; }

        .modal-content-grid { display: grid; grid-template-columns: 1fr 1.2fr; padding: 32px; gap: 32px; }
        .section-title-sm { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 24px; }
        .info-list-glass { display: flex; flex-direction: column; gap: 16px; }
        .info-entry { padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); }
        .info-entry.highlight { background: rgba(251, 191, 36, 0.03); border-color: rgba(251, 191, 36, 0.1); }
        .info-entry label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px; display: block; }
        .info-entry strong { font-size: 16px; color: #fff; }
        .info-entry.highlight strong { color: var(--primary); font-size: 20px; font-weight: 900; }
        .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; }
        .status-pill.available { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        .booking-card { background: rgba(255,255,255,0.02); padding: 24px; border-radius: 20px; border: 1px solid var(--border); }
        .client-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .client-avatar { width: 44px; height: 44px; background: #2563eb; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .client-names { display: flex; flex-direction: column; }
        .client-names strong { font-size: 18px; color: #fff; }
        .client-names span { font-size: 13px; color: var(--text-muted); }
        .sale-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .data-box { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 16px; border: 1px solid var(--border); }
        .data-box.gold { border-color: rgba(251, 191, 36, 0.2); background: rgba(251, 191, 36, 0.05); }
        .data-box label { font-size: 9px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .data-box strong { font-size: 14px; color: #fff; }
        .data-box.gold strong { color: var(--primary); font-size: 18px; font-weight: 900; }
        .status-text.paid { color: #10b981; text-transform: uppercase; font-size: 11px; font-weight: 800; }

        .modal-footer-premium { padding: 24px 32px; background: rgba(255,255,255,0.02); display: flex; justify-content: flex-end; border-top: 1px solid var(--border); }
        .btn-minimal { background: transparent; border: none; color: var(--text-dim); font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-minimal:hover { color: #fff; }
      `}</style>
    </div>
  )
}

export default Financial
