import { useCallback, useState } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser');
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to get location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { coords, error, loading, requestLocation };
}

