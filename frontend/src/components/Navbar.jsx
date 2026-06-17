import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/stores', label: 'Stores' },
        ];
      case 'store_owner':
        return [
          { to: '/owner', label: 'Dashboard' },
        ];
      case 'user':
      default:
        return [
          { to: '/dashboard', label: 'Stores' },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="navbar-logo">⭐</span>
            <span className="navbar-title gradient-text">StoreRate</span>
          </Link>
          <div className="navbar-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="navbar-right">
          <Link to="/change-password" className="navbar-link navbar-link-sm">
            Change Password
          </Link>
          <div className="navbar-user">
            <span className="navbar-user-name">{user?.name}</span>
            <span className={`navbar-user-role badge badge-${user?.role === 'admin' ? 'admin' : user?.role === 'store_owner' ? 'owner' : 'user'}`}>
              {user?.role === 'store_owner' ? 'Owner' : user?.role}
            </span>
          </div>
          <button className="navbar-logout" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
