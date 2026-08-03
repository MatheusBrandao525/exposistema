import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Mail, Shield, Briefcase, Trash2, Edit2 } from 'lucide-react'
import api from '../api'

const Sellers = () => {
  const [sellers, setSellers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = () => {
    api.get('/users')
      .then(res => res.json())
      .then(setSellers)
  }

  const handleDelete = (id) => {
    if (confirm('Deseja realmente remover este vendedor?')) {
      api.delete(`/users/${id}`)
        .then(() => fetchSellers())
    }
  }

  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.username && s.username.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="sellers-page animate-fade">
      {/* Page Header with extra breathing room */}
      <header className="page-header flex justify-between align-center mb-60 mt-20">
        <div className="info">
          <h1 className="text-4xl font-extrabold mb-12">Equipe de Vendas</h1>
          <p className="color-muted text-lg max-w-lg">
            Sistema de gestão centralizado para controle de permissões e funções específicas dos seus colaboradores.
          </p>
        </div>
        <button className="btn btn-primary premium-btn" onClick={() => navigate('/sellers/new')}>
          <UserPlus size={20} strokeWidth={2.5} /> Novo Vendedor
        </button>
      </header>

      {/* Spacious Search Bar Container */}
      <div className="glass search-bar-wrapper mb-60">
        <div className="search-input-inner">
           <Search size={24} className="color-muted" strokeWidth={2.5} />
           <input 
              className="premium-search-input" 
              placeholder="Pesquise o colaborador por nome, e-mail ou usuário..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Clean & Balanced Table Container */}
      <div className="glass table-outer-wrapper overflow-hidden mb-80">
        <table className="premium-table w-full">
          <thead>
            <tr>
              <th className="col-user">Colaborador</th>
              <th className="col-function">Função Comercial</th>
              <th className="col-status">Nível de Acesso</th>
              <th className="col-actions text-right">Gerenciamento</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.length > 0 ? filteredSellers.map(seller => (
              <tr key={seller.id} className="row-hover">
                <td className="col-user">
                  <div className="flex align-center gap-20">
                    <div className="premium-avatar-box">{(seller.name || '?')[0]}</div>
                    <div className="flex-column gap-4">
                      <span className="font-bold text-base text-white">{seller.name}</span>
                      <div className="flex align-center gap-12 text-xs color-muted flex-wrap">
                        <span className="flex align-center gap-6"><Mail size={12}/> {seller.email}</span>
                        {seller.username && (
                          <span className="flex align-center gap-6" style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>
                            <strong>@</strong>{seller.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="col-function">
                   <div className="flex flex-wrap gap-8">
                      {(seller.seller_function || 'Sem Função').split(',').map(func => (
                        <div key={func} className="badge-pill-function">
                           <Briefcase size={12} strokeWidth={2.5} /> {func}
                        </div>
                      ))}
                   </div>
                </td>
                <td className="col-status">
                   <span className={`badge-pill-role ${seller.role}`}>
                      <Shield size={14} strokeWidth={2.5} /> {seller.role === 'admin' ? 'Administrador' : 'Vendedor'}
                   </span>
                </td>
                <td className="col-actions text-right">
                   <div className="flex justify-end gap-16">
                      <button className="premium-action-btn edit" onClick={() => navigate(`/sellers/edit/${seller.id}`)} title="Editar"><Edit2 size={18} strokeWidth={2.5}/></button>
                      <button className="premium-action-btn delete" onClick={() => handleDelete(seller.id)} title="Remover"><Trash2 size={18} strokeWidth={2.5}/></button>
                   </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center py-60 color-muted italic">
                   Nenhum vendedor encontrado com este critério de busca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .sellers-page { width: 100%; max-width: 1400px; margin: 0 auto; }
        .text-4xl { font-size: 36px; }
        .text-base { font-size: 16px; }
        .text-lg { font-size: 18px; }
        .text-xs { font-size: 12px; }
        .font-extrabold { font-weight: 800; }
        .mb-60 { margin-bottom: 60px; }
        .mb-80 { margin-bottom: 80px; }
        .mt-20 { margin-top: 20px; }
        .premium-btn { padding: 14px 28px; box-shadow: 0 10px 20px var(--primary-glow); display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .search-bar-wrapper { border-radius: 20px; padding: 10px; }
        .search-input-inner { display: flex; align-items: center; gap: 24px; padding: 16px 40px; }
        .premium-search-input { background: none; border: none; font-size: 18px; color: white; width: 100%; outline: none; }
        .premium-search-input::placeholder { color: var(--text-dim); }

        /* Table Widths & Alignments */
        .premium-table { border-collapse: separate; border-spacing: 0; }
        .col-user { width: 35%; padding-left: 48px !important; }
        .col-function { width: 25%; }
        .col-status { width: 25%; }
        .col-actions { width: 15%; padding-right: 48px !important; }

        .premium-table th { background: rgba(255,255,255,0.02); text-align: left; padding: 24px 20px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.15em; border-bottom: 1px solid var(--border); }
        .premium-table td { padding: 32px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
        .row-hover:hover { background: rgba(255,255,255,0.02); }

        /* Avatar Box with perfect centering */
        .premium-avatar-box { width: 50px; height: 50px; background: linear-gradient(135deg, var(--bg-surface), #1e293b); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }

        /* Badge Pills */
        .badge-pill-function { display: inline-flex; align-items: center; gap: 10px; background: rgba(251, 191, 36, 0.05); color: var(--primary); padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; border: 1px solid rgba(251, 191, 36, 0.1); }
        .badge-pill-role { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
        .badge-pill-role.admin { background: rgba(56, 189, 248, 0.05); color: var(--accent); border-color: rgba(56, 189, 248, 0.1); }
        .badge-pill-role.seller { background: rgba(16, 185, 129, 0.05); color: var(--success); border-color: rgba(16, 185, 129, 0.1); }
        
        .flex-wrap { flex-wrap: wrap; }
        .gap-8 { gap: 8px; }


        /* Actions */
        .premium-action-btn { background: rgba(255,255,255,0.03); border: 1px solid var(--border); width: 42px; height: 42px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .premium-action-btn:hover { color: white; background: rgba(255,255,255,0.08); transform: translateY(-3px); border-color: rgba(255,255,255,0.15); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .premium-action-btn.delete:hover { border-color: var(--error); color: var(--error); background: rgba(244, 63, 94, 0.1); }
      `}</style>
    </div>
  )
}

export default Sellers
