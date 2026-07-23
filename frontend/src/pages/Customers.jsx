import React, { useState, useEffect } from 'react'
import { Plus, Search, UserPlus, Mail, Phone, Building, Edit2, Trash2, X } from 'lucide-react'
import api from '../api'

const Customers = () => {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', is_partner: false, is_company: false, document: '' })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = () => {
    api.get('/clients')
      .then(res => res.json())
      .then(setClients)
  }

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({ 
        name: client.name, 
        email: client.email || '', 
        phone: client.phone || '', 
        company: client.company || '',
        is_partner: !!client.is_partner,
        is_company: !!client.is_company,
        document: client.document || ''
      })
    } else {
      setEditingClient(null)
      setFormData({ name: '', email: '', phone: '', company: '', is_partner: false, is_company: false, document: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const endpoint = editingClient 
      ? `/clients/${editingClient.id}` 
      : '/clients'
    
    const method = editingClient ? 'put' : 'post'

    api[method](endpoint, formData)
    .then(() => {
      fetchClients()
      setShowModal(false)
    })
  }

  const handleDelete = (id) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      api.delete(`/clients/${id}`)
        .then(() => fetchClients())
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="customers-page animate-fade">
      <header className="page-header flex justify-between align-center mb-40">
        <div className="info">
          <h1>Base de Clientes</h1>
          <p>Gerencie informações de contato e faturamento dos seus expositores.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} /> Novo Cliente
        </button>
      </header>

      <div className="glass p-24 px-40 mb-40 flex align-center gap-24 search-container">
        <Search size={22} className="color-muted" />
        <input 
          className="clean-input flex-1" 
          placeholder="Pesquisar por nome, e-mail ou empresa..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass overflow-hidden container-table">
        <table className="custom-table w-full">
          <thead>
            <tr>
              <th className="pl-32">Cliente</th>
              <th>Empresa</th>
              <th>Contato</th>
              <th className="text-right pr-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} className="row-hover">
                <td className="pl-32">
                  <div className="flex align-center gap-12">
                    <div className="avatar-circle">{(client.name || '?')[0]}</div>
                    <div className="flex-column">
                      <span className="font-bold">{client.name}</span>
                      <span className="text-xs color-muted">ID #{client.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex-column gap-4">
                    <div className="flex align-center gap-8">
                      <Building size={14} className="color-muted" />
                      <span className="text-sm font-medium">
                        {(client.is_company || client.company) ? (client.company || 'Empresa') : 'Pessoa Física'}
                      </span>
                    </div>
                    {client.document && (
                      <span className="text-xs color-muted font-mono">{client.document}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex-column gap-4">
                    {client.email && <span className="flex align-center gap-6 text-xs color-muted"><Mail size={12}/> {client.email}</span>}
                    {client.phone && <span className="flex align-center gap-6 text-xs color-muted"><Phone size={12}/> {client.phone}</span>}
                    {client.is_partner ? (
                      <span className="badge-partner-mini mt-4">SÓCIO</span>
                    ) : (
                      <span className="badge-standard-mini mt-4">COMUM</span>
                    )}
                  </div>
                </td>
                <td className="text-right pr-32">
                   <div className="flex justify-end gap-12">
                      <button className="action-button" onClick={() => handleOpenModal(client)}><Edit2 size={16} strokeWidth={2.5}/></button>
                      <button className="action-button hover-error" onClick={() => handleDelete(client.id)}><Trash2 size={16} strokeWidth={2.5}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass modal-content animate-slideUp">
            <div className="modal-header flex justify-between align-center mb-24">
              <h2>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-column gap-20">
              <div className="form-group">
                <label>Nome Completo / Razão Social</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Tipo de Cliente</label>
                <div className="flex gap-24 mt-8">
                  <label className="flex align-center gap-8 cursor-pointer text-sm" style={{ color: 'white' }}>
                    <input 
                      type="radio" 
                      name="is_company" 
                      checked={!formData.is_company} 
                      onChange={() => setFormData({...formData, is_company: false, company: ''})} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Pessoa Física (CPF)
                  </label>
                  <label className="flex align-center gap-8 cursor-pointer text-sm" style={{ color: 'white' }}>
                    <input 
                      type="radio" 
                      name="is_company" 
                      checked={formData.is_company} 
                      onChange={() => setFormData({...formData, is_company: true})} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Pessoa Jurídica (CNPJ)
                  </label>
                </div>
              </div>
              <div className="form-row flex gap-20">
                {formData.is_company && (
                  <div className="form-group flex-1 animate-fade">
                    <label>Nome da Empresa (Nome Fantasia)</label>
                    <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required={formData.is_company} />
                  </div>
                )}
                <div className="form-group flex-1">
                  <label>{formData.is_company ? 'CNPJ' : 'CPF'}</label>
                  <input 
                    placeholder={formData.is_company ? '00.000.000/0000-00' : '000.000.000-00'} 
                    value={formData.document} 
                    onChange={e => setFormData({...formData, document: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-row flex gap-20">
                <div className="form-group flex-1">
                  <label>Telefone</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group flex-1">
                  <label>E-mail</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group flex align-center gap-12 mt-4">
                <input 
                  type="checkbox" 
                  id="is_partner"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={formData.is_partner} 
                  onChange={e => setFormData({...formData, is_partner: e.target.checked})} 
                />
                <label htmlFor="is_partner" style={{ cursor: 'pointer', marginBottom: 0 }}>Este cliente é um Sócio (20% de desconto)</label>
              </div>
              <div className="modal-actions mt-12 flex justify-end gap-12">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .customers-page { width: 100%; max-width: 1400px; }
        .avatar-circle { width: 40px; height: 40px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); }
        .action-button {
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
        .action-button:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 12px var(--primary-glow);
          transform: translateY(-2px);
        }
        .action-button.hover-error:hover {
          background: rgba(244, 63, 94, 0.1);
          border-color: var(--error);
          color: var(--error);
          box-shadow: 0 0 12px rgba(244, 63, 94, 0.4);
          transform: translateY(-2px);
        }
        .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content { width: 100%; max-width: 580px; padding: 48px; border-radius: 28px; }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        
        .flex { display: flex; }
        .flex-1 { flex: 1; }
        .flex-column { display: flex; flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .justify-end { justify-content: flex-end; }
        .align-center { align-items: center; }
        .gap-12 { gap: 12px; }
        .gap-16 { gap: 16px; }
        .gap-20 { gap: 20px; }
        .gap-8 { gap: 8px; }
        .mb-40 { margin-bottom: 40px; }
        .mt-12 { margin-top: 12px; }
        .clean-input { border: none; background: transparent; color: white; font-size: 16px; }
        .clean-input:focus { outline: none; }

        .pl-32 { padding-left: 32px !important; }
        .pr-32 { padding-right: 32px !important; }

        .custom-table th { background: rgba(255,255,255,0.01); text-align: left; padding: 20px 24px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; }
        .custom-table td { padding: 24px 24px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .row-hover:hover { background: rgba(255,255,255,0.02); }
        .badge-partner-mini { font-size: 9px; font-weight: 800; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 2px 8px; border-radius: 4px; display: inline-block; width: fit-content; }
        .badge-standard-mini { font-size: 9px; font-weight: 800; background: rgba(255,255,255,0.05); color: var(--text-muted); padding: 2px 8px; border-radius: 4px; display: inline-block; width: fit-content; }
      `}</style>
    </div>
  )
}

export default Customers
