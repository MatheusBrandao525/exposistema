import React from 'react'
import { Plus, Filter, Search, Tag, MapPin, DollarSign } from 'lucide-react'
import api from '../api'

const AdSpaceCard = ({ space }) => (
  <div className="glass ad-card animate-fade">
    <div className="card-image">
      {space.image ? <img src={space.image} alt={space.name} /> : <div className="placeholder-image">{space.name[0]}</div>}
      <span className={`status-badge ${space.status}`}>{space.status === 'available' ? 'Disponível' : space.status === 'reserved' ? 'Reservado' : 'Vendido'}</span>
    </div>
    <div className="card-content">
      <div className="card-type">{space.type_name || space.type}</div>
      <h3>{space.name}</h3>
      <div className="card-info">
        <div className="info-item"><MapPin size={14} /> {space.location || 'Área Geral'}</div>
        <div className="info-item"><DollarSign size={14} /> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(space.base_price || space.price)}</div>
      </div>
      <button className="btn btn-secondary card-btn" disabled={space.status !== 'available'}>
        {space.status === 'available' ? 'Vender Espaço' : 'Detalhes'}
      </button>
    </div>
    <style>{`
      .ad-card {
        border-radius: 20px;
        overflow: hidden;
        transition: all 0.3s;
      }
      .ad-card:hover { transform: translateY(-5px); border-color: var(--primary); }
      .card-image { position: relative; height: 160px; overflow: hidden; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;}
      .placeholder-image { font-size: 48px; font-weight: 800; color: var(--primary); opacity: 0.3; }
      .card-image img { width: 100%; height: 100%; object-fit: cover; }
      .status-badge { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: white; }
      .status-badge.available { background: var(--success); }
      .status-badge.reserved { background: var(--primary); }
      .status-badge.sold { background: var(--error); }
      .card-content { padding: 20px; }
      .card-type { font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 4px; }
      .card-content h3 { font-size: 18px; margin-bottom: 12px; }
      .card-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
      .info-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
      .card-btn { width: 100%; padding: 10px; font-size: 13px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: white; border-radius: 10px; }
      .card-btn:hover:not(:disabled) { background: var(--primary); border-color: var(--primary); }
    `}</style>
  </div>
)

const AdSpaces = () => {
  const [spaces, setSpaces] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchSpaces()
  }, [])

  const fetchSpaces = () => {
    api.get('/spaces')
      .then(res => res.json())
      .then(data => {
        setSpaces(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  return (
    <div className="spaces-page">
      <header className="page-header">
        <div className="header-info">
          <h1>Espaços Publicitários</h1>
          <p>Gerencie e visualize todos os espaços disponíveis no evento.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} /> Novo Espaço
        </button>
      </header>

      <div className="filters-bar glass">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nome ou localização..." />
        </div>
        <div className="filter-actions">
          <button className="filter-btn"><Filter size={18} /> Filtros</button>
          <button className="filter-btn"><Tag size={18} /> Tipos</button>
        </div>
      </div>

      <div className="grid-auto spaces-grid">
        {spaces.map(space => <AdSpaceCard key={space.id} space={space} />)}
      </div>

      <style>{`
        .spaces-page { animation: fadeIn 0.4s ease; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 20px; }
        .filters-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; margin-bottom: 32px; gap: 20px; }
        .search-box { display: flex; align-items: center; gap: 12px; flex: 1; }
        .search-box input { background: none; border: none; color: white; width: 100%; padding: 8px 0; font-family: inherit; }
        .search-box input:focus { outline: none; }
        .filter-actions { display: flex; gap: 12px; }
        .filter-btn { padding: 8px 16px; border-radius: 10px; background: rgba(255,255,255,0.05); color: var(--text-white); border: 1px solid var(--border); display: flex; align-items: center; gap: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--primary); }
      `}</style>
    </div>
  )
}

export default AdSpaces
