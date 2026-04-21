import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiPlus, FiList, FiMap, FiGift,
  FiBriefcase, FiLogOut, FiClipboard, FiUsers,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

const navByCitizen = [
  { to: '/citizen', icon: <FiHome size={16} />, label: 'Dashboard' },
  { to: '/citizen/new-complaint', icon: <FiPlus size={16} />, label: 'Report Issue' },
  { to: '/citizen/complaints', icon: <FiList size={16} />, label: 'My Complaints' },
  { to: '/citizen/map', icon: <FiMap size={16} />, label: 'Live Map' },
  { to: '/citizen/rewards', icon: <FiGift size={16} />, label: 'Rewards' },
];

const navByWorker = [
  { to: '/worker', icon: <FiHome size={16} />, label: 'Dashboard' },
  { to: '/worker/complaints', icon: <FiClipboard size={16} />, label: 'Assigned Tasks' },
  { to: '/worker/map', icon: <FiMap size={16} />, label: 'Navigate' },
];

const navByAdmin = [
  { to: '/admin', icon: <FiHome size={16} />, label: 'Dashboard' },
  { to: '/admin/complaints', icon: <FiClipboard size={16} />, label: 'Complaints' },
  { to: '/admin/users', icon: <FiUsers size={16} />, label: 'Citizens' },
  { to: '/admin/workers', icon: <FiBriefcase size={16} />, label: 'Workers' },
  { to: '/admin/map', icon: <FiMap size={16} />, label: 'City Map' },
];

const Sidebar = ({ collapsed = false, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? navByAdmin
    : user?.role === 'worker' ? navByWorker
    : navByCitizen;

  const roleColor = user?.role === 'admin' ? '#f59e0b'
    : user?.role === 'worker' ? '#3b82f6' : '#22c55e';

  const W = collapsed ? 64 : 240;

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: W, height: '100vh',
      background: '#0d0d0d',
      borderRight: '1px solid #1a1a1a',
      display: 'flex', flexDirection: 'column',
      zIndex: 100, overflow: 'hidden',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>

      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px', borderBottom: '1px solid #1a1a1a', flexShrink: 0, minHeight: 56 }}>
        {/* Green dot always visible */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', flexShrink: 0, animation: 'sideGlow 2s infinite' }} />
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Nagar e-Connect</div>
            <div style={{ fontSize: 9, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>Swachh Bharat Initiative</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <div style={{ fontSize: 9, fontWeight: 700, color: '#374151', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 6px', marginBottom: 6 }}>Menu</div>
        )}
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            title={collapsed ? item.label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '9px 10px',
              borderRadius: 7,
              color: isActive ? '#22c55e' : '#4b5563',
              background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
              borderLeft: isActive && !collapsed ? '2px solid #22c55e' : '2px solid transparent',
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13, fontWeight: 500,
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            })}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle button */}
      {/* Toggle button — icon only, no text */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand' : 'Collapse'}
        style={{
          margin: '0 8px 8px',
          padding: '7px',
          background: '#111', border: '1px solid #1a1a1a',
          borderRadius: 7, cursor: 'pointer',
          color: '#4b5563', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'color 0.15s, border-color 0.15s',
          flexShrink: 0, width: collapsed ? 36 : 36, alignSelf: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#22c55e'; e.currentTarget.style.borderColor = '#22c55e55'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
      >
        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {/* User card */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '14px 0' : '12px 14px',
        borderTop: '1px solid #1a1a1a',
        background: '#0a0a0a', flexShrink: 0,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${roleColor}`, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', color: roleColor, flexShrink: 0, cursor: 'default' }}
          title={collapsed ? `${user?.name} · ${user?.role}` : undefined}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: roleColor, textTransform: 'capitalize', marginTop: 1 }}>
                {user?.role}{user?.role === 'citizen' && user?.points != null ? ` · ${user.points} pts` : ''}
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 6px', borderRadius: 5, transition: 'color 0.15s', flexShrink: 0 }}
              title="Sign out"
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#374151'}
            >
              <FiLogOut size={14} />
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes sideGlow {
          0%,100% { box-shadow: 0 0 6px #22c55e; }
          50% { box-shadow: 0 0 12px #22c55e; }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
