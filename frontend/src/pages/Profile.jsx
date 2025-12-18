import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="page">
      <h2>My Profile</h2>
      <div className="card" style={{ maxWidth: 520 }}>
        <div style={{ fontSize: 48 }}>👤</div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>{user.name || 'User'}</div>
          <div className="muted">{user.email}</div>
          <div className="muted" style={{ marginTop: 6 }}>Role: {user.role}</div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
