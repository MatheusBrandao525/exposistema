import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  TrendingUp,
  ArrowDownCircle,
  Clock
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
    total_overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [instRes, statsRes] = await Promise.all([
        api.get('/financial'),
        api.get('/financial/stats')
      ])
      const instData = await instRes.json()
      const statsData = await statsRes.json()
      setInstallments(instData)
      setStats(statsData)
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
        'Valor (R$)': parseFloat(inst.amount),
        'Status': inst.status === 'paid' ? 'LIQUIDADO' : 'PENDENTE',
        'Data de Pagamento': inst.paid_at ? new Date(inst.paid_at).toLocaleDateString('pt-BR') : '-'
      }))

      // 2. Preparar os dados das vendas (Consolidado)
      const formattedSalesData = salesData.map(sale => ({
        'ID Venda': sale.id,
        'Data': new Date(sale.purchase_date || sale.created_at).toLocaleDateString('pt-BR'),
        'Cliente': sale.client_name,
        'Vendedor': sale.seller_name,
        'Itens': sale.item_types.join(', '),
        'Valor Total (R$)': parseFloat(sale.total_price),
        'Método Pagto': sale.payment_method || 'PIX',
        'Status': sale.status === 'paid' ? 'LIQUIDADO' : 'PENDENTE'
      }))

      // 3. Adicionar uma folha de resumo
      const summaryData = [
        { 'Métrica': 'Total Recebido (Líquido)', 'Valor': parseFloat(stats.total_paid) },
        { 'Métrica': 'Total a Receber (Pendente)', 'Valor': parseFloat(stats.total_pending) },
        { 'Métrica': 'Total em Atraso', 'Valor': parseFloat(stats.total_overdue) },
        { 'Métrica': 'Receita Bruta Total', 'Valor': salesData.reduce((acc, s) => acc + parseFloat(s.total_price), 0) },
        { 'Métrica': 'Volume de Vendas', 'Valor': salesData.length }
      ]

      // 4. Criar Workbook e Worksheets
      const wb = XLSX.utils.book_new()
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      const wsInstallments = XLSX.utils.json_to_sheet(worksheetData)
      const wsSales = XLSX.utils.json_to_sheet(formattedSalesData)

      // 5. Configurar larguras de colunas
      wsInstallments['!cols'] = [
        { wch: 10 }, { wch: 10 }, { wch: 35 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
      ]
      wsSales['!cols'] = [
        { wch: 10 }, { wch: 12 }, { wch: 35 }, { wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ]
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }]

      // 6. Adicionar ao Workbook
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo Executivo")
      XLSX.utils.book_append_sheet(wb, wsSales, "Vendas Consolidadas")
      XLSX.utils.book_append_sheet(wb, wsInstallments, "Detalhamento de Parcelas")

      // 7. Gerar arquivo
      const fileName = `Relatorio_Financeiro_Completo_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error("Erro ao exportar Excel:", error)
      alert("Erro ao gerar relatório Excel. Verifique o console para mais detalhes.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleTogglePaid = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    try {
      await api.put(`/financial/${id}`, { status: newStatus })
      fetchData()
    } catch (error) {
      alert("Erro ao atualizar status.")
    }
  }

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const filteredInstallments = installments.filter(i => 
    i.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.client_company.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      <section className="stats-row flex gap-24 mb-40 wrap">
        <FinancialStat 
          title="Total Recebido" 
          value={formatCurrency(stats.total_paid)} 
          icon={<CheckCircle2 size={24} />} 
          subtitle="Valor liquidado no sistema"
          colorClass="emerald"
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
            placeholder="Buscar por cliente ou empresa..." 
            className="flex-1 bg-transparent border-none color-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter size={20} className="color-muted cursor-pointer" />
        </div>
      </div>

      <div className="glass table-container overflow-hidden">
        <table className="custom-table w-full">
          <thead>
            <tr>
              <th>Cliente / Empresa</th>
              <th>Parcela</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map((inst) => (
              <tr key={inst.id} className="row-hover">
                <td>
                  <div className="flex-column">
                    <span className="font-bold text-white">{inst.client_name}</span>
                    <span className="text-xs color-muted">{inst.client_company}</span>
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
                  <span className={`status-badge ${inst.status === 'paid' ? 'paid' : 'pending'}`}>
                    {inst.status === 'paid' ? 'Liquidado' : 'Pendente'}
                  </span>
                </td>
                <td className="text-right">
                  <button 
                    onClick={() => handleTogglePaid(inst.id, inst.status)}
                    className={`action-btn ${inst.status === 'paid' ? 'undo' : 'pay'}`}
                    title={inst.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                  >
                    {inst.status === 'paid' ? <ArrowDownCircle size={18} /> : <CheckCircle2 size={18} />}
                  </button>
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
      `}</style>
    </div>
  )
}

export default Financial
