import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('all');

  const fetchAllListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/api/listings');
      setItems(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load listings';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity.trim()) params.append('city', searchCity.trim());
    if (searchType !== 'all') params.append('type', searchType);
    navigate(`/listings?${params.toString()}`);
  };

  useEffect(() => {
    fetchAllListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div>
        <div className="hero">
          <h1>Find your next adventure</h1>
          <p>Discover unique places to stay, rent, and dine around the world</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Where to?"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="room">Room</option>
              <option value="rent_home">Rent Home</option>
              <option value="cafe">Cafe</option>
            </select>
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
        <div className="page">
          {loading && (
            <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
              Loading listings…
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {!loading && items.length > 0 && (
            <section>
              <h2>Explore All Listings</h2>
              <div className="grid">
                {items.map((item) => (
                  <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                    <ListingCard {...item} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {!loading && !items.length && (
            <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
              No listings available yet
            </div>
          )}
          <section style={{ textAlign: 'center', padding: '40px 0' }}>
            <h2>Ready to explore?</h2>
            <p className="muted" style={{ marginBottom: '24px' }}>
              Sign in to see personalized recommendations based on your location
            </p>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Get Started
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero">
        <h1>Where to next?</h1>
        <p>Discover amazing places</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="room">Room</option>
            <option value="rent_home">Rent Home</option>
            <option value="cafe">Cafe</option>
          </select>
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="page">
        {error && <div className="error">{error}</div>}

        {loading && (
          <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
            Loading listings…
          </div>
        )}
        {!loading && items.length > 0 && (
          <section>
            <h2>All Listings</h2>
            <div className="grid">
              {items.map((item) => (
                <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                  <ListingCard {...item} />
                </div>
              ))}
            </div>
          </section>
        )}
        {!loading && !items.length && (
          <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
            No listings available yet
          </div>
        )}

        
      </div>
    </div>
  );
}

export default Home;
