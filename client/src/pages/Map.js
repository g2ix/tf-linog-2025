import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { apiService } from '../services/api';
import './Map.css';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 10.3157,
  lng: 123.8854
};

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'your-api-key-here'
  });

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const response = await apiService.getMarkers();
      setMarkers(response.data);
    } catch (error) {
      console.error('Error fetching markers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  if (!isLoaded) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="map-page">
      <div className="container">
        <div className="map-header">
          <h1>Affected Areas Map</h1>
          <p>Interactive map showing earthquake-affected areas in Cebu</p>
        </div>

        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={{
                  lat: parseFloat(marker.latitude),
                  lng: parseFloat(marker.longitude)
                }}
                onClick={() => handleMarkerClick(marker)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#dc3545" stroke="#fff" stroke-width="2"/>
                      <path d="M20 8 L24 16 L32 16 L26 22 L28 30 L20 24 L12 30 L14 22 L8 16 L16 16 Z" fill="#fff"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20)
                }}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={{
                  lat: parseFloat(selectedMarker.latitude),
                  lng: parseFloat(selectedMarker.longitude)
                }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="info-window">
                  <h3>{selectedMarker.description}</h3>
                  {selectedMarker.image_url && (
                    <div className="info-image">
                      <img 
                        src={selectedMarker.image_url} 
                        alt={selectedMarker.description}
                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="info-meta">
                    <p><FaMapMarkerAlt /> {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}</p>
                    <p><FaInfoCircle /> Added: {new Date(selectedMarker.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        <div className="map-legend">
          <h3>Map Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-marker"></div>
              <span>Affected Area</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker emergency"></div>
              <span>Emergency Location</span>
            </div>
          </div>
        </div>

        <div className="map-info">
          <h3>Map Information</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>Total Markers</h4>
              <p>{markers.length}</p>
            </div>
            <div className="info-card">
              <h4>Last Updated</h4>
              <p>{markers.length > 0 ? new Date(Math.max(...markers.map(m => new Date(m.created_at))).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="info-card">
              <h4>Map Center</h4>
              <p>Cebu City, Philippines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
