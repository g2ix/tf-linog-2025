import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaImages, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { apiService } from '../services/api';
import './Gallery.css';

const Gallery = () => {
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const filterMarkers = useCallback(() => {
    if (!searchTerm) {
      setFilteredMarkers(markers);
      return;
    }

    const filtered = markers.filter(marker =>
      marker.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMarkers(filtered);
  }, [markers, searchTerm]);

  useEffect(() => {
    fetchMarkers();
  }, []);

  useEffect(() => {
    filterMarkers();
  }, [filterMarkers]);

  const openMarkerModal = (marker) => {
    setSelectedMarker(marker);
    setCurrentImageIndex(0);
  };

  const closeMarkerModal = () => {
    setSelectedMarker(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedMarker && selectedMarker.images) {
      setCurrentImageIndex((prev) => 
        prev < selectedMarker.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (selectedMarker && selectedMarker.images) {
      setCurrentImageIndex((prev) => 
        prev > 0 ? prev - 1 : selectedMarker.images.length - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
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
          <p>Visual documentation of affected areas in Cebu - organized by location markers</p>
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
            <p>No markers found matching your search.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredMarkers.map((marker) => {
              // Use images from JSON if available, otherwise fall back to image_url
              const images = marker.images && marker.images.length > 0 ? marker.images : 
                             (marker.image_url ? [{ url: marker.image_url, caption: marker.description }] : []);
              
              return (
                <div key={marker.id} className="gallery-item marker-item">
                  <div className="marker-preview" onClick={() => openMarkerModal(marker)}>
                    {images.length > 0 ? (
                      <div className="preview-images">
                        {images.slice(0, 4).map((image, index) => (
                          <div key={index} className="preview-image">
                            <img
                              src={image.url}
                              alt={image.caption || marker.description}
                              className={index === 3 && images.length > 4 ? 'last-image' : ''}
                            />
                            {index === 3 && images.length > 4 && (
                              <div className="more-images">
                                +{images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-images">
                        <FaImages className="no-images-icon" />
                        <p>No images available</p>
                      </div>
                    )}
                    
                    <div className="marker-overlay">
                      <FaEye className="overlay-icon" />
                      <span>View {images.length} image{images.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="marker-info">
                    <h3>{marker.description}</h3>
                    <div className="marker-meta">
                      <span className="location">
                        <FaMapMarkerAlt /> {parseFloat(marker.latitude).toFixed(4)}, {parseFloat(marker.longitude).toFixed(4)}
                      </span>
                      <span className="date">
                        <FaCalendarAlt /> {new Date(marker.created_at).toLocaleDateString()}
                      </span>
                      <span className="image-count">
                        <FaImages /> {images.length} image{images.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Marker Modal */}
        {selectedMarker && (
          <div className="marker-modal" onClick={closeMarkerModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeMarkerModal}>
                <FaTimes />
              </button>
              
              <div className="modal-header">
                <h2>{selectedMarker.description}</h2>
                <div className="modal-meta">
                  <span className="location">
                    <FaMapMarkerAlt /> {parseFloat(selectedMarker.latitude).toFixed(4)}, {parseFloat(selectedMarker.longitude).toFixed(4)}
                  </span>
                  <span className="date">
                    <FaCalendarAlt /> {new Date(selectedMarker.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedMarker.images && selectedMarker.images.length > 0 ? (
                <>
                  <div className="image-viewer">
                    <button className="nav-btn prev-btn" onClick={prevImage}>
                      <FaChevronLeft />
                    </button>
                    
                    <div className="main-image-container">
                      <img
                        src={selectedMarker.images[currentImageIndex]?.url}
                        alt={selectedMarker.images[currentImageIndex]?.caption || selectedMarker.description}
                      />
                      {selectedMarker.images[currentImageIndex]?.caption && (
                        <div className="image-caption">
                          {selectedMarker.images[currentImageIndex].caption}
                        </div>
                      )}
                    </div>
                    
                    <button className="nav-btn next-btn" onClick={nextImage}>
                      <FaChevronRight />
                    </button>
                  </div>

                  <div className="image-thumbnails">
                    {selectedMarker.images.map((image, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => goToImage(index)}
                      >
                        <img src={image.url} alt={image.caption || `Image ${index + 1}`} />
                      </div>
                    ))}
                  </div>

                  <div className="image-counter">
                    {currentImageIndex + 1} of {selectedMarker.images.length}
                  </div>
                </>
              ) : (
                <div className="no-images-modal">
                  <FaImages className="no-images-icon" />
                  <p>No images available for this marker</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;