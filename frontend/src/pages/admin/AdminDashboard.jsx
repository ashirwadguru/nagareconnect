import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../../services/adminService';
import { getAllComplaints } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiSearch, FiChevronDown, FiClipboard, FiUsers, FiMap } from 'react-icons/fi';

/* SVG Sparkline */
const Sparkline = ({ data }) => {
  if (!data?.length) return null;
  const w = 120, h = 28, max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible', marginTop: 4 }}>
      <polyline fill="none" stroke="#22c55e" strokeWidth="1.5" points={pts} />
    </svg>
  );
};

/* Level Badge */
const LevelBadge = ({ level, unlocked }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${unlocked ? '#22c55e' : '#1e1e1e'}`, background: unlocked ? 'rgba(34,197,94,0.1)' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
      {unlocked ? '🛡️' : '🔒'}
    </div>
    <span style={{ fontSize: 9, color: unlocked ? '#22c55e' : '#374151', fontWeight: 700 }}>Lv. {level}</span>
  </div>
);

const C = { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10 };
const scRing = { fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase' };
const scTitle = { fontFamily: 'Rajdhani,sans-serif', fontSize: 14, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.03em' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#22c55e', rejected: '#ef4444' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getAllComplaints({ limit: 5 })])
      .then(([s, c]) => { setStats(s.data); setComplaints(c.data.complaints || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
      <div className="spinner" />
    </div>
  );

  const total = stats.total_complaints || 0;
  const resolved = stats.resolved || 0;
  const pending = stats.pending || 0;
  const inProgress = stats.in_progress || 0;
  const resRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a0a' }}>

      {/* ── Topbar ── */}
      <div style={{ height: 56, background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Admin Dashboard</div>
          <div style={{ fontSize: 11, color: '#4b5563' }}>Hello, {user?.name} — city-wide complaint overview</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111', border: '1px solid #1a1a1a', borderRadius: 7, padding: '6px 12px', width: 200 }}>
          <FiSearch size={12} color="#374151" />
          <input placeholder="Search complaints..." style={{ background: 'none', border: 'none', outline: 'none', color: '#9ca3af', fontSize: 12, width: '100%' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#111', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <FiBell size={14} color="#6b7280" />
          </div>
          {pending > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: '#ef4444', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{pending}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px', background: '#111', border: '1px solid #1a1a1a', borderRadius: 7, cursor: 'pointer' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>{user?.name?.[0]}</div>
          <FiChevronDown size={11} color="#4b5563" />
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Row 1 — Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.4fr', gap: 1, background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
          {[
            { label: 'TOTAL REPORTS', value: total, icon: '📋', color: '#f1f5f9' },
            { label: 'PENDING', value: pending, icon: '⏳', color: '#f59e0b' },
            { label: 'IN PROGRESS', value: inProgress, icon: '🔄', color: '#3b82f6' },
            { label: 'RESOLVED', value: resolved, icon: '✅', color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', background: '#0d0d0d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={scRing}>{s.label}</span>
              </div>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
          <div style={{ padding: '14px 16px', background: '#0d0d0d' }}>
            <div style={scRing}>RESOLUTION RATE</div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 30, fontWeight: 700, color: '#22c55e', lineHeight: 1, marginBottom: 2 }}>{resRate}%</div>
            <Sparkline data={[2, 5, 3, 8, 6, 10, resRate]} />
          </div>
        </div>

        {/* Row 2 — Status | Complaints | Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 250px', gap: 12 }}>

          {/* Status Overview — flat bars */}
          <div style={{ ...C, padding: '16px' }}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.03em', marginBottom: 14 }}>Status Overview</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Resolved', v: resolved, c: '#22c55e' },
                { l: 'Pending', v: pending, c: '#f59e0b' },
                { l: 'In Progress', v: inProgress, c: '#3b82f6' },
              ].map(x => (
                <div key={x.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: x.c, display: 'inline-block' }} />
                      {x.l}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, color: x.c }}>{x.v} ({total > 0 ? Math.round((x.v / total) * 100) : 0}%)</span>
                  </div>
                  <div style={{ height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total > 0 ? (x.v / total) * 100 : 0}%`, background: x.c, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#374151' }}>Total</span>
                <span style={{ fontSize: 13, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, color: '#f1f5f9' }}>{total}</span>
              </div>
            </div>
          </div>

          {/* Recent complaints table */}
          <div style={{ ...C, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={scTitle}>Recent Complaints</span>
              <Link to="/admin/complaints" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>View all</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#111' }}>
                  {['#', 'Title', 'Location', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 28, textAlign: 'center', color: '#374151', fontSize: 13 }}>No complaints yet</td></tr>
                ) : complaints.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #111', background: i % 2 ? '#080808' : 'transparent' }}>
                    <td style={{ padding: '9px 12px', color: '#374151' }}>{i + 1}</td>
                    <td style={{ padding: '9px 12px', color: '#d1d5db', fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                    <td style={{ padding: '9px 12px', color: '#4b5563', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{c.address || `${Number(c.lat)?.toFixed(2)}, ${Number(c.lng)?.toFixed(2)}`}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'capitalize', background: `${statusColor[c.status]}18`, color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}35` }}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '10px 16px', borderTop: '1px solid #1a1a1a' }}>
              <Link to="/admin/complaints" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>View All Complaints →</Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div style={{ ...C, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={scTitle}>Activity Timeline</span>
              <Link to="/admin/complaints" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>View all</Link>
            </div>
            {[
              { icon: '📋', t: 'Total Complaints Filed', s: `${total} complaints overall`, v: 'System' },
              { icon: '⏳', t: 'Pending Review', s: `${pending} awaiting assignment`, v: 'Now' },
              { icon: '🔄', t: 'In Progress', s: `${inProgress} being worked on`, v: 'Active' },
              { icon: '✅', t: 'Resolved', s: `${resolved} closed successfully`, v: `${resRate}%` },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#111', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{item.icon}</div>
                  {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: '#1a1a1a', marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db', marginBottom: 1 }}>{item.t}</div>
                  <div style={{ fontSize: 11, color: '#4b5563' }}>{item.s}</div>
                  <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2, fontWeight: 700 }}>{item.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 — Worker Performance | Quick Actions | Today's Impact */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 250px', gap: 12 }}>

          {/* Worker Performance / Level badges */}
          <div style={{ ...C, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}>
              <span style={scTitle}>Worker Performance</span>
              <Link to="/admin/workers" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>View all</Link>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600 }}>Level 1</span>
                <span style={{ fontSize: 12, color: '#4b5563' }}>{resolved} / {Math.max(total, 20)} pts</span>
              </div>
              <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden', marginBottom: 18 }}>
                <div style={{ height: '100%', width: `${Math.min((resolved / Math.max(total, 1)) * 100, 100)}%`, background: '#22c55e', borderRadius: 3, transition: '0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[1, 2, 3, 4, 5].map(l => <LevelBadge key={l} level={l} unlocked={l === 1} />)}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ ...C, padding: 16 }}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.03em', marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { icon: <FiClipboard size={18} />, label: 'All Complaints', sub: 'Manage & assign', color: '#22c55e', to: '/admin/complaints' },
                { icon: <FiUsers size={18} />, label: 'Manage Users', sub: 'Citizens & roles', color: '#3b82f6', to: '/admin/users' },
                { icon: <FiMap size={18} />, label: 'City Map', sub: 'Live heatmap', color: '#8b5cf6', to: '/admin/map' },
              ].map((a, i) => (
                <Link key={i} to={a.to} style={{ textDecoration: 'none', padding: '14px 12px', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = a.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                  <div style={{ color: a.color }}>{a.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#d1d5db' }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: '#4b5563' }}>{a.sub}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's Impact */}
          <div style={{ ...C, padding: 16 }}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 14, fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.03em', marginBottom: 14 }}>Today's Impact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '✅', label: 'Issues Resolved', val: resolved, color: '#22c55e' },
                { icon: '\u23F1\uFE0F', label: 'Avg. Resolution', val: '-- hrs', color: '#3b82f6' },
                { icon: '👷', label: 'Active Workers', val: stats.total_workers || 0, color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 20, fontWeight: 700, color: item.color, lineHeight: 1.2 }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
