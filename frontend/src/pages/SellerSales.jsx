import React, { useState, useEffect } from 'react'
import { Search, User, Package, Plus, Trash2, CheckCircle2, ShoppingCart, ChevronRight, X, ArrowUpRight, CreditCard, Wallet, LogOut, History, Clock, AlertCircle, FileEdit, Repeat, Layers, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SellerSales = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Client, 2: Products, 3: Checkout
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mySales, setMySales] = useState([])
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [historySearch, setHistorySearch] = useState('')
  const [selectedStatusToUpdate, setSelectedStatusToUpdate] = useState({})
  const [observations, setObservations] = useState('')
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', phone: '', is_partner: false })
  const [lastSale, setLastSale] = useState(null)

  useEffect(() => {
    fetchList()
  }, [step])

  useEffect(() => {
    if (searchTerm.length > 1) {
      const delayDebounceFn = setTimeout(() => {
        fetchList(searchTerm)
      }, 400)
      return () => clearTimeout(delayDebounceFn)
    } else if (searchTerm.length === 0) {
      fetchList()
    }
  }, [searchTerm])

  const fetchList = async (query = '') => {
    setLoading(true)
    try {
      const endpoint = step === 1 
        ? (query ? `/clients/search?q=${query}` : '/clients') 
        : (query ? `/spaces/search?q=${query}` : '/spaces');
      
      const res = await api.get(endpoint)
      let data = await res.json()
      
      if (step === 1) {
        setClients(data || [])
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.role !== 'admin' && user.seller_function) {
           // Função para remover acentos e normalizar texto
           const normalize = (str) => (str || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
           
           const allowedFunctions = user.seller_function.split(',').map(f => normalize(f));
           data = (data || []).filter(product => {
             const typeName = normalize(product.type_name);
             return allowedFunctions.some(func => 
               typeName === func || 
               typeName === func + 's' || 
               func === typeName + 's' ||
               typeName.includes(func) // Permite busca parcial (ex: "Mesas" dentro de "Mesas de rodapé")
             );
           });
        }
        setProducts(data || [])
      }
    } catch (err) {
      console.error("Erro ao buscar dados", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMySales = async () => {
    setLoading(true)
    try {
      const res = await api.get('/sales/me')
      const data = await res.json()
      setMySales(data || [])
    } catch (err) {
      console.error("Erro ao buscar minhas vendas", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = mySales.filter(sale => 
    sale.client_name?.toLowerCase().includes(historySearch.toLowerCase()) ||
    sale.id.toString().includes(historySearch)
  )

  const handleUpdateStatus = async (saleId, status) => {
    // Only proceed if the user actually clicked the final "Confirm" button
    // This function will now be called by the confirm button
    setUpdatingStatus(saleId)
    try {
      const res = await api.put(`/sales/${saleId}/status`, { status })
      const data = await res.json()
      if (data.success) {
        fetchMySales()
        // Clear selection
        const newSelections = { ...selectedStatusToUpdate }
        delete newSelections[saleId]
        setSelectedStatusToUpdate(newSelections)
      } else {
        alert('Erro ao atualizar status: ' + (data.error || 'Falha desconhecida'))
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleStatusSelect = (saleId, status) => {
    setSelectedStatusToUpdate({ ...selectedStatusToUpdate, [saleId]: status })
  }

  const handleCreateClient = async (e) => {
    e.preventDefault()
    if (!newClient.name) return alert('O nome é obrigatório')
    setLoading(true)
    try {
      const res = await api.post('/clients', newClient)
      const data = await res.json()
      if (data.success) {
        setSelectedClient({ ...newClient, id: data.id })
        setStep(2)
        setShowNewClientForm(false)
        setNewClient({ name: '', email: '', company: '', phone: '', is_partner: false })
        setSearchTerm('')
      } else {
        alert('Erro ao criar cliente')
      }
    } catch (err) {
      alert('Erro na conexão')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients
  const filteredProducts = products 


  const addToCart = (product) => {
    if (!cart.find(item => item.id === product.id)) {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    setSearchTerm('')
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const getItemPrice = (item) => {
    if (selectedClient?.is_partner && item.allows_discount) {
      return item.base_price * 0.8
    }
    return item.base_price
  }

  const getTotal = () => cart.reduce((acc, item) => acc + (getItemPrice(item) * item.quantity), 0)

  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [saleStatus, setSaleStatus] = useState('pending')

  const handleFinish = async () => {
    if (!selectedClient || cart.length === 0) return
    
    setLoading(true)
    const userString = localStorage.getItem('user')
    const user = userString ? JSON.parse(userString) : { id: 1 }

    const payload = {
      client_id: selectedClient.id,
      user_id: user.id || 1,
      event_id: 1, // Default event
      total_price: getTotal(),
      payment_method: paymentMethod,
      status: saleStatus,
      observations: observations,
      items: cart.map(item => ({ id: item.id, price: getItemPrice(item), quantity: item.quantity }))
    }

    try {
      const res = await api.post('/sales', payload)
      const data = await res.json()
      if (data.success) {
        setLastSale({
          id: data.id,
          client_name: selectedClient.name,
          company: selectedClient.company,
          email: selectedClient.email,
          phone: selectedClient.phone,
          total_price: getTotal(),
          payment_method: paymentMethod,
          status: saleStatus,
          seller_name: user.name || 'Vendedor',
          items: [...cart]
        })
        setSuccess(true)
        setCart([])
        setSelectedClient(null)
        setStep(1)
        setObservations('')
      } else {
        alert('Erro: ' + (data.error || 'Falha ao salvar venda'))
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handlePrintReceipt = (saleData) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const items = saleData.items || (saleData.item_names ? saleData.item_names.split(',').map(name => ({ name: name.trim() })) : [{ name: 'Espaço / Serviço' }]);
    
    const itemsHtml = items.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">
        <span style="color: #444; font-weight: 500;">Espaço / Categoria: <strong>${item.name}</strong></span>
        <span style="font-weight: 700; color: #000;">1 UN</span>
      </div>
    `).join('');

    const statusLabel = saleData.status === 'paid' ? 'LIQUIDADO' : 'PENDENTE';
    const statusColor = saleData.status === 'paid' ? '#10b981' : '#f59e0b';
    const statusBg = saleData.status === 'paid' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprovante de Venda - ${saleData.id}</title>
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img src="${window.location.origin}/logo.png" style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px;" alt="Logo" />
              <div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 900;">EXPOVALE APRF</h1>
                <p style="margin: 5px 0 0; font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase;">Comprovante de Operação Financeira</p>
              </div>
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
              <label>Tipo de Registro</label>
              <span>${saleData.company || 'Investidor Individual'}</span>
            </div>
            <div class="data-item">
              <label>Data Transação</label>
              <span>${new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="data-item">
              <label>Meio de Pagamento</label>
              <span>${saleData.payment_method.toUpperCase()}</span>
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
            <span class="total-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleData.total_price)}</span>
          </div>

          <div class="footer">
            <div class="vendedor-info">
              <h4>Responsável: ${saleData.seller_name}</h4>
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
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleShareWhatsApp = (saleData) => {
    const items = saleData.items || (saleData.item_names ? saleData.item_names.split(',').map(name => ({ name: name.trim() })) : [{ name: 'Espaço / Serviço' }]);
    
    const text = `*EXPOVALE APRF*
Confirmação de Reserva e Contrato

*Cliente:* ${saleData.client_name}
*Pedido:* #${saleData.id.toString().padStart(4, '0')}
*Itens:*
${items.map(item => `- ${item.name}`).join('\n')}

*Total:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleData.total_price)}
*Status:* ${saleData.status === 'paid' ? 'Liquidado ✅' : 'Pendente ⏳'}

Obrigado por fechar negócio conosco!`;

    const encoded = encodeURIComponent(text);
    const url = saleData.phone ? `https://wa.me/${saleData.phone.replace(/\D/g, '')}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (success && lastSale) {
    return (
      <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: '#020617', zIndex: 9999, padding: '24px' 
      }}>
         <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="glass"
            style={{ 
              maxWidth: '400px', width: '100%', padding: '60px 32px', 
              textAlign: 'center', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' 
            }}
         >
            <div className="success-icon-wrapper mb-32">
               <CheckCircle2 size={80} className="color-primary" />
            </div>
            <h2 className="text-3xl font-black mb-16 text-white tracking-tight">Venda Concluída!</h2>
            <p className="color-muted mb-40 text-sm opacity-60 leading-relaxed">O contrato foi gerado e o espaço foi reservado com sucesso no sistema.</p>
            
            <div className="flex-column gap-12 mb-32">
              <button className="btn btn-primary w-full py-16 font-bold flex align-center justify-center gap-8" onClick={() => handlePrintReceipt(lastSale)}>
                <FileEdit size={18} /> Salvar/Imprimir Recibo PDF
              </button>
              <button className="btn w-full py-16 font-bold flex align-center justify-center gap-8" style={{ background: '#25D366', color: '#fff', border: 'none' }} onClick={() => handleShareWhatsApp(lastSale)}>
                <MessageCircle size={18} /> Enviar Info via WhatsApp
              </button>
            </div>

            <button className="btn-text w-full py-20 font-black color-muted" onClick={() => { setSuccess(false); setLastSale(null); window.location.reload(); }}>VOLTAR AO TERMINAL</button>
         </motion.div>
      </div>
    )
  }

  return (
    <div className="mobile-view">
      {/* Header */}
      <header className="mobile-header-top glass">
        <div className="header-content">
          <div className="flex align-center justify-between w-full">
            <button 
              onClick={() => { setStep(step === 4 ? 1 : 4); if (step !== 4) fetchMySales() }} 
              className={`history-btn-premium ${step === 4 ? 'active' : ''}`}
            >
               {step === 4 ? <ShoppingCart size={16} /> : <History size={16} />}
               <span>{step === 4 ? 'Vender' : 'Minhas Vendas'}</span>
            </button>
            <button onClick={handleLogout} className="logout-btn-premium">
               <LogOut size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '8px' }}>
            <img src="/logo.png" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} alt="Logo" />
          </div>
          <h1 className="terminal-title">Terminal de Vendas</h1>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="stepper px-20">
        <div className={`step-item ${step >= 1 && step < 4 ? 'active' : ''}`}>Cliente</div>
        <div className="step-divider" />
        <div className={`step-item ${step >= 2 && step < 4 ? 'active' : ''}`}>Produtos</div>
        <div className="step-divider" />
        <div className={`step-item ${step >= 3 && step < 4 ? 'active' : ''}`}>Revisão</div>
      </div>

      <div className="content-scroll px-20 py-20">
        {step === 1 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="step-container">
            {showNewClientForm ? (
              <div className="new-client-form glass p-20 rounded-20 animate-fade">
                <div className="flex justify-between align-center mb-20">
                  <h3 className="text-xl font-black text-white">Novo Cliente</h3>
                  <button className="btn-text text-sm color-muted" onClick={() => setShowNewClientForm(false)}>Voltar</button>
                </div>
                <form onSubmit={handleCreateClient} className="flex-column gap-16">
                  <input className="input-group-mobile glass text-white w-full" style={{ padding: '16px' }} placeholder="Nome Completo *" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required />
                  <input className="input-group-mobile glass text-white w-full" style={{ padding: '16px' }} placeholder="Email (Opcional)" type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                  <input className="input-group-mobile glass text-white w-full" style={{ padding: '16px' }} placeholder="Telefone / WhatsApp (Opcional)" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                  <input className="input-group-mobile glass text-white w-full" style={{ padding: '16px' }} placeholder="Empresa / CNPJ (Opcional)" value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})} />
                  
                  <div className="flex align-center gap-12 mt-8 px-8">
                    <input 
                      type="checkbox" 
                      id="is_partner_mobile"
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      checked={newClient.is_partner} 
                      onChange={e => setNewClient({...newClient, is_partner: e.target.checked})} 
                    />
                    <label htmlFor="is_partner_mobile" style={{ cursor: 'pointer', marginBottom: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                      Este cliente é um Sócio (20% de desconto)
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary w-full py-16 mt-8 font-black uppercase tracking-widest" disabled={loading}>
                    {loading ? 'Salvando...' : 'Cadastrar e Continuar'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className={`input-group-mobile glass ${searchTerm ? 'focused' : ''}`}>
                  <Search size={20} className="color-muted" />
                  <input 
                    placeholder="Pesquise o cliente por nome..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>

                <div className="list-container mt-20">
                  {filteredClients.length > 0 ? filteredClients.map(client => (
                    <div key={client.id} className="glass list-item animate-slideUp" onClick={() => { setSelectedClient(client); setStep(2); setSearchTerm('') }}>
                      <div className="item-icon"><User size={20} className="color-primary" /></div>
                      <div className="item-info">
                        <strong>{client.name}</strong>
                        <span>{client.company || 'Pessoa Física'}</span>
                      </div>
                      <ChevronRight size={20} className="color-muted opacity-50" />
                    </div>
                  )) : searchTerm.length > 1 && !loading ? (
                    <div className="text-center py-40">
                      <p className="color-muted italic mb-16">Nenhum cliente encontrado.</p>
                      <button className="btn btn-primary py-12 px-24 font-bold text-sm" onClick={() => setShowNewClientForm(true)}>
                         <Plus size={16} className="mr-8 inline" style={{ verticalAlign: 'middle', marginRight: '8px' }}/> 
                         Cadastrar Cliente
                      </button>
                    </div>
                  ) : null}
                  
                  {!searchTerm && !loading && (
                    <div className="text-center mt-32">
                      <button className="btn-text color-primary text-sm font-bold" onClick={() => setShowNewClientForm(true)}>
                        <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Cadastrar Novo Cliente
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="step-container">
            <div className="selected-client-banner glass mb-20" onClick={() => setStep(1)}>
              <div className="info">
                <span>Cliente selecionado</span>
                <strong>{selectedClient?.name}</strong>
              </div>
              <div className="edit-badge">Alterar</div>
            </div>

            <div className={`input-group-mobile glass ${searchTerm ? 'focused' : ''}`}>
              <Search size={20} className="color-muted" />
              <input 
                placeholder="Qual espaço deseja vender?" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="list-container mt-20">
              {filteredProducts.map(product => (
                <div key={product.id} className="glass list-item animate-slideUp" onClick={() => addToCart(product)}>
                  <div className="item-icon"><Package size={20} className="color-accent" /></div>
                  <div className="item-info">
                    <strong>{product.name}</strong>
                    <span className="price">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.base_price)}</span>
                  </div>
                  <div className="plus-btn-circle"><Plus size={18} /></div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="step-container">
             <div className="review-receipt-card glass overflow-hidden">
                <div className="receipt-header p-32">
                   <div className="flex justify-between align-center mb-24">
                      <h3 className="text-xl font-extrabold uppercase tracking-widest text-white border-left-gold pl-12">Recibo de Venda</h3>
                      <div className="badge-pending">Revisão</div>
                   </div>
                   <div className="client-box p-24 rounded-20 bg-alpha-10 border-gold-subtle">
                      <div className="flex align-center gap-12 mb-12">
                        <User size={16} className="color-primary" />
                        <span className="text-xs uppercase font-black color-primary tracking-widest">Contratante</span>
                      </div>
                      <strong className="text-xl block text-white mb-8 pr-12">{selectedClient?.name}</strong>
                      <div className="flex-column gap-8 text-xs color-muted">
                        <div className="flex align-center gap-6">
                           <span className="text-white opacity-40 font-bold min-w-60">Empresa:</span>
                           <span className="text-white opacity-80">{selectedClient?.company || 'Pessoa Física'}</span>
                        </div>
                        <div className="flex align-center gap-6">
                           <span className="text-white opacity-40 font-bold min-w-60">Contato:</span>
                           <span className="text-white opacity-80">{selectedClient?.email}</span>
                        </div>
                        {selectedClient?.is_partner && (
                          <div className="flex align-center gap-6 mt-4">
                             <div className="badge-partner">SÓCIO ATIVO - 20% OFF</div>
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                <div className="receipt-body p-32 pt-0">
                  <div className="items-list mb-32">
                    <span className="text-xs uppercase font-black color-muted mb-20 block tracking-widest">Produtos Adicionados</span>
                    {cart.map(item => (
                      <div key={item.id} className="receipt-item py-24 flex justify-between align-start">
                        <div className="info flex-1 pr-20">
                          <strong className="block text-lg text-white mb-6 leading-tight">{item.name}</strong>
                          <span className="text-xs color-muted block font-medium">Serviço de Mídia & Publicidade</span>
                        </div>
                        <div className="flex-column align-end gap-16">
                           <div className="flex-column align-end">
                              {selectedClient?.is_partner && item.allows_discount && (
                                <span className="text-xs color-muted line-through opacity-50">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.base_price)}
                                </span>
                              )}
                              <strong className="text-lg color-primary font-black">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getItemPrice(item))}
                              </strong>
                           </div>
                           <button className="remove-icon-btn flex align-center gap-8" onClick={() => removeFromCart(item.id)}>
                              <Trash2 size={16}/> <span className="text-tiny font-black">REMOVER</span>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="payment-selector">
                     <span className="text-xs uppercase font-black color-muted mb-16 block tracking-widest text-center">Forma de Recebimento</span>
                     <div className="grid-3 gap-16">
                        <div className={`pay-option ${paymentMethod === 'pix' ? 'active' : ''}`} onClick={() => setPaymentMethod('pix')}>
                           <ArrowUpRight size={24} />
                           <span>PIX ONLINE</span>
                        </div>
                        <div className={`pay-option ${paymentMethod === 'credito' ? 'active' : ''}`} onClick={() => setPaymentMethod('credito')}>
                           <CreditCard size={24} />
                           <span>CARTÃO</span>
                        </div>
                        <div className={`pay-option ${paymentMethod === 'dinheiro' ? 'active' : ''}`} onClick={() => setPaymentMethod('dinheiro')}>
                           <Wallet size={24} />
                           <span>DINHEIRO</span>
                        </div>
                        <div className={`pay-option ${paymentMethod === 'cheque' ? 'active' : ''}`} onClick={() => setPaymentMethod('cheque')}>
                           <FileEdit size={24} />
                           <span>CHEQUE</span>
                        </div>
                        <div className={`pay-option ${paymentMethod === 'haver' ? 'active' : ''}`} onClick={() => setPaymentMethod('haver')}>
                           <Repeat size={24} />
                           <span>HAVER</span>
                        </div>
                        <div className={`pay-option ${paymentMethod === 'misto' ? 'active' : ''}`} onClick={() => setPaymentMethod('misto')}>
                           <Layers size={24} />
                           <span>2 FORMAS</span>
                        </div>
                     </div>

                     <div className="observation-box mt-20">
                        <span className="text-xs uppercase font-black color-muted mb-8 block tracking-widest text-center">Status do Pagamento</span>
                        <div className="flex gap-16 justify-center">
                           <button 
                             className={`btn ${saleStatus === 'pending' ? 'btn-primary' : 'btn-ghost glass'}`} 
                             onClick={() => setSaleStatus('pending')}
                             style={{ flex: 1, padding: '12px' }}
                           >Pendente</button>
                           <button 
                             className={`btn ${saleStatus === 'paid' ? 'btn-primary' : 'btn-ghost glass'}`} 
                             onClick={() => setSaleStatus('paid')}
                             style={{ flex: 1, padding: '12px' }}
                           >Já Liquidado (Pago)</button>
                        </div>
                     </div>

                     <div className="observation-box mt-20">
                        <span className="text-xs uppercase font-black color-muted mb-8 block tracking-widest text-center">Observações</span>
                        <textarea 
                           className="glass w-full p-16 rounded-16 text-white text-sm" 
                           placeholder={paymentMethod === 'misto' ? "Descreva aqui as duas formas de pagamento utilizadas..." : "Alguma observação importante para esta venda?"}
                           rows="3"
                           value={observations}
                           onChange={(e) => setObservations(e.target.value)}
                           style={{ border: paymentMethod === 'misto' && !observations ? '1px solid var(--error)' : '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', outline: 'none' }}
                        />
                        {paymentMethod === 'misto' && !observations && (
                           <span className="text-tiny color-error mt-4 block">Obrigatório descrever as formas de pagamento.</span>
                        )}
                     </div>
                  </div>
                </div>
                
                <div className="receipt-footer p-32 bg-white-alpha-2 border-top flex justify-between align-center">
                    <div className="total-label-box">
                       <span className="text-xs uppercase font-black color-muted tracking-widest block mb-4">TOTAL LÍQUIDO</span>
                       <span className="text-tiny color-success font-black">VALOR FINAL DO CONTRATO</span>
                    </div>
                    <strong className="text-4xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotal())}</strong>
                </div>
             </div>
          </motion.div>
        )}
        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="step-container"
          >
            <div className="section-header mb-24">
              <div className="flex-column">
                <h3 className="text-2xl font-black text-white mb-4">Seu Histórico</h3>
                <span className="text-xs color-muted font-bold tracking-widest uppercase">Gerencie suas vendas realizadas</span>
              </div>
            </div>

            <div className="search-history-container mb-24">
               <div className="input-group-mobile glass search-glow">
                  <Search size={20} className="opacity-40" />
                  <input 
                    type="text" 
                    placeholder="Buscar por cliente ou código..." 
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                  {historySearch && <X size={18} onClick={() => setHistorySearch('')} className="cursor-pointer opacity-40" />}
               </div>
            </div>

            <div className="sales-history-list">
              {filteredHistory.length > 0 ? filteredHistory.map((sale, idx) => (
                <motion.div 
                  key={sale.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="premium-sale-card glass mb-20"
                >
                  <div className="card-header p-20 border-bottom">
                    <div className="flex justify-between align-center mb-12">
                       <span className="sale-id-badge">VENDA #{sale.id}</span>
                       <span className={`status-pill ${sale.status}`}>
                         {sale.status === 'pending' && 'Pendente'}
                         {sale.status === 'paid' && 'Liquidado'}
                         {sale.status === 'expired' && 'Expirado'}
                         {sale.status === 'refused' && 'Recusado'}
                         {sale.status === 'cancelled' && 'Cancelado'}
                       </span>
                    </div>
                    <strong className="text-xl text-white block mb-4">{sale.client_name}</strong>
                    <div className="flex align-center gap-6 opacity-60">
                       <Clock size={12} className="color-primary" />
                       <span className="text-xs font-medium">{new Date(sale.purchase_date || sale.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="card-body p-20 bg-alpha-2">
                    <div className="items-preview mb-20">
                       <span className="text-tiny color-muted uppercase font-black block mb-8 tracking-widest">Produtos / Espaços</span>
                       <p className="text-sm text-white opacity-80 leading-relaxed italic">{sale.item_names || 'Nenhum detalhe disponível'}</p>
                    </div>
                    
                    <div className="price-summary p-16 rounded-16 bg-white-alpha-3 flex justify-between align-center">
                       <span className="text-xs font-bold color-muted">TOTAL RECEBIDO</span>
                       <strong className="text-2xl color-primary font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_price)}</strong>
                    </div>

                    <div className="receipt-actions-history mt-20 flex gap-12">
                       <button className="btn-ghost glass flex-1 py-12 px-8 rounded-12 text-xs font-bold flex align-center justify-center gap-6" onClick={() => handlePrintReceipt(sale)}>
                          <FileEdit size={14} /> Recibo
                       </button>
                       <button className="btn-ghost glass flex-1 py-12 px-8 rounded-12 text-xs font-bold flex align-center justify-center gap-6" style={{ color: '#25D366' }} onClick={() => handleShareWhatsApp(sale)}>
                          <MessageCircle size={14} /> WhatsApp
                       </button>
                    </div>

                    <div className="status-control-section mt-24">
                       <div className="flex align-center gap-8 mb-16">
                          <div className="h-1 flex-1 bg-white-alpha-5 rounded-full"></div>
                          <span className="text-tiny color-muted font-black uppercase tracking-widest">Alterar Status</span>
                          <div className="h-1 flex-1 bg-white-alpha-5 rounded-full"></div>
                       </div>
                       
                       <div className="status-actions-grid mb-16">
                          {['paid', 'pending', 'expired', 'cancelled'].map(st => (
                            <button 
                              key={st}
                              className={`status-action-btn ${st} ${selectedStatusToUpdate[sale.id] === st ? 'selected' : ''}`} 
                              onClick={() => handleStatusSelect(sale.id, st)}
                            >
                              {st === 'paid' && 'Pago'}
                              {st === 'pending' && 'Pendente'}
                              {st === 'expired' && 'Expirado'}
                              {st === 'cancelled' && 'Cancelado'}
                            </button>
                          ))}
                       </div>

                       <AnimatePresence>
                         {selectedStatusToUpdate[sale.id] && selectedStatusToUpdate[sale.id] !== sale.status && (
                           <motion.button 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="btn btn-primary w-full py-16 font-black uppercase tracking-widest text-sm shadow-premium"
                              onClick={() => handleUpdateStatus(sale.id, selectedStatusToUpdate[sale.id])}
                              disabled={updatingStatus === sale.id}
                           >
                              {updatingStatus === sale.id ? 'Atualizando...' : 'Confirmar Alteração'}
                           </motion.button>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )) : !loading && (
                <div className="empty-state glass py-80">
                  <div className="icon-circle mb-20">
                     <AlertCircle size={40} className="opacity-20" />
                  </div>
                  <p className="color-muted font-medium">{historySearch ? 'Nenhum resultado para sua busca.' : 'Nenhuma venda registrada ainda.'}</p>
                  {historySearch && <button className="btn-text mt-12" onClick={() => setHistorySearch('')}>Limpar busca</button>}
                </div>
              )}
            </div>
            <div className="pb-80"></div>
          </motion.div>
        )}
      </div>

      {/* Floating Cart Button & Checkout Bar */}
      <AnimatePresence>
        {cart.length > 0 && step !== 1 && step !== 4 && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }}
            className="mobile-footer-bar glass"
          >
            <div className="total-info">
              <span>Total ({cart.length} itens)</span>
              <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotal())}</strong>
            </div>
            {step === 2 ? (
              <button className="btn btn-primary" onClick={() => setStep(3)}>Revisar</button>
            ) : (
              <button className="btn btn-primary" onClick={handleFinish} disabled={loading || (paymentMethod === 'misto' && !observations)}>
                {loading ? 'Processando...' : 'Finalizar Venda'}
              </button>
            ) }
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .mobile-view {
          background: #000;
          color: white;
          min-height: 100vh;
          max-width: 480px;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .text-2xl { font-size: 24px; }
        .text-3xl { font-size: 32px; }
        .font-black { font-weight: 900; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }

        .mobile-header-top { padding: 32px 20px 24px; border-radius: 0 0 32px 32px; position: relative; background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .header-content { display: flex; flex-direction: column; gap: 16px; position: relative; width: 100%; }
        .terminal-title { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; background: linear-gradient(90deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .logout-btn-premium { width: 44px; height: 44px; border-radius: 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; display: flex; align-items: center; justify-content: center; transition: 0.3s; cursor: pointer; }
        .logout-btn-premium:active { transform: scale(0.9); }
        .history-btn-premium { height: 44px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; transition: 0.3s; cursor: pointer; padding: 0 16px; }
        .history-btn-premium.active { background: var(--primary); color: #000; border: none; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.2); }
        .user-badge-mini { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .user-badge-mini .avatar { width: 28px; height: 28px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 12px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); }

        .stepper { display: flex; align-items: center; gap: 10px; margin-top: 20px; padding-bottom: 5px; }
        .step-item { font-size: 12px; font-weight: 600; color: var(--text-muted); padding: 4px 12px; border-radius: 100px; border: 1px solid transparent; }
        .step-item.active { border-color: var(--primary); color: var(--primary); background: rgba(245, 158, 11, 0.1); }
        .step-divider { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }

        .input-group-mobile { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; transition: border-color 0.2s; }
        .input-group-mobile.focused { border-color: var(--primary); }
        .input-group-mobile input { background: none; border: none; color: white; width: 100%; font-size: 16px; }
        .input-group-mobile input:focus { outline: none; }

        .list-container { display: flex; flex-direction: column; gap: 12px; }
        .list-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 16px; cursor: pointer; }
        .item-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .item-info { flex: 1; display: flex; flex-direction: column; }
        .item-info strong { font-size: 15px; }
        .item-info span { font-size: 12px; color: var(--text-muted); }
        .item-info .price { color: var(--primary); font-weight: 700; margin-top: 2px; }

        .selected-client-banner { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-radius: 20px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); }
        .selected-client-banner .info span { font-size: 10px; text-transform: uppercase; color: var(--primary); font-weight: 800; display: block; }
        .selected-client-banner .info strong { font-size: 16px; }
        .edit-badge { background: var(--primary); color: black; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }

        .plus-btn-circle { width: 32px; height: 32px; background: rgba(251, 191, 36, 0.1); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        /* Receipt Card Styles */
        .review-receipt-card { border-radius: 28px; border: 1px solid var(--border); background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%); }
        .bg-alpha-5 { background: rgba(255,255,255,0.02); }
        .border-top { border-top: 1px solid var(--border); }
        .badge-pending { background: rgba(251, 191, 36, 0.1); color: var(--primary); font-size: 10px; font-weight: 800; padding: 6px 14px; border-radius: 100px; text-transform: uppercase; }
        
        .border-left-gold { border-left: 4px solid var(--primary); }
        .border-gold-subtle { border: 1px solid rgba(251, 191, 36, 0.2); }
        .bg-white-alpha-2 { background: rgba(255,255,255,0.02); }
        .align-start { align-items: flex-start; }
        .align-end { align-items: flex-end; }
        .mb-4 { margin-bottom: 4px; }
        .mb-8 { margin-bottom: 8px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-24 { margin-bottom: 24px; }
        .mb-32 { margin-bottom: 32px; }
        .p-16 { padding: 16px; }
        .p-20 { padding: 20px; }
        .p-24 { padding: 24px; }
        .p-32 { padding: 32px; }
        .rounded-20 { border-radius: 20px; }
        .gap-2 { gap: 2px; }
        .gap-4 { gap: 4px; }
        .gap-6 { gap: 6px; }
        .gap-8 { gap: 8px; }
        .gap-12 { gap: 12px; }
        .gap-16 { gap: 16px; }
        .min-w-60 { min-width: 60px; display: inline-block; }
        .opacity-80 { opacity: 0.8; }

        .receipt-item { border-bottom: 1px dashed rgba(255,255,255,0.1); }
        .receipt-item:last-child { border-bottom: none; }
        .remove-icon-btn { background: none; border: none; color: var(--error); opacity: 0.5; cursor: pointer; transition: 0.2s; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .remove-icon-btn:hover { opacity: 1; transform: translateX(5px); }

        .payment-selector .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .pay-option { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; color: var(--text-muted); }
        .pay-option span { font-size: 11px; font-weight: 700; }
        .pay-option.active { border-color: var(--primary); background: rgba(251, 191, 36, 0.1); color: var(--primary); box-shadow: 0 8px 20px rgba(245, 158, 11, 0.15); transform: translateY(-4px); }

        .mobile-footer-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto; padding: 24px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 32px 32px 0 0; z-index: 2000; box-shadow: 0 -15px 40px rgba(0,0,0,0.8); background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); }
        .total-info { display: flex; flex-direction: column; }
        .total-info span { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
        .total-info strong { font-size: 22px; font-weight: 900; }

        .success-icon-wrapper { width: 140px; height: 140px; background: rgba(251, 191, 36, 0.05); border-radius: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 1px solid rgba(251, 191, 36, 0.1); transform: rotate(-10deg); }
        .flex-center { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          z-index: 3000;
          padding: 20px; 
        }
        .success-card { padding: 60px 32px; border-radius: 40px; width: 100%; border: 1px solid var(--border); }
        
        .px-20 { padding-left: 20px; padding-right: 20px; }
        .py-20 { padding-top: 20px; padding-bottom: 20px; }
        .mt-4 { margin-top: 4px; }
        .mt-12 { margin-top: 12px; }
        .mt-20 { margin-top: 20px; }
        .mt-32 { margin-top: 32px; }
        .mb-20 { margin-bottom: 20px; }
        .text-center { text-align: center; }
        .flex-column { display: flex; flex-direction: column; }
        .success-card { padding: 60px 32px; border-radius: 40px; width: 100%; max-width: 400px; border: 1px solid var(--border); margin: 0 auto; }
        .btn-primary.w-full { width: 100%; }
        .min-h-vh { min-height: 100vh; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .flex { display: flex; }
        .align-center { align-items: center; }
        .w-full { width: 100%; }
        .rounded-16 { border-radius: 16px; }
        .opacity-50 { opacity: 0.5; }
        .text-tiny { font-size: 8px; letter-spacing: 0.1em; }
        .leading-tight { line-height: 1.2; }
        .pr-20 { padding-right: 20px; }
        .mb-6 { margin-bottom: 6px; }
        .mb-12 { margin-bottom: 12px; }
        .mb-20 { margin-bottom: 20px; }
        .color-success { color: #10b981; }
        .font-medium { font-weight: 500; }
        .opacity-40 { opacity: 0.4; }
        .font-bold { font-weight: 700; }
        .gap-6 { gap: 6px; }
        .line-through { text-decoration: line-through; }
        .badge-partner { background: #10b981; color: black; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .color-error { color: #ef4444; }

        /* Premium History Styles */
        .premium-sale-card { border-radius: 28px; border: 1px solid rgba(255,255,255,0.06); background: linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%); overflow: hidden; }
        .sale-id-badge { background: rgba(255,255,255,0.05); color: #fff; font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); letter-spacing: 0.05em; }
        .status-pill { font-size: 10px; font-weight: 900; padding: 6px 14px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.02em; }
        .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: var(--primary); border: 1px solid rgba(245, 158, 11, 0.2); }
        .status-pill.paid { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-pill.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .status-pill.cancelled { background: rgba(100, 116, 139, 0.1); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.2); }
        
        .bg-alpha-2 { background: rgba(255,255,255,0.02); }
        .bg-white-alpha-3 { background: rgba(255,255,255,0.03); }
        .status-actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .status-action-btn { height: 48px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; transition: 0.3s; cursor: pointer; }
        .status-action-btn:active { transform: scale(0.96); }
        .status-action-btn.paid:hover { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.4); color: #10b981; }
        .status-action-btn.pending:hover { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.4); color: var(--primary); }
        .status-action-btn.expired:hover { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.4); color: #ef4444; }
        .status-action-btn.cancelled:hover { background: rgba(100, 116, 139, 0.1); border-color: rgba(100, 116, 139, 0.4); color: #94a3b8; }
        .status-action-btn.selected { border-color: var(--primary); background: rgba(245, 158, 11, 0.1); color: var(--primary); box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); }
        .status-action-btn.loading { opacity: 0.5; pointer-events: none; }
        
        .shadow-premium { box-shadow: 0 10px 30px rgba(245, 158, 11, 0.25); }
        .search-glow:focus-within { border-color: var(--primary); box-shadow: 0 0 20px rgba(245, 158, 11, 0.1); }

        .empty-state { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 28px; }
        .icon-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: center; }
        .pb-80 { padding-bottom: 80px; }
        .h-1 { height: 1px; }
      `}</style>
    </div>
  )
}

export default SellerSales
