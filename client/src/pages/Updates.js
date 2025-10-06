import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaCalendarAlt, FaClock, FaSearch } from 'react-icons/fa';
import { apiService } from '../services/api';
import './Updates.css';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    filterUpdates();
  }, [updates, searchTerm]);

  const fetchUpdates = async () => {
    try {
      const response = await apiService.getUpdates();
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
      setError('Failed to load updates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterUpdates = () => {
    if (!searchTerm) {
      setFilteredUpdates(updates);
      return;
    }

    const filtered = updates.filter(update =>
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUpdates(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">
          <h3>Error Loading Updates</h3>
          <p>{error}</p>
          <button onClick={fetchUpdates} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="updates">
      <div className="container">
        <div className="updates-header">
          <h1>Latest Updates</h1>
          <p>Stay informed with the latest news and developments about the earthquake situation in Cebu</p>
        </div>

        <div className="updates-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search updates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredUpdates.length === 0 ? (
          <div className="no-results">
            <FaNewspaper className="no-results-icon" />
            <h3>No updates found</h3>
            <p>{searchTerm ? 'No updates match your search criteria.' : 'No updates available at the moment.'}</p>
          </div>
        ) : (
          <div className="updates-list">
            {filteredUpdates.map((update) => {
              const { date, time } = formatDate(update.created_at);
              return (
                <article key={update.id} className="update-card">
                  <div className="update-header">
                    <h2>{update.title}</h2>
                    <div className="update-meta">
                      <span className="update-date">
                        <FaCalendarAlt /> {date}
                      </span>
                      <span className="update-time">
                        <FaClock /> {time}
                      </span>
                    </div>
                  </div>
                  <div className="update-content">
                    <p>{update.content}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="updates-footer">
          <p>Last updated: {updates.length > 0 ? formatDate(updates[0].created_at).date : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default Updates;
