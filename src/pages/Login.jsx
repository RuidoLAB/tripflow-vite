import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Cuenta creada. Revisa tu email para confirmar, o inicia sesión directamente.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card} className="fade-up">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>✈</div>
          <div style={styles.logoTitle}>TripFlow</div>
          <div style={styles.logoSub}>Tu tracker de viajes</div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <div style={styles.label}>Email</div>
            <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <div style={styles.label}>Contraseña</div>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : mode === 'login' ? 'Entrar' : 'Crear cuenta'
            }
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }} style={styles.switchBtn}>
            {mode === 'login' ? 'Crear una' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#080A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', top: '20%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(74,230,164,0.05)', filter: 'blur(60px)', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '20%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(96,170,255,0.04)', filter: 'blur(60px)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, position: 'relative', zIndex: 1 },
  logo: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { width: 48, height: 48, borderRadius: 14, background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 },
  logoTitle: { fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', marginBottom: 4 },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  error: { background: 'rgba(255,87,87,0.1)', border: '1px solid rgba(255,87,87,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#FF5757' },
  successMsg: { background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#4AE6A4' },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' },
  switchBtn: { background: 'none', border: 'none', color: '#4AE6A4', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 },
}
