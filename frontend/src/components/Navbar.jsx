import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">
            HomiGo
          </Link>
          {!isMobile && (
            <>
              <Link to="/listings">Explore</Link>
              {user && <Link to="/my-bookings">My Bookings</Link>}
              {user?.role === 'host' && <Link to="/host/listings">Host Dashboard</Link>}
            </>
          )}
        </div>
        <div className="nav-right">
          {!isMobile && (
            <>
              {user ? (
                <>
                  <span className="muted">Hi, {user.name}</span>
                  <button type="button" onClick={handleLogout} className="link-button">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Log in</Link>
                  <Link to="/register">
                    <button className="btn-primary" style={{ padding: '10px 20px', margin: 0 }}>
                      Sign up
                    </button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        {isMobile && (
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </nav>
      {mobileMenuOpen && isMobile && (
        <div 
          ref={menuRef}
          className="mobile-menu"
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: 'var(--shadow-md)',
            padding: '20px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderTop: '1px solid var(--airbnb-light-gray)'
          }}
        >
          <Link to="/listings" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
          {user && <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>}
          {user?.role === 'host' && <Link to="/host/listings" onClick={() => setMobileMenuOpen(false)}>Host Dashboard</Link>}
          {user ? (
            <>
              <span className="muted">Hi, {user.name}</span>
              <button type="button" onClick={handleLogout} className="link-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;

