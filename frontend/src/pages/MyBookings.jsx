import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/api/bookings/my');
      setBookings(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load bookings';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const canCancel = (booking) => {
    if (!booking) return false;
    const statusOk = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    return statusOk && checkIn > today;
  };

  const cancelBooking = async (id) => {
    try {
      setActionError(null);
      setCancellingId(id);
      await axiosClient.put(`/api/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      setActionError(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const getTypeEmoji = (type) => {
    if (type === 'room') return '🛏️';
    if (type === 'rent_home') return '🏠';
    if (type === 'cafe') return '☕';
    return '📍';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();
  const nightsBetween = (a, b) => {
    const start = new Date(a);
    const end = new Date(b);
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };
  const isPast = (booking) => new Date(booking.checkOutDate) < new Date();
  const statusStyle = (status) => {
    if (status === 'CONFIRMED') return { background: '#e7f6e7', color: '#1e7e34', border: '1px solid #c9e9c9' };
    if (status === 'PENDING') return { background: '#fff8e6', color: '#a66f00', border: '1px solid #ffe3a1' };
    return { background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
  };

  const sorted = [...bookings].sort((a, b) => {
    const aPast = isPast(a);
    const bPast = isPast(b);
    if (aPast !== bPast) return aPast ? 1 : -1;
    return new Date(a.checkInDate) - new Date(b.checkInDate);
  });
  const upcoming = sorted.filter((b) => !isPast(b));
  const past = sorted.filter((b) => isPast(b));

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>My Bookings</h2>
        <div className="muted">{bookings.length} total</div>
      </div>
      {loading && (
        <div className="muted" style={{ textAlign: 'center', padding: '40px' }}>
          Loading...
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {actionError && <div className="error">{actionError}</div>}

      {!loading && !bookings.length && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧳</div>
          <h3 style={{ marginBottom: '8px' }}>No bookings yet</h3>
          <p className="muted">Find a place and make your first reservation</p>
        </div>
      )}

      {!!upcoming.length && (
        <section style={{ marginTop: '16px' }}>
          <h3 style={{ marginBottom: '12px' }}>Upcoming</h3>
          <div className="grid">
            {upcoming.map((b) => {
              const nights = nightsBetween(b.checkInDate, b.checkOutDate);
              return (
                <div key={b._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{b.listingId?.title || 'Listing'}</h4>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '6px 10px',
                        borderRadius: 999,
                        ...statusStyle(b.status),
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {getTypeEmoji(b.listingId?.type)} {b.listingId?.type?.replace('_', ' ')} • {b.listingId?.city}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{nights} {nights === 1 ? 'night' : 'nights'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>₹{b.totalAmount}</div>
                      {typeof b.listingId?.pricePerNight === 'number' && (
                        <div className="muted" style={{ fontSize: 12 }}>₹{b.listingId.pricePerNight} / night</div>
                      )}
                    </div>
                  </div>
                  {canCancel(b) && (
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => cancelBooking(b._id)}
                        className="btn-primary"
                        disabled={cancellingId === b._id}
                      >
                        {cancellingId === b._id ? 'Cancelling…' : 'Cancel booking'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!!past.length && (
        <section style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Past</h3>
          <div className="grid">
            {past.map((b) => {
              const nights = nightsBetween(b.checkInDate, b.checkOutDate);
              return (
                <div key={b._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{b.listingId?.title || 'Listing'}</h4>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '6px 10px',
                        borderRadius: 999,
                        ...statusStyle(b.status),
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {getTypeEmoji(b.listingId?.type)} {b.listingId?.type?.replace('_', ' ')} • {b.listingId?.city}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{nights} {nights === 1 ? 'night' : 'nights'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>₹{b.totalAmount}</div>
                      {typeof b.listingId?.pricePerNight === 'number' && (
                        <div className="muted" style={{ fontSize: 12 }}>₹{b.listingId.pricePerNight} / night</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default MyBookings;
