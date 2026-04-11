import React, { useState, useEffect } from 'react'
import { Search, User, Package, Plus, Trash2, CheckCircle2, ShoppingCart, ChevronRight, X, ArrowUpRight, CreditCard, Wallet, LogOut } from 'lucide-react'
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
      const data = await res.json()
      
      if (step === 1) setClients(data || [])
      else setProducts(data || [])
    } catch (err) {
      console.error("Erro ao buscar dados", err)
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

  const getTotal = () => cart.reduce((acc, item) => acc + (item.base_price * item.quantity), 0)

  const [paymentMethod, setPaymentMethod] = useState('pix')

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
      items: cart.map(item => ({ id: item.id, price: item.base_price, quantity: item.quantity }))
    }

    try {
      const res = await api.post('/sales', payload)
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setCart([])
        setSelectedClient(null)
        setStep(1)
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

  if (success) {
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
            <button className="btn btn-primary w-full py-20 font-black" onClick={() => window.location.reload()}>FINALIZAR E VOLTAR</button>
         </motion.div>
      </div>
    )
  }

  return (
    <div className="mobile-view">
      {/* Header */}
      <header className="mobile-header-top glass">
        <div className="header-content">
          <div className="user-badge-mini">
            <div className="avatar">V</div>
            <span>Vendedor Logado</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
             <LogOut size={16} />
             <span>Sair</span>
          </button>
          <h1 className="text-2xl font-black">Terminal de Vendas</h1>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="stepper px-20">
        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>Cliente</div>
        <div className="step-divider" />
        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>Produtos</div>
        <div className="step-divider" />
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>Revisão</div>
      </div>

      <div className="content-scroll px-20 py-20">
        {step === 1 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="step-container">
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
              )) : searchTerm.length > 1 && !loading && (
                <p className="text-center py-40 color-muted italic">Nenhum cliente encontrado.</p>
              )}
            </div>
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
                           <strong className="text-lg color-primary font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.base_price)}</strong>
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
      </div>

      {/* Floating Cart Button & Checkout Bar */}
      <AnimatePresence>
        {cart.length > 0 && (
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
              <button className="btn btn-primary" onClick={handleFinish} disabled={loading}>
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

        .mobile-header-top { padding: 24px 20px; border-radius: 0 0 24px 24px; position: relative; }
        .header-content { display: flex; flex-direction: column; gap: 8px; position: relative; }
        .logout-btn { position: absolute; top: 0; right: 0; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 12px; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: var(--text-white); cursor: pointer; transition: 0.2s; font-size: 11px; font-weight: 700; margin-top: -4px; }
        .logout-btn:hover { background: rgba(244, 63, 94, 0.1); border-color: var(--error); color: var(--error); }
        .user-badge-mini { display: flex; align-items: center; gap: 8px; font-size: 12px; opacity: 0.7; }
        .user-badge-mini .avatar { width: 24px; height: 24px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: black; font-size: 10px; }

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

        .payment-selector .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); }
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
      `}</style>
    </div>
  )
}

export default SellerSales
