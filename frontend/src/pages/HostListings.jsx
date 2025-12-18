import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

function HostListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get('/api/listings');
        const all = res.data || [];
        const mine = user ? all.filter((l) => l.ownerId === user.id) : [];
        setItems(mine);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load listings';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Listings</h2>
        <Link to="/host/listings/new" className="btn-primary">New Listing</Link>
      </div>
      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
      {loading && (
        <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
          Loading...
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="grid" style={{ marginTop: 16 }}>
          {items.map((item) => (
            <div key={item._id}>
              <div onClick={() => navigate(`/listings/${item._id}`)}>
                <ListingCard {...item} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Link to={`/host/listings/${item._id}/edit`} className="link-button">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !items.length && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📄</div>
          <h3 style={{ marginBottom: '8px' }}>You have no listings yet</h3>
          <p className="muted" style={{ marginBottom: '16px' }}>
            Create your first listing to start hosting
          </p>
          <Link to="/host/listings/new" className="btn-primary">Create Listing</Link>
        </div>
      )}
    </div>
  );
}

export default HostListings;
