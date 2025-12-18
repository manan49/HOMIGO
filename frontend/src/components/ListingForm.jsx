import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

function ListingForm({ listingId, onSuccess }) {
  const [form, setForm] = useState({
    type: 'room',
    title: '',
    description: '',
    city: '',
    address: '',
    pricePerNight: '',
    maxGuests: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!listingId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get(`/api/listings/${listingId}`);
        const l = res.data;
        setForm({
          type: l.type || 'room',
          title: l.title || '',
          description: l.description || '',
          city: l.city || '',
          address: l.address || '',
          pricePerNight: l.pricePerNight ?? '',
          maxGuests: l.maxGuests ?? '',
        });
        if (l.images && Array.isArray(l.images)) {
          setImages(l.images);
          setImagePreviews(l.images);
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load listing';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          setImagePreviews((prev) => [...prev, result]);
          setImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        type: form.type,
        title: form.title,
        description: form.description,
        city: form.city,
        address: form.address,
        pricePerNight:
          form.type === 'room' || form.type === 'rent_home'
            ? Number(form.pricePerNight || 0)
            : undefined,
        maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
        images: images.length > 0 ? images : undefined,
      };

      if (listingId) {
        await axiosClient.put(`/api/listings/${listingId}`, payload);
      } else {
        await axiosClient.post('/api/listings', payload);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save listing';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const showPrice = form.type === 'room' || form.type === 'rent_home';

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Type
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="room">Room</option>
          <option value="rent_home">Rent home</option>
          <option value="cafe">Cafe</option>
        </select>
      </label>
      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>
      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
      </label>
      <label>
        City
        <input name="city" value={form.city} onChange={handleChange} required />
      </label>
      <label>
        Address
        <input name="address" value={form.address} onChange={handleChange} />
      </label>
      {showPrice && (
        <label>
          Price per night
          <input
            type="number"
            name="pricePerNight"
            min="0"
            value={form.pricePerNight}
            onChange={handleChange}
            required
          />
        </label>
      )}
      <label>
        Max guests
        <input type="number" name="maxGuests" min="1" value={form.maxGuests} onChange={handleChange} />
      </label>

      <label>
        Photos
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{ padding: '8px', border: '1px solid var(--airbnb-light-gray)', borderRadius: 'var(--border-radius)' }}
        />
        <span className="muted" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
          You can select multiple images
        </span>
      </label>

      {imagePreviews.length > 0 && (
        <div className="image-preview-container">
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Selected Photos ({imagePreviews.length})</h4>
          <div className="image-preview-grid">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} className="image-preview" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="image-remove-btn"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
        {loading ? 'Saving...' : listingId ? 'Update listing' : 'Create listing'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

export default ListingForm;

