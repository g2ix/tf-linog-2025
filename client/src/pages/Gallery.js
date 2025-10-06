import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { apiService } from '../services/api';
import './Gallery.css';

const Gallery = () => {
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkers();
  }, []);

  useEffect(() => {
    filterMarkers();
  }, [markers, searchTerm]);

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

  const filterMarkers = () => {
    if (!searchTerm) {
      setFilteredMarkers(markers);
      return;
    }

    const filtered = markers.filter(marker =>
      marker.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMarkers(filtered);
  };

  const openImageModal = (marker) => {
    setSelectedImage(marker);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="container">
        <div className="gallery-header">
          <h1>Image Gallery</h1>
          <p>Visual documentation of affected areas in Cebu</p>
        </div>

        <div className="gallery-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredMarkers.length === 0 ? (
          <div className="no-results">
            <p>No images found matching your search.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredMarkers.map((marker) => (
              <div key={marker.id} className="gallery-item">
                {marker.image_url ? (
                  <div className="image-container" onClick={() => openImageModal(marker)}>
                    <img
                      src={marker.image_url}
                      alt={marker.description}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <FaMapMarkerAlt className="overlay-icon" />
                    </div>
                  </div>
                ) : (
                  <div className="no-image">
                    <FaMapMarkerAlt className="no-image-icon" />
                    <p>No image available</p>
                  </div>
                )}
                
                <div className="image-info">
                  <h3>{marker.description}</h3>
                  <div className="image-meta">
                    <span className="location">
                      <FaMapMarkerAlt /> {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                    </span>
                    <span className="date">
                      <FaCalendarAlt /> {new Date(marker.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="image-modal" onClick={closeImageModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeImageModal}>
                <FaTimes />
              </button>
              <img src={selectedImage.image_url} alt={selectedImage.description} />
              <div className="modal-info">
                <h3>{selectedImage.description}</h3>
                <div className="modal-meta">
                  <span className="location">
                    <FaMapMarkerAlt /> {selectedImage.latitude.toFixed(4)}, {selectedImage.longitude.toFixed(4)}
                  </span>
                  <span className="date">
                    <FaCalendarAlt /> {new Date(selectedImage.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
