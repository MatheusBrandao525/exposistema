import React, { useState, useEffect } from 'react'
import { Plus, Filter, Search, Tag, MapPin, DollarSign, X, User, ShoppingCart, Calendar, Info, ChevronRight, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const AdSpaceCard = ({ space, onDetails }) => (
  <div className="glass ad-card animate-fade">
    <div className="card-image">
      <div className="card-overlay"></div>
      <div className="card-initial">{space.name[0]}</div>
      <span className={`status-badge-modern ${space.status}`}>
        {space.status === 'available' ? 'Disponível' : 'Indisponível'}
      </span>
    </div>
    <div className="card-body">
      <div className="card-meta">
        <span className="type-tag">{space.type_name || 'Espaço'}</span>
        <div className="location"><MapPin size={12} /> {space.location || 'Pavilhão Principal'}</div>
      </div>
      <h3 className="card-title">{space.name}</h3>
      <div className="card-price">
        <span className="label">Valor Base</span>
        <span className="value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(space.base_price)}</span>
      </div>
      <button className="details-button" onClick={() => onDetails(space)}>
        {space.status === 'available' ? 'Ver Detalhes' : 'Detalhes da Venda'}
      </button>
    </div>
  </div>
)

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
    api.get('/spaces')
      .then(res => res.json())
      .then(data => {
        setSpaces(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
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

  const filteredSpaces = spaces.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.type_name && s.type_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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

  return (
    <div className="spaces-container-premium">
      <header className="premium-page-header">
        <div className="title-section">
          <h1 className="main-title">Mapa de Inventário</h1>
          <p className="subtitle">Gestão estratégica de espaços publicitários e ativos do evento.</p>
        </div>
        <button className="btn-add-premium" onClick={() => setShowAddModal(true)}>
           <Plus size={20} />
           <span>Novo Ativo</span>
        </button>
      </header>

      <div className="control-bar glass">
        <div className="search-group">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar por id, nome ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="action-filters">
           <button className="action-btn"><Filter size={18} /> Filtros Avançados</button>
           <button className="action-btn"><LayoutGrid size={18} /> Categorias</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
           <div className="spinner"></div>
           <span>Sincronizando inventário...</span>
        </div>
      ) : (
        <div className="spaces-grid-premium">
          {filteredSpaces.map(space => (
            <AdSpaceCard key={space.id} space={space} onDetails={handleOpenDetails} />
          ))}
        </div>
      )}

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
                           <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSpace.base_price)}</strong>
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
                    <div className="modal-column sale-info-panel animate-slideRight">
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
                                  <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bookingDetails.negotiated_price)}</strong>
                               </div>
                               <div className="data-box">
                                  <label>Status Financeiro</label>
                                  <span className={`status-text ${bookingDetails.payment_status}`}>
                                     {bookingDetails.payment_status === 'paid' ? 'Liquidado' : 'Aguardando Pagamento'}
                                  </span>
                               </div>
                            </div>

                            <div className="sale-actions-modal">
                               <button className="btn-secondary-sm">Ver Contrato</button>
                               <button className="btn-secondary-sm">Histórico Financeiro</button>
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
                  <div className="footer-notes">
                     <span>* Dados auditados em tempo real pelo núcleo financeiro.</span>
                  </div>
                  <div className="footer-buttons">
                     <button className="btn-minimal" onClick={() => setShowModal(false)}>Fechar Janela</button>
                  </div>
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
                     <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-dim)' }}>Nome do Espaço</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.name} 
                           onChange={e => setFormData({...formData, name: e.target.value})} 
                           style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '15px' }} 
                        />
                     </div>
                     <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-dim)' }}>Categoria</label>
                        <select 
                           required 
                           value={formData.ad_space_type_id} 
                           onChange={e => setFormData({...formData, ad_space_type_id: e.target.value})} 
                           style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '15px', appearance: 'none' }}
                        >
                           <option value="" disabled style={{ color: '#000' }}>Selecione uma categoria</option>
                           {types.map(t => (
                              <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-dim)' }}>Valor Base (R$)</label>
                        <input 
                           type="number" 
                           step="0.01" 
                           required 
                           value={formData.base_price} 
                           onChange={e => setFormData({...formData, base_price: e.target.value})} 
                           style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '15px' }} 
                        />
                     </div>
                     <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <input 
                           type="checkbox" 
                           id="allowsDiscount" 
                           checked={formData.allows_discount} 
                           onChange={e => setFormData({...formData, allows_discount: e.target.checked})} 
                           style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                        />
                        <label htmlFor="allowsDiscount" style={{ fontSize: '14px', color: '#fff' }}>Permite Desconto para Sócios</label>
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" className="btn-minimal" onClick={() => setShowAddModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-add-premium" disabled={saving}>
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
        .spaces-container-premium { padding: 40px; animation: fadeIn 0.4s ease; min-height: 100vh; }
        
        .premium-page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .main-title { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 8px; }
        .subtitle { color: var(--text-muted); font-size: 16px; font-weight: 500; }
        
        .btn-add-premium { display: flex; align-items: center; gap: 12px; background: var(--primary); color: #000; padding: 12px 24px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 20px rgba(251, 191, 36, 0.2); }
        .btn-add-premium:hover { transform: translateY(-2px); background: #f59e0b; }

        .control-bar { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; border-radius: 18px; border: 1px solid var(--border); margin-bottom: 40px; }
        .search-group { flex: 1; display: flex; align-items: center; gap: 16px; }
        .search-icon { color: var(--text-dim); }
        .search-group input { background: transparent; border: none; color: #fff; width: 100%; font-size: 15px; outline: none; }
        .action-filters { display: flex; gap: 12px; }
        .action-btn { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text-muted); padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .action-btn:hover { background: rgba(255,255,255,0.07); border-color: var(--primary); color: #fff; }

        .spaces-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        
        /* Card Premium Styling */
        .ad-card { border-radius: 24px; overflow: hidden; border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .ad-card:hover { transform: translateY(-8px); border-color: rgba(251, 191, 36, 0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        
        .card-image { position: relative; height: 180px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #111827 0%, #030712 100%); }
        .card-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.05) 0%, transparent 70%); }
        .card-initial { font-size: 72px; font-weight: 900; color: #fff; opacity: 0.05; }
        
        .status-badge-modern { position: absolute; top: 16px; right: 16px; padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; backdrop-filter: blur(8px); border: 1px solid transparent; }
        .status-badge-modern.available { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
        .status-badge-modern.sold { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .status-badge-modern.reserved { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }

        .card-body { padding: 24px; }
        .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .type-tag { font-size: 10px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; background: rgba(251, 191, 36, 0.05); padding: 2px 8px; border-radius: 4px; }
        .location { font-size: 12px; color: var(--text-dim); display: flex; align-items: center; gap: 4px; font-weight: 600; }
        
        .card-title { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 20px; }
        
        .card-price { display: flex; flex-direction: column; margin-bottom: 24px; }
        .card-price .label { font-size: 10px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px; }
        .card-price .value { font-size: 20px; font-weight: 900; color: #fff; }
        
        .details-button { width: 100%; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .details-button:hover { background: rgba(255,255,255,0.08); border-color: var(--primary); }

        /* Modal Premium Styling */
        .modal-overlay-premium { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card-premium { width: 100%; max-width: 900px; background: #0c0e14; border-radius: 32px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,0.5); }
        
        .modal-header { padding: 32px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--border); position: relative; }
        .space-badge-icon { width: 56px; height: 56px; background: var(--primary); color: #000; border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(251, 191, 36, 0.2); }
        .header-text h3 { font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .type-meta { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .close-x { position: absolute; right: 24px; top: 24px; background: transparent; border: none; color: var(--text-dim); cursor: pointer; transition: 0.2s; }
        .close-x:hover { color: #fff; transform: rotate(90deg); }

        .modal-content-grid { display: grid; grid-template-columns: 1fr 1.2fr; padding: 32px; gap: 32px; min-height: 400px; }
        .section-title-sm { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }

        .info-list-glass { display: flex; flex-direction: column; gap: 16px; }
        .info-entry { padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); }
        .info-entry.highlight { background: rgba(251, 191, 36, 0.03); border-color: rgba(251, 191, 36, 0.1); }
        .info-entry label { font-size: 10px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px; display: block; }
        .info-entry strong { font-size: 16px; color: #fff; font-weight: 700; }
        .info-entry.highlight strong { color: var(--primary); font-size: 20px; font-weight: 900; }

        .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; }
        .status-pill.available { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        
        .client-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .client-avatar { width: 44px; height: 44px; background: #2563eb; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .client-names { display: flex; flex-direction: column; }
        .client-names strong { font-size: 18px; color: #fff; }
        .client-names span { font-size: 13px; color: var(--text-muted); }

        .sale-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .data-box { background: rgba(255,255,255,0.02); padding: 16px; border-radius: 16px; border: 1px solid var(--border); }
        .data-box.gold { border-color: rgba(251, 191, 36, 0.2); background: rgba(251, 191, 36, 0.05); }
        .data-box label { font-size: 9px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .data-box strong { font-size: 14px; color: #fff; }
        .data-box.gold strong { color: var(--primary); font-size: 18px; font-weight: 900; }

        .status-text { font-size: 11px; font-weight: 800; }
        .status-text.paid { color: #10b981; text-transform: uppercase; }

        .sale-actions-modal { display: flex; gap: 10px; }
        .btn-secondary-sm { flex: 1; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-secondary-sm:hover { border-color: #fff; }

        .modal-footer-premium { padding: 24px 32px; background: rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); }
        .footer-notes { font-size: 11px; color: var(--text-dim); font-style: italic; }
        .footer-buttons { display: flex; gap: 12px; }
        
        .btn-minimal { background: transparent; border: none; color: var(--text-dim); font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-minimal:hover { color: #fff; }
        .btn-gold-action { background: var(--primary); color: #000; padding: 12px 24px; border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px; border: none; cursor: pointer; transition: 0.2s; }
        .btn-gold-action:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(251, 191, 36, 0.2); }

        .loading-details, .loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-dim); }
        .spinner, .mini-spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

export default AdSpaces
