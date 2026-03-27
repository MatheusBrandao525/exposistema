import React, { useState, useEffect } from 'react'
import { Search, User, Package, Plus, Trash2, CheckCircle2, ShoppingCart, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SellerSales = () => {
  const [step, setStep] = useState(1) // 1: Client, 2: Products, 3: Checkout
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (step === 1 && searchTerm.length > 1) {
        setLoading(true)
        fetch(`http://localhost:8000/api/clients/search?q=${searchTerm}`)
          .then(res => res.json())
          .then(data => { setClients(data); setLoading(false); })
      } else if (step === 2 && searchTerm.length > 1) {
        setLoading(true)
        fetch(`http://localhost:8000/api/spaces/search?q=${searchTerm}`)
          .then(res => res.json())
          .then(data => { setProducts(data); setLoading(false); })
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, step])

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

  const handleFinish = async () => {
    setLoading(true)
    const payload = {
      client_id: selectedClient.id,
      total_price: getTotal(),
      items: cart.map(item => ({ id: item.id, price: item.base_price, quantity: item.quantity }))
    }

    try {
      const res = await fetch('http://localhost:8000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setCart([])
        setSelectedClient(null)
        setStep(1)
      }
    } catch (err) {
      alert('Erro ao finalizar venda')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mobile-view flex-center animate-fade">
        <div className="glass success-card text-center">
          <CheckCircle2 size={80} className="color-primary" style={{margin: '0 auto 20px'}} />
          <h2>Venda Concluída!</h2>
          <p>O recibo foi gerado e a venda registrada com sucesso.</p>
          <button className="btn btn-primary w-full" onClick={() => setSuccess(false)}>Nova Venda</button>
        </div>
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
            <span>Vendedor</span>
          </div>
          <h1>Terminal de Vendas</h1>
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
              <Search size={20} />
              <input 
                placeholder="Buscar cliente..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="list-container mt-20">
              {filteredClients.map(client => (
                <div key={client.id} className="glass list-item animate-slideUp" onClick={() => { setSelectedClient(client); setStep(2); setSearchTerm('') }}>
                  <div className="item-icon"><User size={20}/></div>
                  <div className="item-info">
                    <strong>{client.name}</strong>
                    <span>{client.company || 'Pessoa Física'}</span>
                  </div>
                  <ChevronRight size={20} className="color-muted" />
                </div>
              ))}
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
              <X size={20} />
            </div>

            <div className={`input-group-mobile glass ${searchTerm ? 'focused' : ''}`}>
              <Search size={20} />
              <input 
                placeholder="Buscar serviço ou produto..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="list-container mt-20">
              {filteredProducts.map(product => (
                <div key={product.id} className="glass list-item animate-slideUp" onClick={() => addToCart(product)}>
                  <div className="item-icon"><Package size={20}/></div>
                  <div className="item-info">
                    <strong>{product.name}</strong>
                    <span className="price">R$ {product.base_price}</span>
                  </div>
                  <Plus size={20} className="color-primary" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="step-container">
             <div className="summary-card glass p-20 mb-20">
                <h3>Resumo do Pedido</h3>
                <div className="client-line mt-10">
                  <User size={16} /> <span>{selectedClient?.name}</span>
                </div>
                <div className="cart-items mt-20">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="info">
                        <strong>{item.name}</strong>
                        <span>R$ {item.base_price}</span>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16}/></button>
                    </div>
                  ))}
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

        .mobile-header-top {
          padding: 24px 20px;
          border-radius: 0 0 24px 24px;
        }

        .header-content h1 { font-size: 20px; margin-top: 8px; font-weight: 800; }
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
        .item-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .item-info { flex: 1; display: flex; flex-direction: column; }
        .item-info strong { font-size: 15px; }
        .item-info span { font-size: 12px; color: var(--text-muted); }
        .item-info .price { color: var(--primary); font-weight: 700; margin-top: 2px; }

        .selected-client-banner { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 16px; background: rgba(245, 158, 11, 0.05); border-color: var(--primary); }
        .selected-client-banner .info span { font-size: 10px; text-transform: uppercase; color: var(--primary); font-weight: 800; display: block; }
        .selected-client-banner .info strong { font-size: 16px; }

        .summary-card h3 { font-size: 18px; font-weight: 800; }
        .client-line { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); }
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cart-item .info strong { display: block; font-size: 14px; }
        .cart-item .info span { font-size: 12px; color: var(--primary); font-weight: 700; }
        .remove-btn { color: var(--error); opacity: 0.6; background: none; border: none; }

        .mobile-footer-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 24px 24px 0 0; z-index: 2000; box-shadow: 0 -10px 30px rgba(0,0,0,0.5); }
        .total-info { display: flex; flex-direction: column; }
        .total-info span { font-size: 11px; color: var(--text-muted); }
        .total-info strong { font-size: 20px; }

        .flex-center { display: flex; center; justify-content: center; height: 100vh; padding: 20px; }
        .success-card { padding: 40px 20px; border-radius: 32px; width: 100%; }
        .success-card p { opacity: 0.6; margin: 12px 0 32px; }
        
        .px-20 { padding-left: 20px; padding-right: 20px; }
        .py-20 { padding-top: 20px; padding-bottom: 20px; }
        .mt-20 { margin-top: 20px; }
        .mb-20 { margin-bottom: 20px; }
        .w-full { width: 100%; }
      `}</style>
    </div>
  )
}

export default SellerSales
