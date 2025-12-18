import React from 'react';

function MapEmbed({ lat, lng, zoom = 14, height = 300 }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&z=${encodeURIComponent(zoom)}&output=embed`;
  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', border: '1px solid var(--airbnb-light-gray)' }}>
      <iframe
        title="map"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default MapEmbed;
