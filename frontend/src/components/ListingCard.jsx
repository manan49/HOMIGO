import { useState } from 'react';

function ListingCard({ title, city, type, pricePerNight, distanceKm, _id, images }) {
  const [imageError, setImageError] = useState(false);

  // Use uploaded images if available, otherwise use placeholder
  const getImageUrl = () => {
    if (images && Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    // Generate a placeholder image based on listing ID or type
    const imageNumber = _id ? parseInt(_id.slice(-1), 16) % 10 : Math.floor(Math.random() * 10);
    const imageIds = [
      '1524758631624', '1524758631625', '1524758631626', '1524758631627', '1524758631628',
      '1524758631629', '1524758631630', '1524758631631', '1524758631632', '1524758631633'
    ];
    return `https://images.unsplash.com/photo-${imageIds[imageNumber]}?w=400&h=300&fit=crop`;
  };

  const getTypeEmoji = () => {
    switch(type) {
      case 'room': return '🛏️';
      case 'rent_home': return '🏠';
      case 'cafe': return '☕';
      default: return '📍';
    }
  };

  return (
    <div className="card">
      <div className="card-image">
        {!imageError ? (
          <img 
            src={getImageUrl()} 
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            {getTypeEmoji()}
          </div>
        )}
      </div>
      <div className="card-content">
        <h4 className="card-title">{title}</h4>
        <div className="card-location">{city}</div>
        <div className="card-type">{getTypeEmoji()} {type?.replace('_', ' ')}</div>
        {pricePerNight !== undefined && pricePerNight !== null && (
          <div className="card-price">₹{pricePerNight} <span style={{ fontWeight: 400 }}>/ night</span></div>
        )}
        {distanceKm !== undefined && (
          <div className="card-distance">~{distanceKm.toFixed(1)} km away</div>
        )}
      </div>
    </div>
  );
}

export default ListingCard;

