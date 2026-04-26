import { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiPlus, FiList, FiMap, FiGift,
  FiBriefcase, FiLogOut, FiClipboard, FiUsers, FiGrid,
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

const navByCitizen = [
  { to: '/citizen',               icon: <FiHome size={15} />,      label: 'Dashboard' },
  { to: '/citizen/new-complaint', icon: <FiPlus size={15} />,      label: 'Report Issue' },
  { to: '/citizen/complaints',    icon: <FiList size={15} />,      label: 'My Complaints' },
  { to: '/citizen/map',           icon: <FiMap size={15} />,       label: 'Live Map' },
  { to: '/citizen/rewards',       icon: <FiGift size={15} />,      label: 'Rewards' },
];

const navByWorker = [
  { to: '/worker',            icon: <FiHome size={15} />,      label: 'Dashboard' },
  { to: '/worker/complaints', icon: <FiClipboard size={15} />, label: 'Assigned Tasks' },
  { to: '/worker/map',        icon: <FiMap size={15} />,       label: 'Navigate' },
];

const navByAdmin = [
  { to: '/admin',             icon: <FiHome size={15} />,      label: 'Dashboard' },
  { to: '/admin/complaints',  icon: <FiClipboard size={15} />, label: 'Complaints' },
  { to: '/admin/users',       icon: <FiUsers size={15} />,     label: 'Citizens' },
  { to: '/admin/workers',     icon: <FiBriefcase size={15} />, label: 'Workers' },
  { to: '/admin/map',         icon: <FiMap size={15} />,       label: 'City Map' },
];

const dashboardByRole = { admin: '/admin', worker: '/worker', citizen: '/citizen' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const navItems = user?.role === 'admin' ? navByAdmin
    : user?.role === 'worker' ? navByWorker
    : navByCitizen;

  const roleColor = user?.role === 'admin' ? '#f59e0b'
    : user?.role === 'worker' ? '#3b82f6' : '#22c55e';

  const dashPath = dashboardByRole[user?.role] || '/';

  // Close dropdown on outside click
  const handleBlur = (e) => {
    if (!dropRef.current?.contains(e.relatedTarget)) {
      setDropOpen(false);
    }
  };

  return (
    <header className={styles.topNav}>
      {/* ── Brand → Dashboard ── */}
      <button
        className={styles.brand}
        onClick={() => navigate(dashPath)}
        title="Go to Dashboard"
      >
        <div className={styles.brandDot} />
        <div>
          <div className={styles.brandName}>Nagar e-Connect</div>
          <div className={styles.brandSub}>Swachh Bharat Initiative</div>
        </div>
      </button>

      {/* ── Nav links ── */}
      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── User dropdown ── */}
      <div
        className={styles.userBlock}
        ref={dropRef}
        tabIndex={0}
        onBlur={handleBlur}
        onClick={() => setDropOpen(o => !o)}
        title="Account menu"
      >
        <div
          className={styles.userAvatar}
          style={{ borderColor: roleColor, color: roleColor }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name}</div>
          <div className={styles.userRole} style={{ color: roleColor }}>
            {user?.role}
            {user?.role === 'citizen' && user?.points != null ? ` · ${user.points} pts` : ''}
          </div>
        </div>

        {/* Dropdown */}
        {dropOpen && (
          <div className={styles.dropdown}>
            <button
              className={styles.dropItem}
              onMouseDown={() => { navigate(dashPath); setDropOpen(false); }}
            >
              <FiGrid size={13} />
              Dashboard
            </button>
            <div className={styles.dropDivider} />
            <button
              className={`${styles.dropItem} ${styles.dropDanger}`}
              onMouseDown={() => { logout(); navigate('/'); }}
            >
              <FiLogOut size={13} />
              Log out
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes topGlow {
          0%,100% { box-shadow: 0 0 6px #22c55e; }
          50%      { box-shadow: 0 0 14px #22c55e; }
        }
        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default Sidebar;
