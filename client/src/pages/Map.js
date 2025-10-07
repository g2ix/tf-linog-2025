import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    fetchMarkers();
    initializeMap();
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

  const initializeMap = async () => {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      
      console.log('Environment check:');
      console.log('- NODE_ENV:', process.env.NODE_ENV);
      console.log('- API Key exists:', !!apiKey);
      console.log('- API Key value:', apiKey ? apiKey.substring(0, 20) + '...' : 'undefined');
      
      if (!apiKey || apiKey === 'your-api-key-here' || apiKey === 'YOUR_REAL_API_KEY_HERE') {
        console.warn('Google Maps API key not configured. Using fallback display.');
        setMapLoaded(true);
        return;
      }

      console.log('Attempting to load Google Maps with API key:', apiKey.substring(0, 20) + '...');

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      console.log('Loader created, attempting to load...');
      const google = await loader.load();
      console.log('Google Maps loaded successfully:', !!google);
      
      if (mapRef.current) {
        console.log('Creating map instance...');
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 11,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        console.log('Map instance created successfully');
        setMapLoaded(true);
      } else {
        console.error('Map ref is not available');
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Set map as loaded even if there's an error to show fallback content
      setMapLoaded(true);
    }
  };

  useEffect(() => {
    if (mapLoaded && markers.length > 0 && mapInstance.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      markers.forEach((markerData) => {
        const marker = new window.google.maps.Marker({
          position: {
            lat: parseFloat(markerData.latitude),
            lng: parseFloat(markerData.longitude)
          },
          map: mapInstance.current,
          title: markerData.description,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#dc3545" stroke="#fff" stroke-width="2"/>
                <path d="M20 8 L24 16 L32 16 L26 22 L28 30 L20 24 L12 30 L14 22 L8 16 L16 16 Z" fill="#fff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        });

        marker.addListener('click', () => {
          showInfoWindow(markerData, marker);
        });

        markersRef.current.push(marker);
      });
    }
  }, [mapLoaded, markers]);

  const showInfoWindow = (markerData, marker) => {
    // Use images from JSON if available, otherwise fall back to image_url
    const images = markerData.images && markerData.images.length > 0 ? markerData.images : 
                   (markerData.image_url ? [{ url: markerData.image_url, caption: markerData.description }] : []);
    
    const imagesHtml = images.length > 0 ? `
      <div class="info-images">
        ${images.map((img, index) => `
          <div class="info-image">
            <img src="${img.url}" alt="${img.caption || markerData.description}" 
                 style="max-width: 200px; max-height: 150px; object-fit: cover;" />
            ${img.caption ? `<p class="image-caption">${img.caption}</p>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    const content = `
      <div class="info-window">
        <h3>${markerData.description}</h3>
        ${imagesHtml}
        <div class="info-meta">
          <p><i class="fas fa-map-marker-alt"></i> ${parseFloat(markerData.latitude).toFixed(4)}, ${parseFloat(markerData.longitude).toFixed(4)}</p>
          <p><i class="fas fa-info-circle"></i> Added: ${new Date(markerData.created_at).toLocaleDateString()}</p>
          ${images.length > 1 ? `<p><i class="fas fa-images"></i> ${images.length} images</p>` : ''}
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstance.current, marker);
  };

  if (!mapLoaded) {
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
          <div ref={mapRef} style={mapContainerStyle}>
            {!mapLoaded && (
              <div className="map-loading">
                <div className="spinner"></div>
                <p>Loading map...</p>
              </div>
            )}
            {mapLoaded && !mapInstance.current && (
              <div className="map-fallback">
                <h3>Interactive Map</h3>
                <p>Google Maps is not available. Showing location information below.</p>
                <div className="fallback-markers">
                  <h4>Affected Areas:</h4>
                  {markers.map((marker) => (
                    <div key={marker.id} className="fallback-marker">
                      <strong>{marker.description}</strong>
                      <p>Coordinates: {parseFloat(marker.latitude).toFixed(4)}, {parseFloat(marker.longitude).toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
              <p>{markers.length > 0 ? new Date(markers[0].created_at).toLocaleDateString() : 'N/A'}</p>
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
