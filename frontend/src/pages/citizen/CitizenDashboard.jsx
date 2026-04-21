import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../../services/complaintService';
import { getMyPoints, getTransactions } from '../../services/rewardService';
import { useAuth } from '../../context/AuthContext';
import { FiPlus } from 'react-icons/fi';

const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#22c55e', rejected: '#ef4444' };
const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [pointsData, setPointsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyComplaints(), getMyPoints(), getTransactions()])
      .then(([c, p, t]) => {
        setComplaints(c.data);
        setPointsData(p.data);
        setTransactions(t.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) return <div className="spinner-overlay"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.03em' }}>
            My Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '3px' }}>
            Hello, {user?.name?.split(' ')[0]} — here's your complaint activity
          </p>
        </div>
        <Link to="/citizen/new-complaint"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#22c55e', color: '#000', borderRadius: '7px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
          <FiPlus size={14} /> Report Issue
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        {[
          { label: 'Total Reports', value: stats.total, color: '#f1f5f9' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
          { label: 'Resolved', value: stats.resolved, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '20px 22px', background: '#0d0d0d' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '34px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Points panel */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reward Points</div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '48px', fontWeight: 700, color: '#22c55e', lineHeight: 1 }}>
            {pointsData?.current_points ?? 0}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#4b5563', borderTop: '1px solid #1a1a1a', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Earned</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>+{pointsData?.total_earned ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Redeemed</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>-{pointsData?.total_redeemed ?? 0}</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#374151', background: '#111', border: '1px solid #1a1a1a', borderRadius: '6px', padding: '8px 10px', lineHeight: 1.5 }}>
            +5 pts on submission · +20 pts when resolved
          </div>
          <Link to="/citizen/rewards" style={{ display: 'block', textAlign: 'center', padding: '9px', background: 'transparent', border: '1px solid #22c55e', borderRadius: '7px', color: '#22c55e', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Redeem Points →
          </Link>
        </div>

        {/* Recent transactions */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '15px', color: '#e5e7eb', letterSpacing: '0.03em' }}>Point Activity</span>
            <Link to="/citizen/rewards" style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#374151' }}>
              No activity yet. Report your first issue to earn points!
            </div>
          ) : (
            transactions.map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 18px', borderBottom: '1px solid #111',
                background: i % 2 === 0 ? 'transparent' : '#080808',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.type === 'earned' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${t.type === 'earned' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: t.type === 'earned' ? '#22c55e' : '#ef4444', flexShrink: 0 }}>
                    {t.type === 'earned' ? '+' : '-'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#d1d5db', fontWeight: 500 }}>{t.description}</div>
                    <div style={{ fontSize: '11px', color: '#374151', marginTop: '1px' }}>{new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '16px', fontWeight: 700, color: t.type === 'earned' ? '#22c55e' : '#ef4444' }}>
                  {t.type === 'earned' ? '+' : '-'}{t.points}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Complaints table */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '15px', color: '#e5e7eb', letterSpacing: '0.03em' }}>My Complaints</span>
          <Link to="/citizen/complaints" style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        {complaints.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗑️</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>No complaints yet</div>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '16px' }}>Report your first garbage issue and earn 5 points!</div>
            <Link to="/citizen/new-complaint"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#22c55e', color: '#000', borderRadius: '7px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              <FiPlus size={13} /> Report Now
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#111' }}>
                {['#', 'Title', 'Address', 'Status', 'Priority', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#374151', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? 'transparent' : '#080808' }}>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>#{c.id}</td>
                  <td style={{ padding: '10px 14px', color: '#d1d5db', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  <td style={{ padding: '10px 14px', color: '#4b5563', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>
                    {c.address ? c.address.substring(0, 35) : `${c.lat?.toFixed(3)}, ${c.lng?.toFixed(3)}`}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: statusColor[c.status], marginRight: 5 }} />
                    <span style={{ fontSize: '11px', color: statusColor[c.status], textTransform: 'capitalize' }}>{c.status.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '10px', color: priorityColor[c.priority], textTransform: 'capitalize', fontWeight: 700 }}>{c.priority}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Link to={`/citizen/complaints/${c.id}`} style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
