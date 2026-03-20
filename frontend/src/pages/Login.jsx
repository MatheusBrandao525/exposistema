import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate login
    setTimeout(() => {
      setLoading(false)
      navigate('/')
    }, 1000)
  }

  return (
    <div className="login-container">
      <div className="login-card glass animate-fade">
        <div className="login-header">
          <div className="logo-icon">E</div>
          <h1>ExpoSistema</h1>
          <p>Seja bem-vindo de volta.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={18} />
            <input type="email" placeholder="E-mail" required defaultValue="admin@exposistema.com" />
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
        .logo-icon {
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 24px;
          margin: 0 auto 20px;
          box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
        }
        .login-header h1 { font-size: 28px; margin-bottom: 8px; }
        .login-header p { color: var(--text-muted); margin-bottom: 32px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 16px;
          transition: border-color 0.2s;
        }
        .input-group:focus-within { border-color: var(--primary); }
        .input-group svg { color: var(--text-muted); }
        .input-group input {
          width: 100%;
          background: none;
          border: none;
          padding: 14px 12px;
          color: white;
          font-family: inherit;
        }
        .input-group input:focus { outline: none; }
        .login-btn {
          margin-top: 12px;
          padding: 14px;
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
