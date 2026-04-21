import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/authService';
import toast from 'react-hot-toast';

/* ── All styles outside component — never recreated on re-render ── */
const wrap = { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
const card = { width: '100%', maxWidth: '400px' };
const inputCss = { width: '100%', padding: '10px 13px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '7px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const labelCss = { display: 'block', fontSize: '10px', fontWeight: 700, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' };
const fieldWrap = { marginBottom: '14px' };

/* ── Field MUST be at module level — defining inside component causes remount on each keystroke ── */
const Field = ({ id, label, children }) => (
  <div style={fieldWrap}>
    <label htmlFor={id} style={labelCss}>{label}</label>
    {children}
  </div>
);

const onFocus = (e) => { e.target.style.borderColor = '#22c55e'; };
const onBlur = (e) => { e.target.style.borderColor = '#1e1e1e'; };

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerApi({ name, email, phone, role, password });
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome aboard.');
      navigate(role === 'worker' ? '/worker' : '/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', textDecoration: 'none' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.15em' }}>NAGAR E-CONNECT</span>
          </Link>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '30px', fontWeight: 700, color: '#f1f5f9', marginBottom: '5px' }}>Create Account</h1>
          <p style={{ fontSize: '13px', color: '#4b5563' }}>Join the Swachh Bharat movement</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on">
          <Field id="reg-name" label="Full Name">
            <input
              id="reg-name" style={inputCss} type="text" name="name"
              autoComplete="name" placeholder="Rahul Sharma"
              value={name} onChange={e => setName(e.target.value)}
              onFocus={onFocus} onBlur={onBlur} required
            />
          </Field>

          <Field id="reg-email" label="Email">
            <input
              id="reg-email" style={inputCss} type="email" name="email"
              autoComplete="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onFocus={onFocus} onBlur={onBlur} required
            />
          </Field>

          <Field id="reg-phone" label="Phone Number">
            <input
              id="reg-phone" style={inputCss} type="tel" name="phone"
              autoComplete="tel" placeholder="9876543210"
              value={phone} onChange={e => setPhone(e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
            />
          </Field>

          <Field id="reg-role" label="Register As">
            <select
              id="reg-role" style={{ ...inputCss, cursor: 'pointer' }}
              value={role} onChange={e => setRole(e.target.value)}
            >
              <option value="citizen">Citizen</option>
              <option value="worker">Municipal Worker</option>
            </select>
          </Field>

          <Field id="reg-password" label="Password">
            <input
              id="reg-password" style={inputCss} type="password" name="password"
              autoComplete="new-password" placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)}
              onFocus={onFocus} onBlur={onBlur} required minLength={6}
            />
          </Field>

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px', background: '#22c55e', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: '4px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#4b5563' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#22c55e', fontWeight: 600 }}>Sign in</Link>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#374151' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
