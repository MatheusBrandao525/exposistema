import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = e.target.elements[0].value
    const password = e.target.elements[1].value
    setLoading(true)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        if (data.user.role === 'seller') {
          navigate('/seller/terminal')
        } else {
          navigate('/')
        }
      } else {
        alert(data.error || 'Erro no login')
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card glass animate-fade">
        <div className="login-header">
          <img src="/logo.png" alt="Expovale 2026" className="login-logo" />
          <p>Autenticação de Acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={18} />
            <input type="email" placeholder="E-mail" required defaultValue="admin@admin.com" />
          </div>
          <div className="input-group">
            <Lock size={18} />
            <input type="password" placeholder="Senha" required defaultValue="password" />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Entrando...' : (
              <>
                Entrar <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="#">Esqueci minha senha</a>
        </div>
      </div>

      <style>{`
        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e293b, #0f172a);
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          text-align: center;
        }
        .login-logo {
          width: 100%;
          max-width: 280px;
          height: auto;
          margin: 0 auto 32px;
          display: block;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        }
        .login-header p { 
          color: var(--text-dim); 
          margin-bottom: 32px; 
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0 16px;
          transition: all 0.3s;
        }
        .input-group:focus-within { 
          border-color: var(--primary); 
          background: rgba(251, 191, 36, 0.05);
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
        }
        .input-group svg { color: var(--text-dim); }
        .input-group input {
          width: 100%;
          background: none;
          border: none;
          padding: 16px 12px;
          color: white;
          font-family: inherit;
          box-shadow: none;
          transform: none;
        }
        .input-group input:focus { outline: none; box-shadow: none; transform: none; background: none; }
        .login-btn {
          margin-top: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .login-footer { margin-top: 24px; }
        .login-footer a { color: var(--text-muted); text-decoration: none; font-size: 14px; }
        .login-footer a:hover { color: var(--primary); }
      `}</style>
    </div>
  )
}

export default Login
