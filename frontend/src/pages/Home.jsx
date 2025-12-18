import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useGeolocation } from '../utils/useGeolocation';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CITY = 'Ahmedabad';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  const [rooms, setRooms] = useState([]);
  const [rentHomes, setRentHomes] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('all');

  const fetchRecommendations = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/api/listings/recommendations', { params });
      setRooms(res.data.rooms || []);
      setRentHomes(res.data.rentHomes || []);
      setCafes(res.data.cafes || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load recommendations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const res = await axiosClient.get('/api/listings');
      setFeatured(res.data?.slice(0, 8) || []);
    } catch (err) {
      // silent fail for featured
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity.trim()) params.append('city', searchCity.trim());
    if (searchType !== 'all') params.append('type', searchType);
    navigate(`/listings?${params.toString()}`);
  };

  useEffect(() => {
    if (!user) {
      fetchFeatured();
      return;
    }
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (coords) {
      fetchRecommendations({ lat: coords.lat, lng: coords.lng });
    } else if (geoError) {
      fetchRecommendations({ city: DEFAULT_CITY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, geoError, user]);

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
          <section>
            <h2>Explore Featured Places</h2>
            {featured.length > 0 ? (
              <div className="grid">
                {featured.map((item) => (
                  <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                    <ListingCard {...item} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
                No listings available yet
              </div>
            )}
          </section>
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
        <p>Discover amazing places near you</p>
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
        <button 
          onClick={() => requestLocation()} 
          disabled={geoLoading}
          style={{ 
            marginTop: '16px', 
            background: 'rgba(255, 255, 255, 0.2)', 
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {geoLoading ? 'Locating…' : '📍 Use my location'}
        </button>
      </div>

      <div className="page">
        {error && <div className="error">{error}</div>}
        {geoError && <div className="error">Location error: {geoError}</div>}

        {rooms.length > 0 && (
          <section>
            <h2>🛏️ Rooms near you</h2>
            <div className="grid">
              {rooms.map((item) => (
                <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                  <ListingCard {...item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {rentHomes.length > 0 && (
          <section>
            <h2>🏠 Rent homes near you</h2>
            <div className="grid">
              {rentHomes.map((item) => (
                <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                  <ListingCard {...item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {cafes.length > 0 && (
          <section>
            <h2>☕ Cafes near you</h2>
            <div className="grid">
              {cafes.map((item) => (
                <div key={item._id} onClick={() => navigate(`/listings/${item._id}`)}>
                  <ListingCard {...item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
            Loading recommendations…
          </div>
        )}

        {!loading && !rooms.length && !rentHomes.length && !cafes.length && (
          <section style={{ textAlign: 'center', padding: '40px 0' }}>
            <h2>No recommendations yet</h2>
            <p className="muted">Try searching for a specific city or explore all listings</p>
            <button className="btn-primary" onClick={() => navigate('/listings')} style={{ marginTop: '16px' }}>
              Explore All Listings
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default Home;

