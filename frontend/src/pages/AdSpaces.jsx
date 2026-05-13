import React, { useState, useEffect } from 'react'
import { Plus, Search, MapPin, DollarSign, X, ShoppingCart, Calendar, Info, LayoutGrid, Tag, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const AdSpaces = () => {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [types, setTypes] = useState([])
  const [formData, setFormData] = useState({ name: '', ad_space_type_id: '', base_price: '', allows_discount: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSpaces()
    fetchTypes()
  }, [])

  const fetchTypes = () => {
    api.get('/types')
      .then(res => res.json())
      .then(data => setTypes(data))
      .catch(err => console.error(err))
  }

  const fetchSpaces = () => {
    setLoading(true)
    console.log("Fetching spaces from /spaces...")
    api.get('/spaces')
      .then(res => {
        console.log("Response status:", res.status)
        return res.json()
      })
      .then(data => {
        console.log("Spaces received:", data)
        setSpaces(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching spaces:", err)
        setLoading(false)
      })
  }

  const handleOpenDetails = async (space) => {
    setSelectedSpace(space)
    setBookingDetails(null)
    setShowModal(true)

    if (space.status !== 'available') {
      try {
        const res = await api.get(`/spaces/${space.id}/booking-details`)
        const data = await res.json()
        if (!data.error) {
          setBookingDetails(data)
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes da venda", err)
      }
    }
  }

  const filteredSpaces = (Array.isArray(spaces) ? spaces : []).filter(s => {
    const nameMatch = s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = s.type_name && s.type_name.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || typeMatch;
  });

  const handleAddSpace = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        ad_space_type_id: formData.ad_space_type_id,
        base_price: parseFloat(formData.base_price),
        allows_discount: formData.allows_discount
      };
      const res = await api.post('/spaces', payload);
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ name: '', ad_space_type_id: '', base_price: '', allows_discount: true });
        fetchSpaces();
      } else {
        alert(data.error || 'Erro ao criar espaço');
      }
    } catch (err) {
      alert('Erro ao criar espaço');
    } finally {
      setSaving(false);
    }
  }

  const formatCurrency = (value) => {
     return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }

  return (
    <div className="spaces-page-table-view">
      <header className="page-header flex justify-between align-center mb-60 mt-20">
        <div className="info">
          <h1 className="text-4xl font-extrabold mb-12">Mapa de Inventário</h1>
          <p className="color-muted text-lg max-w-lg">
            Gestão estratégica de espaços publicitários e ativos do evento.
          </p>
        </div>
        <button className="btn btn-primary premium-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={20} strokeWidth={2.5} /> Novo Ativo
        </button>
      </header>

      <div className="glass search-bar-wrapper mb-60">
        <div className="search-input-inner">
           <Search size={24} className="color-muted" strokeWidth={2.5} />
           <input 
              className="premium-search-input" 
              placeholder="Pesquisar por id, nome ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="glass table-outer-wrapper overflow-hidden mb-80">
        <table className="premium-table w-full">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-name">Espaço</th>
              <th className="col-type">Categoria</th>
              <th className="col-price">Valor Base</th>
              <th className="col-status">Status</th>
              <th className="col-actions text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-60">
                   <div className="flex flex-column align-center gap-16">
                      <div className="spinner"></div>
                      <span className="color-muted">Sincronizando inventário...</span>
                   </div>
                </td>
              </tr>
            ) : filteredSpaces.length > 0 ? filteredSpaces.map(space => (
              <tr key={space.id} className="row-hover">
                <td className="col-id">
                   <span className="text-xs color-muted font-bold">#{space.id.toString().padStart(4, '0')}</span>
                </td>
                <td className="col-name">
                   <div className="flex align-center gap-16">
                      <div className="premium-avatar-box">{(space.name || '?')[0]}</div>
                      <span className="font-bold text-white">{space.name}</span>
                   </div>
                </td>
                <td className="col-type">
                   <div className="badge-pill-type">
                      <Tag size={12} strokeWidth={2.5} /> {space.type_name || 'Espaço'}
                   </div>
                </td>
                <td className="col-price">
                   <span className="font-bold text-white">{formatCurrency(space.base_price)}</span>
                </td>
                <td className="col-status">
                   <span className={`badge-pill-status ${space.status}`}>
                      {space.status === 'available' ? 'Disponível' : 'Indisponível'}
                   </span>
                </td>
                <td className="col-actions text-right">
                   <button className="premium-action-btn" onClick={() => handleOpenDetails(space)}>
                      <Info size={18} strokeWidth={2.5} />
                   </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-60 color-muted italic">
                   Nenhum espaço encontrado com este critério de busca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {showModal && selectedSpace && (
          <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="modal-card-premium glass"
               onClick={e => e.stopPropagation()}
            >
               <div className="modal-header">
                  <div className="space-badge-icon">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="header-text">
                    <h3>{selectedSpace.name}</h3>
                    <span className="type-meta">{selectedSpace.type_name || 'Serviço Publicitário'}</span>
                  </div>
                  <button className="close-x" onClick={() => setShowModal(false)}><X size={20}/></button>
               </div>

               <div className="modal-content-grid">
                  <div className="modal-column space-info-panel">
                     <h4 className="section-title-sm"><Info size={14} /> Ficha Técnica do Espaço</h4>
                     <div className="info-list-glass">
                        <div className="info-entry">
                           <label>Identificação</label>
                           <strong>ID #{selectedSpace.id.toString().padStart(4, '0')}</strong>
                        </div>
                        <div className="info-entry">
                           <label>Localização</label>
                           <strong>{selectedSpace.location || 'Zona Central / Pavilhão A'}</strong>
                        </div>
                        <div className="info-entry highlight">
                           <label>Valor de Tabela</label>
                           <strong>{formatCurrency(selectedSpace.base_price)}</strong>
                        </div>
                        <div className="info-entry">
                           <label>Status Atual</label>
                           <span className={`status-pill ${selectedSpace.status}`}>
                              {selectedSpace.status === 'available' ? 'Disponível para Venda' : 'Indisponível'}
                           </span>
                        </div>
                     </div>
                  </div>

                  {selectedSpace.status !== 'available' && (
                    <div className="modal-column sale-info-panel">
                       <h4 className="section-title-sm"><ShoppingCart size={14} /> Inteligência de Venda</h4>
                       {bookingDetails ? (
                         <div className="booking-card">
                            <div className="client-header">
                               <div className="client-avatar">{bookingDetails.client_name[0]}</div>
                               <div className="client-names">
                                  <strong>{bookingDetails.client_name}</strong>
                                  <span>{bookingDetails.client_company}</span>
                               </div>
                            </div>

                            <div className="sale-data-grid">
                               <div className="data-box">
                                  <label><User size={12}/> Vendedor Executivo</label>
                                  <strong>{bookingDetails.seller_name}</strong>
                               </div>
                               <div className="data-box">
                                  <label><Calendar size={12}/> Data do Fechamento</label>
                                  <strong>{new Date(bookingDetails.purchase_date).toLocaleDateString('pt-BR')}</strong>
                               </div>
                               <div className="data-box gold">
                                  <label><DollarSign size={12}/> Valor Negociado</label>
                                  <strong>{formatCurrency(bookingDetails.negotiated_price)}</strong>
                               </div>
                               <div className="data-box">
                                  <label>Status Financeiro</label>
                                  <span className={`status-text ${bookingDetails.payment_status}`}>
                                     {bookingDetails.payment_status === 'paid' ? 'Liquidado' : 'Aguardando Pagamento'}
                                  </span>
                               </div>
                            </div>
                         </div>
                       ) : (
                         <div className="loading-details">
                            <div className="mini-spinner"></div>
                            <span>Recuperando dados da transação...</span>
                         </div>
                       )}
                    </div>
                  )}
               </div>

               <div className="modal-footer-premium">
                  <button className="btn-minimal" onClick={() => setShowModal(false)}>Fechar Janela</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar Ativo */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay-premium" onClick={() => setShowAddModal(false)}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="modal-card-premium glass"
               style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column' }}
               onClick={e => e.stopPropagation()}
            >
               <div className="modal-header">
                  <div className="header-text">
                    <h3>Novo Ativo</h3>
                    <span className="type-meta">Adicionar espaço ao inventário</span>
                  </div>
                  <button className="close-x" onClick={() => setShowAddModal(false)}><X size={20}/></button>
               </div>

               <div style={{ padding: '32px' }}>
                  <form onSubmit={handleAddSpace} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div className="form-group">
                        <label>Nome do Espaço</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.name} 
                           onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                     </div>
                     <div className="form-group">
                        <label>Categoria</label>
                        <select 
                           required 
                           value={formData.ad_space_type_id} 
                           onChange={e => setFormData({...formData, ad_space_type_id: e.target.value})} 
                           style={{ color: '#000' }}
                        >
                           <option value="" disabled>Selecione uma categoria</option>
                           {types.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="form-group">
                        <label>Valor Base (R$)</label>
                        <input 
                           type="number" 
                           step="0.01" 
                           required 
                           value={formData.base_price} 
                           onChange={e => setFormData({...formData, base_price: e.target.value})} 
                        />
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                           type="checkbox" 
                           id="allowsDiscount" 
                           checked={formData.allows_discount} 
                           onChange={e => setFormData({...formData, allows_discount: e.target.checked})} 
                           style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="allowsDiscount" style={{ fontSize: '14px', color: '#fff', textTransform: 'none' }}>Permite Desconto para Sócios</label>
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" className="btn-minimal" onClick={() => setShowAddModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                           {saving ? 'Salvando...' : 'Salvar Ativo'}
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .spaces-page-table-view { width: 100%; max-width: 1400px; margin: 0 auto; }
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

        .premium-table { border-collapse: separate; border-spacing: 0; }
        .col-id { width: 80px; padding-left: 48px !important; }
        .col-name { width: 30%; }
        .col-type { width: 20%; }
        .col-price { width: 15%; }
        .col-status { width: 15%; }
        .col-actions { width: 10%; padding-right: 48px !important; }

        .premium-table th { background: rgba(255,255,255,0.02); text-align: left; padding: 24px 20px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.15em; border-bottom: 1px solid var(--border); }
        .premium-table td { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
        .row-hover:hover { background: rgba(255,255,255,0.02); }

        .premium-avatar-box { width: 44px; height: 44px; background: linear-gradient(135deg, var(--bg-surface), #1e293b); border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: var(--primary); }

        .badge-pill-type { display: inline-flex; align-items: center; gap: 8px; background: rgba(251, 191, 36, 0.05); color: var(--primary); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; border: 1px solid rgba(251, 191, 36, 0.1); }
        
        .badge-pill-status { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; }
        .badge-pill-status.available { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .badge-pill-status.sold { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .badge-pill-status.reserved { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

        .premium-action-btn { background: rgba(255,255,255,0.03); border: 1px solid var(--border); width: 40px; height: 40px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
        .premium-action-btn:hover { color: white; background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: var(--primary); }

        /* Modal Styles */
        .modal-overlay-premium { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card-premium { width: 100%; max-width: 900px; background: #0c0e14; border-radius: 32px; border: 1px solid var(--border); overflow: hidden; }
        .modal-header { padding: 32px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--border); position: relative; }
        .space-badge-icon { width: 56px; height: 56px; background: var(--primary); color: #000; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .header-text h3 { font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 4px; }
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

        .spinner, .mini-spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default AdSpaces
