import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw, User, Mail, Key, Shield, Briefcase } from 'lucide-react'
import api from '../api'


const SellerForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
    seller_function: 'Stands'
  })

  const functions = [
    'Mesas de rodapé',
    'Stands',
    'Camarote',
    'Espaços publicitários',
    'Administrador Geral'
  ]

  useEffect(() => {
    if (id) {
      fetchSeller()
    }
  }, [id])

  const fetchSeller = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users`)
      const sellers = await res.json()
      const current = sellers.find(s => s.id === parseInt(id))
      if (current) {
        setFormData({
          ...current,
          password: '' // Don't fetch password
        })
      }
    } catch (err) {
      alert('Erro ao carregar dados do vendedor')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const method = id ? 'put' : 'post'
    const endpoint = id ? `/users/${id}` : '/users'

    try {
      const res = await api[method](endpoint, formData)
      const data = await res.json()
      if (data.success) {
        navigate('/sellers')
      } else {
        alert(data.error || 'Erro ao processar solicitação')
      }
    } catch (err) {
      alert('Erro de conexão com o servidor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-80 text-center color-muted animate-pulse">Carregando perfil...</div>

  return (
    <div className="hq-form-view animate-fade">
      {/* Precision Header */}
      <header className="hq-header flex justify-between align-center mb-60">
        <div className="hq-back-nav">
          <Link to="/sellers" className="btn-back flex align-center gap-12 color-muted hover-white mb-16">
            <ArrowLeft size={18} /> Voltar para a Lista
          </Link>
          <h1 className="text-5xl font-black tracking-tight text-white capitalize">
             {id ? 'Editar Colaborador' : 'Admissão de Colaborador'}
          </h1>
          <p className="color-dim text-xl mt-8">Configure as permissões e dados de acesso para {id ? formData.name : 'o novo membro'}.</p>
        </div>
        <div className="hq-actions">
           <button 
             className={`btn btn-primary hq-save-btn ${saving ? 'loading' : ''}`} 
             onClick={handleSubmit} 
             disabled={saving}
           >
             {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
             {saving ? 'Efetivando...' : 'Confirmar Alterações'}
           </button>
        </div>
      </header>

      {/* Corporate Centered Workspace */}
      <main className="hq-workspace-centered glass p-80 flex-column gap-60 border">
          <div className="hq-section-group">
             <h4 className="flex align-center gap-12 text-xs font-black uppercase tracking-widest color-primary mb-32 border-b pb-12 w-fit">
                <User size={16} /> Identificação Geral
             </h4>
             
             <div className="hq-field w-full mb-40">
                <label className="hq-label">Nome Completo</label>
                <div className="hq-input-box glass border p-24 rounded-20 flex align-center gap-20">
                   <User size={22} className="color-dim" />
                   <input 
                     className="hq-input-clean" 
                     value={formData.name} 
                     onChange={e => setFormData({...formData, name: e.target.value})} 
                     placeholder="Digite o nome completo do colaborador..."
                     required
                   />
                </div>
             </div>

             <div className="flex gap-40 hq-row">
                <div className="hq-field flex-1">
                   <label className="hq-label">E-mail Profissional</label>
                   <div className="hq-input-box glass border p-24 rounded-20 flex align-center gap-20">
                      <Mail size={22} className="color-dim" />
                      <input 
                        type="email"
                        className="hq-input-clean" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        placeholder="vendedor@exposistema.com"
                        required
                      />
                   </div>
                </div>
                {!id && (
                   <div className="hq-field flex-1">
                      <label className="hq-label">Senha Provisória</label>
                      <div className="hq-input-box glass border p-24 rounded-20 flex align-center gap-20">
                         <Key size={22} className="color-dim" />
                         <input 
                           type="password"
                           className="hq-input-clean" 
                           value={formData.password} 
                           onChange={e => setFormData({...formData, password: e.target.value})} 
                           placeholder="Mínimo 8 caracteres"
                           required
                         />
                      </div>
                   </div>
                )}
             </div>
          </div>

          <div className="hq-section-group">
             <h4 className="flex align-center gap-12 text-xs font-black uppercase tracking-widest color-primary mb-32 border-b pb-12 w-fit">
                <Shield size={16} /> Atribuições e Permissões
             </h4>
             
             <div className="flex gap-40 hq-row">
                <div className="hq-field flex-1">
                   <label className="hq-label">Nível de Acesso (Perfil)</label>
                   <div className="hq-input-box glass border p-24 rounded-20 flex align-center gap-20">
                      <Shield size={22} className="color-dim" />
                      <select 
                        className="hq-input-clean hq-select"
                        value={formData.role} 
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                         <option value="seller">Vendedor (Mobile Terminal)</option>
                         <option value="admin">Administrador (Master App)</option>
                      </select>
                   </div>
                </div>
                <div className="hq-field flex-1">
                   <label className="hq-label">Setor / Função Comercial</label>
                   <div className="hq-input-box glass border p-24 rounded-20 flex align-center gap-20">
                      <Briefcase size={22} className="color-dim" />
                      <select 
                        className="hq-input-clean hq-select"
                        value={formData.seller_function} 
                        onChange={e => setFormData({...formData, seller_function: e.target.value})}
                      >
                         {functions.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                   </div>
                </div>
             </div>
          </div>
      </main>

      <style>{`
        .hq-form-view { width: 100%; max-width: 1200px; margin: 0 auto; padding-bottom: 150px; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .align-center { align-items: center; }
        .flex-column { display: flex; flex-direction: column; }
        .flex-1 { flex: 1; }
        .gap-12 { gap: 12px; }
        .gap-16 { gap: 16px; }
        .gap-20 { gap: 20px; }
        .gap-32 { gap: 32px; }
        .gap-40 { gap: 40px; }
        .gap-60 { gap: 60px; }
        .p-24 { padding: 24px; }
        .p-80 { padding: 80px; }
        .mb-8 { margin-bottom: 8px; }
        .mb-12 { margin-bottom: 12px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-32 { margin-bottom: 32px; }
        .mb-40 { margin-bottom: 40px; }
        .mb-60 { margin-bottom: 60px; }
        .mt-8 { margin-top: 8px; }
        .mt-16 { margin-top: 16px; }
        .mt-40 { margin-top: 40px; }
        
        .text-xs { font-size: 11px; }
        .text-xl { font-size: 20px; }
        .text-5xl { font-size: 48px; }
        .font-black { font-weight: 950; }
        .color-dim { color: rgba(255,255,255,0.4); }
        .color-primary { color: var(--primary); }
        .hover-white:hover { color: white; }
        
        .btn-back { text-decoration: none; font-weight: 700; transition: 0.3s; }
        .btn-back:hover { transform: translateX(-5px); }
        
        .hq-save-btn { padding: 20px 60px; font-size: 16px; font-weight: 850; border-radius: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 40px var(--primary-glow); }
        .hq-save-btn:hover { transform: translateY(-3px) scale(1.02); }

        .hq-workspace-centered { border-radius: 40px; position: relative; overflow: hidden; background: rgba(15, 23, 42, 0.4); }
        
        .hq-label { display: block; font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 16px; padding-left: 12px; }
        .hq-input-clean { background: none; border: none; color: white; width: 100%; font-size: 18px; font-weight: 700; outline: none; }
        .hq-input-clean::placeholder { color: rgba(255,255,255,0.1); }
        .hq-select { cursor: pointer; }
        .hq-select option { background: #0f172a; color: white; }
        
        .border-b { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .w-fit { width: fit-content; }
        .rounded-20 { border-radius: 20px; }
        
        @media (max-width: 1000px) {
          .hq-row { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}

export default SellerForm
