import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import api from '../api'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState('')

  React.useEffect(() => {
    const token = localStorage.getItem('token')
    const userJson = localStorage.getItem('user')
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson)
        if (user && user.role === 'seller') {
          navigate('/seller/terminal', { replace: true })
        } else if (user && (user.role === 'admin' || user.role === 'treasurer')) {
          navigate('/dashboard', { replace: true })
        }
      } catch (e) {
        console.error('Error parsing user data in Login', e)
      }
    }
  }, [navigate])

  const showError = (msg) => {
    setErrorMsg(msg)
    setTimeout(() => {
      setErrorMsg('')
    }, 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = e.target.elements[0].value
    const password = e.target.elements[1].value
    setLoading(true)
    
    try {
      const res = await api.post('/login', { email, password })
      const data = await res.json()
      
      if (res && res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        if (data.user.role === 'seller') {
          navigate('/seller/terminal')
        } else {
          navigate('/dashboard')
        }
      } else {
        showError(data?.error || 'E-mail ou senha incorretos.')
      }
    } catch (err) {
      showError('Erro ao conectar com o servidor. Tente novamente mais tarde.')
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

        {errorMsg && (
          <div className="error-toast">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={18} />
            <input type="email" placeholder="E-mail" required />
          </div>
          <div className="input-group">
            <Lock size={18} />
            <input type="password" placeholder="Senha" required />
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
        .error-toast {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          animation: fade-in 0.3s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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
