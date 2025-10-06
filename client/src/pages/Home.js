import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaNewspaper, FaImages, FaHeart, FaPhone, FaEnvelope } from 'react-icons/fa';
import { apiService } from '../services/api';
import './Home.css';

const Home = () => {
  const [updates, setUpdates] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [updatesRes, donationsRes] = await Promise.all([
        apiService.getUpdates(),
        apiService.getDonations()
      ]);
      
      setUpdates(updatesRes.data.slice(0, 3)); // Show latest 3 updates
      setDonations(donationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading latest information...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Earthquake Updates for Cebu, Philippines</h1>
            <p className="hero-subtitle">
              Stay informed with real-time updates, visual documentation, and emergency information 
              about the earthquake situation in Cebu.
            </p>
            <div className="hero-actions">
              <Link to="/map" className="btn btn-primary">
                <FaMapMarkerAlt /> View Map
              </Link>
              <Link to="/updates" className="btn btn-secondary">
                <FaNewspaper /> Latest Updates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="quick-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <FaMapMarkerAlt className="stat-icon" />
              <h3>Affected Areas</h3>
              <p>Multiple locations across Cebu</p>
            </div>
            <div className="stat-card">
              <FaNewspaper className="stat-icon" />
              <h3>Real-time Updates</h3>
              <p>Latest news and developments</p>
            </div>
            <div className="stat-card">
              <FaImages className="stat-icon" />
              <h3>Visual Documentation</h3>
              <p>Photos and images from the field</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="latest-updates">
        <div className="container">
          <h2>Latest Updates</h2>
          <div className="updates-grid">
            {updates.map((update) => (
              <div key={update.id} className="update-card">
                <h3>{update.title}</h3>
                <p>{update.content}</p>
                <span className="update-date">
                  {new Date(update.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <div className="section-actions">
            <Link to="/updates" className="btn btn-outline">
              View All Updates
            </Link>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      {donations.length > 0 && (
        <section className="donation-section">
          <div className="container">
            <h2>How You Can Help</h2>
            <div className="donation-grid">
              {donations.map((donation) => (
                <div key={donation.id} className="donation-card">
                  <h3>{donation.title}</h3>
                  <p>{donation.description}</p>
                  {donation.image_url && (
                    <div className="donation-image">
                      <img src={donation.image_url} alt={donation.title} />
                    </div>
                  )}
                  {donation.contact_info && (
                    <div className="contact-info">
                      <p><FaPhone /> {donation.contact_info}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Emergency Contacts */}
      <section className="emergency-contacts">
        <div className="container">
          <h2>Emergency Contacts</h2>
          <div className="contacts-grid">
            <div className="contact-card">
              <FaPhone className="contact-icon" />
              <h3>Emergency Hotline</h3>
              <p>911</p>
            </div>
            <div className="contact-card">
              <FaEnvelope className="contact-icon" />
              <h3>Local Government</h3>
              <p>cebu.gov.ph</p>
            </div>
            <div className="contact-card">
              <FaHeart className="contact-icon" />
              <h3>Red Cross</h3>
              <p>143</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
