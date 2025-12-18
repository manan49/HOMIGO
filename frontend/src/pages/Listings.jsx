import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ListingCard from '../components/ListingCard';

function Listings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (city.trim()) params.city = city.trim();
      if (type !== 'all') params.type = type;
      const res = await axiosClient.get('/api/listings', { params });
      setItems(res.data || []);
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
  }, [city, type]);

  const clearFilters = () => {
    setCity('');
    setType('all');
  };

  const hasActiveFilters = city.trim() || type !== 'all';

  return (
    <div className="page">
      <header>
        <h2 style={{ margin: 0 }}>Explore All Listings</h2>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="link-button">
            Clear filters
          </button>
        )}
      </header>

      <div className="filters">
        <label>
          <span style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>📍 Location</span>
          <input 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            placeholder="Search by city..." 
            style={{ width: '100%' }}
          />
        </label>
        <label>
          <span style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>🏷️ Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
            <option value="all">All Types</option>
            <option value="room">🛏️ Room</option>
            <option value="rent_home">🏠 Rent Home</option>
            <option value="cafe">☕ Cafe</option>
          </select>
        </label>
      </div>

      {loading && (
        <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
          Loading listings...
        </div>
      )}
      {error && <div className="error">{error}</div>}

      {!loading && items.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <p className="muted" style={{ marginBottom: '16px' }}>
            Found {items.length} {items.length === 1 ? 'listing' : 'listings'}
          </p>
          <div className="grid">
            {items.map((item) => (
              <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                <ListingCard {...item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !items.length && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ marginBottom: '8px' }}>No listings found</h3>
          <p className="muted" style={{ marginBottom: '24px' }}>
            Try adjusting your search filters or explore different locations
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Listings;

