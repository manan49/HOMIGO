import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

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
      await axiosClient.put(`/api/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      setActionError(msg);
    }
  };

  return (
    <div className="page">
      <h2>My Bookings</h2>
      {loading && <div className="muted">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {actionError && <div className="error">{actionError}</div>}

      {!loading && !bookings.length && <div className="muted">No bookings yet</div>}

      <div className="list">
        {bookings.map((b) => (
          <div key={b._id} className="card">
            <h4>{b.listingId?.title || 'Listing'}</h4>
            <div className="muted">
              {b.listingId?.city} • {b.listingId?.type}
            </div>
            <div className="muted">
              {new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}
            </div>
            <div>Total: ₹{b.totalAmount}</div>
            <div>Status: {b.status}</div>
            {canCancel(b) && (
              <button type="button" onClick={() => cancelBooking(b._id)}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;

