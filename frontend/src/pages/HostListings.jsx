import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

function HostListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/api/listings');
      const all = res.data || [];
      const mine = user ? all.filter((l) => l.ownerId === user.id || l.ownerId === user._id) : [];
      setItems(mine);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load listings';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteListing = async (id) => {
    try {
      setActionError(null);
      await axiosClient.delete(`/api/listings/${id}`);
      setItems((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete listing';
      setActionError(msg);
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Listings</h2>
        <button type="button" onClick={() => navigate('/host/listings/new')}>
          Add Listing
        </button>
      </div>

      {loading && <div className="muted">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {actionError && <div className="error">{actionError}</div>}
      {!loading && !items.length && <div className="muted">No listings yet</div>}

      <div className="grid" style={{ marginTop: '12px' }}>
        {items.map((item) => (
          <div key={item._id} className="card">
            <ListingCard {...item} />
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => navigate(`/host/listings/${item._id}/edit`)}>
                Edit
              </button>
              <button type="button" onClick={() => deleteListing(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HostListings;

