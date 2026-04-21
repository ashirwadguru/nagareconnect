import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';
import toast from 'react-hot-toast';

/* ── styles outside component so they're never recreated ── */
const wrap = { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
const card = { width: '100%', maxWidth: '380px' };
const inputCss = { width: '100%', padding: '10px 13px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const labelCss = { display: 'block', fontSize: '10px', fontWeight: 700, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' };
const fieldWrap = { marginBottom: '14px' };

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onFocus = (e) => { e.target.style.borderColor = '#22c55e'; };
  const onBlur = (e) => { e.target.style.borderColor = '#1e1e1e'; };

  return (
    <div style={wrap}>
      <div style={card}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', textDecoration: 'none' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.15em' }}>NAGAR E-CONNECT</span>
          </Link>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '32px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em', marginBottom: '6px' }}>Sign In</h1>
          <p style={{ fontSize: '13px', color: '#4b5563' }}>Access your municipal complaint dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="on">
          <div style={fieldWrap}>
            <label style={labelCss} htmlFor="login-email">Email</label>
            <input
              id="login-email"
              style={inputCss}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
          </div>

          <div style={{ ...fieldWrap, marginBottom: '20px' }}>
            <label style={labelCss} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              style={inputCss}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', background: loading ? '#15803d' : '#22c55e', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo creds */}
        <div style={{ marginTop: '20px', padding: '12px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '7px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Demo credentials</div>
          <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>Admin: <span style={{ color: '#22c55e', userSelect: 'all' }}>admin@nagareconnect.in / Admin@123</span></div>
          <div style={{ fontSize: '12px', color: '#4b5563' }}>Worker: <span style={{ color: '#3b82f6', userSelect: 'all' }}>aryan5@gmail.com / Worker@123</span></div>
        </div>

        {/* Links */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#4b5563' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#22c55e', fontWeight: 600 }}>Create account</Link>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#374151' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
