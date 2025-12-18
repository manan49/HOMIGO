import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [form, setForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 1,
  });

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get(`/api/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load listing';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      await axiosClient.post('/api/bookings', {
        listingId: id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guestsCount: Number(form.guestsCount),
      });
      setBookingSuccess('Booking created successfully');
      setTimeout(() => navigate('/my-bookings'), 600);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create booking';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="muted">Loading...</div>
    </div>
  );
  if (error) return <div className="page error">{error}</div>;
  if (!listing) return null;

  const isBookable = listing.type === 'room' || listing.type === 'rent_home';
  const getTypeEmoji = () => {
    switch(listing.type) {
      case 'room': return '🛏️';
      case 'rent_home': return '🏠';
      case 'cafe': return '☕';
      default: return '📍';
    }
  };

  return (
    <div className="listing-detail">
      <div className="listing-detail-header">
        <h1 className="listing-detail-title">{listing.title}</h1>
        <div className="listing-detail-meta">
          <span>{getTypeEmoji()} {listing.type?.replace('_', ' ')}</span>
          <span>📍 {listing.city}{listing.address ? `, ${listing.address}` : ''}</span>
        </div>
        {listing.pricePerNight !== undefined && listing.pricePerNight !== null && (
          <div className="listing-detail-price">
            ₹{listing.pricePerNight} <span style={{ fontWeight: 400, fontSize: '16px' }}>/ night</span>
          </div>
        )}
      </div>

      <div className="listing-detail-content">
        <div className="listing-detail-main">
          {listing.images && Array.isArray(listing.images) && listing.images.length > 0 ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                width: '100%', 
                height: '400px', 
                borderRadius: 'var(--border-radius-lg)',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: 'var(--border-radius-lg)'
                  }}
                />
              </div>
              {listing.images.length > 1 && (
                <div className="image-preview-grid" style={{ marginTop: '12px' }}>
                  {listing.images.slice(1).map((img, idx) => (
                    <div key={idx} className="image-preview-item" style={{ aspectRatio: '1' }}>
                      <img src={img} alt={`${listing.title} ${idx + 2}`} className="image-preview" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '400px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 'var(--border-radius-lg)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '64px'
            }}>
              {getTypeEmoji()}
            </div>
          )}

          {listing.maxGuests !== undefined && listing.maxGuests !== null && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>About this place</h3>
              <p className="muted">Maximum guests: {listing.maxGuests}</p>
            </div>
          )}

          {listing.amenities && listing.amenities.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Amenities</h3>
              <div className="amenities-list">
                {listing.amenities.map((amenity, idx) => (
                  <span key={idx} className="amenity-tag">{amenity}</span>
                ))}
              </div>
            </div>
          )}

          {!isBookable && (
            <div className="error" style={{ marginTop: '16px' }}>
              ☕ Cafes cannot be booked. Please visit during operating hours.
            </div>
          )}
        </div>

        {isBookable && (
          <div className="listing-detail-sidebar">
            <div className="booking-card">
              <h3 style={{ marginBottom: '20px' }}>Book this {listing.type === 'room' ? 'room' : 'home'}</h3>
              <form className="form" onSubmit={submitBooking} style={{ maxWidth: '100%' }}>
                <label>
                  Check-in date
                  <input 
                    type="date" 
                    name="checkInDate" 
                    value={form.checkInDate} 
                    onChange={handleChange} 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </label>
                <label>
                  Check-out date
                  <input 
                    type="date" 
                    name="checkOutDate" 
                    value={form.checkOutDate} 
                    onChange={handleChange} 
                    required 
                    min={form.checkInDate || new Date().toISOString().split('T')[0]}
                  />
                </label>
                <label>
                  Guests
                  <input
                    type="number"
                    name="guestsCount"
                    min="1"
                    max={listing.maxGuests || 10}
                    value={form.guestsCount}
                    onChange={handleChange}
                    required
                  />
                  {listing.maxGuests && (
                    <span className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                      Maximum {listing.maxGuests} guests
                    </span>
                  )}
                </label>
                <button type="submit" disabled={bookingLoading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  {bookingLoading ? 'Booking...' : 'Reserve'}
                </button>
              </form>
              {bookingError && <div className="error" style={{ marginTop: '12px' }}>{bookingError}</div>}
              {bookingSuccess && <div className="success" style={{ marginTop: '12px' }}>{bookingSuccess}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingDetail;

