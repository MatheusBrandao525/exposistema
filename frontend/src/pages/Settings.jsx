import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Palette, Globe, Shield, Save, CloudLightning, RefreshCw, Type, Calendar, Image as ImageIcon, ChevronRight, CreditCard } from 'lucide-react'
import api from '../api'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('branding')
  const [settings, setSettings] = useState({
    event_name: '',
    primary_color: '#fbbf24',
    secondary_color: '#f59e0b',
    event_date: '',
    maintenance_mode: '0'
  })
  const [cardFees, setCardFees] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings(data)
          if (data.card_fees) {
            try {
              setCardFees(JSON.parse(data.card_fees))
            } catch (e) {
              setCardFees([])
            }
          }
        }
      })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updatedSettings = {
        ...settings,
        card_fees: JSON.stringify(cardFees)
      }
      await api.post('/settings', updatedSettings)
      alert('Configurações aplicadas com sucesso! 🎉')
    } catch (err) {
      alert('Houve um erro técnico ao processar sua solicitação.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'branding', label: 'Marca e Identidade', sub: 'Cores, logo e nome do evento', icon: <Palette size={22} /> },
    { id: 'general', label: 'Informações do Evento', sub: 'Datas, locais e cronogramas', icon: <Globe size={22} /> },
    { id: 'card_rates', label: 'Taxas de Cartão', sub: 'Bandeiras de cartão e taxas', icon: <CreditCard size={22} /> },
    { id: 'system', label: 'Segurança e Dados', sub: 'Manutenção e backup de sistema', icon: <Shield size={22} /> }
  ]

  return (
    <div className="hq-settings-view animate-fade">
      {/* Absolute Professional Header */}
      <header className="hq-header flex justify-between align-center mb-100">
        <div className="hq-title-stack">
          <h1 className="text-5xl font-extrabold tracking-tight mb-16">Central de Configurações</h1>
          <p className="color-muted text-xl">Gerencie os parâmetros globais da plataforma e personalize sua marca.</p>
        </div>
        <div className="hq-actions">
           <button 
             className={`btn btn-primary hq-save-btn ${saving ? 'loading' : ''}`} 
             onClick={handleSave} 
             disabled={saving}
           >
             {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} strokeWidth={2.5} />}
             {saving ? 'Aplicando...' : 'Salvar Alterações'}
           </button>
        </div>
      </header>

      {/* Corporate Grid Layout */}
      <div className="hq-grid">
        {/* Navigation Column */}
        <nav className="hq-nav-column">
           <div className="hq-nav-group flex-column gap-24">
              {tabs.map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`hq-nav-card ${activeTab === tab.id ? 'active' : ''}`}
                 >
                    <div className="hq-nav-icon">{tab.icon}</div>
                    <div className="hq-nav-text">
                       <span className="hq-nav-label">{tab.label}</span>
                       <span className="hq-nav-sub">{tab.sub}</span>
                    </div>
                    <ChevronRight size={18} className="hq-nav-arrow" />
                 </button>
              ))}
           </div>

           <div className="hq-info-box glass mt-80 p-40">
              <h4 className="flex align-center gap-12 text-xs font-black uppercase tracking-widest color-muted mb-24">
                 <CloudLightning size={16} className="color-primary" /> Infraestrutura
              </h4>
              <div className="hq-tech-line">
                 <span className="dim">Core Version</span>
                 <span className="bold">Fast-PHP v2.4</span>
              </div>
              <div className="hq-tech-line">
                 <span className="dim">Database Host</span>
                 <span className="bold">HostGator Cloud</span>
              </div>
           </div>
        </nav>

        {/* Workspace Column */}
        <main className="hq-workspace-column">
           <div className="hq-content-card glass p-80 flex-column gap-80 min-h-800 animate-slideLeft">
              {activeTab === 'branding' && (
                <div className="hq-section">
                   <div className="hq-section-head mb-60">
                      <h2 className="text-4xl font-black mb-12">Marca e Identidade</h2>
                      <p className="color-dim text-lg">Define a primeira impressão dos expositores com as cores oficiais.</p>
                   </div>

                   <div className="hq-forms-grid flex-column gap-60">
                      <div className="hq-field">
                         <label className="hq-label">Nome de Exibição do Evento</label>
                         <div className="hq-input-wrapper">
                            <Type size={20} className="hq-input-icon" />
                            <input 
                              className="hq-input-field" 
                              value={settings.event_name} 
                              onChange={e => setSettings({...settings, event_name: e.target.value})}
                              placeholder="Digite o nome oficial do evento..."
                            />
                         </div>
                      </div>

                      <div className="flex gap-40 hq-row">
                         <div className="hq-field flex-1">
                            <label className="hq-label">Cor Primária (Navegação)</label>
                            <div className="hq-color-pick flex align-center gap-20 glass p-20 border-subtle">
                               <input type="color" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} className="hq-picker" />
                               <span className="font-mono text-base font-bold uppercase tracking-wider">{settings.primary_color}</span>
                            </div>
                         </div>
                         <div className="hq-field flex-1">
                            <label className="hq-label">Cor de Contraste</label>
                            <div className="hq-color-pick flex align-center gap-20 glass p-20 border-subtle">
                               <input type="color" value={settings.secondary_color} onChange={e => setSettings({...settings, secondary_color: e.target.value})} className="hq-picker" />
                               <span className="font-mono text-base font-bold uppercase tracking-wider">{settings.secondary_color}</span>
                            </div>
                         </div>
                      </div>

                      <div className="hq-branding-upload glass border-dashed p-80 text-center flex-column align-center gap-24">
                         <div className="hq-upload-circle">
                            <ImageIcon size={32} />
                         </div>
                         <div className="hq-upload-info">
                            <h4 className="text-xl font-bold mb-8">Gerenciar Logomarca</h4>
                            <p className="color-muted text-sm max-w-sm">Recomendamos arquivos .PNG ou .SVG com fundo transparente para melhor adaptação.</p>
                         </div>
                         <button className="btn btn-secondary border px-40">Substituir Arquivo</button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'general' && (
                <div className="hq-section">
                   <div className="hq-section-head mb-60">
                      <h2 className="text-4xl font-black mb-12">Informações do Evento</h2>
                      <p className="color-dim text-lg">Datas e localizações geográficas que serão exibidas em relatórios.</p>
                   </div>
                   
                   <div className="hq-forms-grid flex-column gap-60">
                      <div className="hq-field">
                         <label className="hq-label">Data de Início das Operações</label>
                         <div className="hq-input-wrapper">
                            <Calendar size={20} className="hq-input-icon" />
                            <input 
                              type="date"
                              className="hq-input-field" 
                              value={settings.event_date} 
                              onChange={e => setSettings({...settings, event_date: e.target.value})}
                            />
                         </div>
                      </div>
                      <div className="hq-field">
                         <label className="hq-label">Sede e Endereço do Evento</label>
                         <textarea 
                           className="hq-input-field hq-textarea glass" 
                           rows={4}
                           value={settings.event_location || ''} 
                           onChange={e => setSettings({...settings, event_location: e.target.value})}
                           placeholder="Ex: Pavilhão B, Rodovia RS-118, KM 45, Rio Grande do Sul"
                         ></textarea>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'card_rates' && (
                <div className="hq-section">
                   <div className="hq-section-head mb-60">
                      <h2 className="text-4xl font-black mb-12">Taxas de Cartão</h2>
                      <p className="color-dim text-lg">Gerencie as bandeiras aceitas e a taxa percentual cobrada em vendas no crédito.</p>
                   </div>
                   
                   <div className="flex-column gap-40">
                      <div className="glass p-40 border-subtle rounded-20 flex gap-20 align-center hq-row flex-wrap" style={{ background: 'rgba(255,255,255,0.01)' }}>
                         <div className="flex-1 min-w-200">
                            <label className="hq-label">Bandeira do Cartão</label>
                            <div className="hq-input-wrapper">
                               <input 
                                 type="text" 
                                 className="hq-input-field" 
                                 placeholder="Ex: Visa, Mastercard, Elo..." 
                                 id="new-brand-name"
                               />
                            </div>
                         </div>
                         <div style={{ width: '180px' }}>
                            <label className="hq-label">Taxa (%)</label>
                            <div className="hq-input-wrapper">
                               <input 
                                 type="number" 
                                 step="0.01" 
                                 className="hq-input-field" 
                                 placeholder="Ex: 2.50" 
                                 id="new-brand-rate"
                               />
                            </div>
                         </div>
                         <div className="flex align-end mt-24">
                            <button 
                              type="button" 
                              className="btn btn-primary font-bold px-32 py-18 rounded-16 hq-save-btn"
                              style={{ padding: '16px 32px', height: '62px' }}
                              onClick={() => {
                                 const nameInput = document.getElementById('new-brand-name');
                                 const rateInput = document.getElementById('new-brand-rate');
                                 const name = nameInput.value.trim();
                                 const rate = parseFloat(rateInput.value);
                                 if (!name) return alert('Por favor, informe a bandeira do cartão.');
                                 if (isNaN(rate) || rate < 0) return alert('Por favor, informe uma taxa válida.');
                                 
                                 if (cardFees.some(f => f.brand.toLowerCase() === name.toLowerCase())) {
                                    return alert('Esta bandeira já está cadastrada.');
                                 }
                                 
                                 setCardFees([...cardFees, { brand: name, rate: rate }]);
                                 nameInput.value = '';
                                 rateInput.value = '';
                              }}
                            >
                              Adicionar
                            </button>
                         </div>
                      </div>

                      <div className="glass overflow-hidden rounded-20 border-subtle">
                         <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                               <tr className="border-bottom" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <th style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Bandeira</th>
                                  <th style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Taxa Cobrada</th>
                                  <th className="text-right pr-20" style={{ padding: '20px', fontSize: '12px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Ações</th>
                               </tr>
                            </thead>
                            <tbody>
                               {cardFees.map((fee, index) => (
                                  <tr key={index} className="border-bottom hover-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                     <td style={{ padding: '20px', fontWeight: '700', color: '#fff' }}>{fee.brand}</td>
                                     <td style={{ padding: '20px', fontWeight: '700', color: 'var(--primary)', fontSize: '16px' }}>{fee.rate.toFixed(2)}%</td>
                                     <td className="text-right pr-20" style={{ padding: '20px' }}>
                                        <button 
                                          type="button" 
                                          className="btn btn-secondary py-8 px-16 border rounded-8 text-xs color-rose" 
                                          style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)', cursor: 'pointer', background: 'transparent' }}
                                          onClick={() => {
                                             setCardFees(cardFees.filter((_, idx) => idx !== index));
                                          }}
                                        >
                                           Excluir
                                        </button>
                                     </td>
                                  </tr>
                               ))}
                               {cardFees.length === 0 && (
                                  <tr>
                                     <td colSpan={3} className="text-center py-40 color-muted italic">Nenhuma bandeira de cartão cadastrada.</td>
                                  </tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="hq-section">
                   <div className="hq-section-head mb-60">
                      <h2 className="text-4xl font-black mb-12">Segurança e Operação</h2>
                      <p className="color-dim text-lg">Controle técnico e manutenção de acesso em tempo real.</p>
                   </div>
                   
                   <div className="flex-column gap-40">
                      <div className="hq-op-card glass p-40 border-l-success flex justify-between align-center">
                         <div className="stack">
                            <h4 className="text-xl font-bold text-white mb-8">Terminal de Vendas Mobile</h4>
                            <p className="color-muted text-base">Habilita ou desabilita o acesso de todos os vendedores externos.</p>
                         </div>
                         <div 
                           className={`hq-switch ${settings.maintenance_mode === '1' ? 'active' : ''}`}
                           onClick={() => setSettings({...settings, maintenance_mode: settings.maintenance_mode === '1' ? '0' : '1'})}
                         >
                            <div className="hq-switch-circle"></div>
                         </div>
                      </div>

                      <div className="hq-op-card glass p-40 flex align-center gap-40">
                         <div className="hq-system-stat">
                            <div className="hq-pulse-dot"></div>
                         </div>
                         <div className="flex-1">
                            <h4 className="text-xl font-bold text-white mb-8">Backup de Transações</h4>
                            <p className="color-muted text-base">Realize uma cópia de segurança completa agora mesmo. Os dados são compactados em .SQL.</p>
                         </div>
                         <button className="btn btn-primary hq-action-btn flex align-center gap-12">
                            <RefreshCw size={18} /> Iniciar Backup
                         </button>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </main>
      </div>

      <style>{`
        .hq-settings-view { width: 100%; max-width: 1600px; margin: 0 auto; padding-bottom: 150px; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .align-center { align-items: center; }
        .flex-column { display: flex; flex-direction: column; }
        .flex-1 { flex: 1; }
        .gap-12 { gap: 12px; }
        .gap-20 { gap: 20px; }
        .gap-24 { gap: 24px; }
        .gap-40 { gap: 40px; }
        .gap-60 { gap: 60px; }
        .gap-80 { gap: 80px; }
        .p-20 { padding: 20px; }
        .p-40 { padding: 40px; }
        .p-80 { padding: 80px; }
        .mb-12 { margin-bottom: 12px; }
        .mb-16 { margin-bottom: 16px; }
        .mb-24 { margin-bottom: 24px; }
        .mb-60 { margin-bottom: 60px; }
        .mb-100 { margin-bottom: 100px; }
        .mt-80 { margin-top: 80px; }
        
        .text-4xl { font-size: 32px; }
        .text-5xl { font-size: 48px; }
        .text-xl { font-size: 20px; }
        .font-black { font-weight: 900; }
        .color-dim { color: rgba(255,255,255,0.6); }

        /* Save Button Top Right */
        .hq-save-btn { padding: 18px 48px; font-size: 16px; font-weight: 800; border-radius: 18px; display: flex; align-items: center; gap: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: 0.3s; }
        .hq-save-btn:hover { transform: translateY(-3px) scale(1.02); }

        /* Grid Architecture */
        .hq-grid { display: flex; gap: 80px; align-items: flex-start; }
        .hq-nav-column { width: 380px; flex-shrink: 0; position: sticky; top: 100px; }
        .hq-workspace-column { flex: 1; min-width: 0; }

        /* Nav Cards */
        .hq-nav-card { width: 100%; padding: 24px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); border-radius: 20px; display: flex; align-items: center; gap: 16px; text-align: left; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; color: white; }
        .hq-nav-card:hover { background: rgba(255,255,255,0.05); transform: translateX(8px); }
        .hq-nav-card.active { background: white; color: black; border-color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        
        .hq-nav-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
        .hq-nav-card.active .hq-nav-icon { background: rgba(0,0,0,0.05); color: black; }
        .hq-nav-text { flex: 1; display: flex; flex-direction: column; }
        .hq-nav-label { font-size: 16px; font-weight: 800; margin-bottom: 2px; }
        .hq-nav-sub { font-size: 11px; opacity: 0.6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .hq-nav-arrow { opacity: 0; transition: 0.3s; transform: translateX(-10px); }
        .hq-nav-card.active .hq-nav-arrow { opacity: 1; transform: translateX(0); }

        /* Technical Line */
        .hq-tech-line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .hq-tech-line:last-child { border: none; }
        .hq-tech-line .dim { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 600; }
        .hq-tech-line .bold { font-size: 13px; font-weight: 800; color: white; }

        /* Form Precision */
        .hq-label { display: block; font-size: 12px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px; }
        .hq-input-wrapper { display: flex; align-items: center; gap: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px 24px; transition: 0.3s; }
        .hq-input-wrapper:focus-within { border-color: white; background: rgba(0,0,0,0.5); }
        .hq-input-field { background: none; border: none; color: white; width: 100%; font-size: 18px; outline: none; font-weight: 600; }
        .hq-textarea { border-radius: 20px; resize: none; padding: 24px; }
        
        .hq-picker { width: 50px; height: 50px; border-radius: 14px; border: 2px solid rgba(255,255,255,0.1); background: none; cursor: pointer; }

        /* Upload Surface */
        .hq-upload-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); border: 2px dashed rgba(255,255,255,0.1); }
        .dashed-border { border-style: dashed; }

        /* Switch */
        .hq-switch { width: 64px; height: 34px; background: rgba(255,255,255,0.1); border-radius: 100px; padding: 6px; cursor: pointer; transition: 0.4s; }
        .hq-switch.active { background: #10b981; }
        .hq-switch-circle { width: 22px; height: 22px; background: white; border-radius: 50%; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hq-switch.active .hq-switch-circle { transform: translateX(30px); }

        .hq-pulse-dot { width: 14px; height: 14px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); animation: hq-pulse 2s infinite; }
        @keyframes hq-pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .border-l-success { border-left: 6px solid #10b981; }
        
        @media (max-width: 1200px) {
          .hq-grid { flex-direction: column; }
          .hq-nav-column { width: 100%; position: static; }
        }
      `}</style>
    </div>
  )
}

export default Settings
