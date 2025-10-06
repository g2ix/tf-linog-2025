import React, { useState, useEffect } from 'react';
import { FaSignInAlt, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaNewspaper, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import './Admin.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('updates');
  const [updates, setUpdates] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [updateForm, setUpdateForm] = useState({ title: '', content: '' });
  const [markerForm, setMarkerForm] = useState({ 
    latitude: '', 
    longitude: '', 
    description: '', 
    image_url: '' 
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'updates') {
        const response = await apiService.getUpdates();
        setUpdates(response.data);
      } else {
        const response = await apiService.getMarkers();
        setMarkers(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.login(loginForm);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ username: response.data.username }));
      setIsAuthenticated(true);
      setUser({ username: response.data.username });
      toast.success('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await apiService.editUpdate(editingItem.id, updateForm);
        toast.success('Update updated successfully');
      } else {
        await apiService.addUpdate(updateForm);
        toast.success('Update added successfully');
      }
      setUpdateForm({ title: '', content: '' });
      setEditingItem(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving update:', error);
      toast.error('Failed to save update');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMarker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await apiService.editMarker(editingItem.id, markerForm);
        toast.success('Marker updated successfully');
      } else {
        await apiService.addMarker(markerForm);
        toast.success('Marker added successfully');
      }
      setMarkerForm({ latitude: '', longitude: '', description: '', image_url: '' });
      setEditingItem(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving marker:', error);
      toast.error('Failed to save marker');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'updates') {
      setUpdateForm({ title: item.title, content: item.content });
    } else {
      setMarkerForm({
        latitude: item.latitude,
        longitude: item.longitude,
        description: item.description,
        image_url: item.image_url || ''
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      if (activeTab === 'updates') {
        await apiService.deleteUpdate(id);
        toast.success('Update deleted successfully');
      } else {
        await apiService.deleteMarker(id);
        toast.success('Marker deleted successfully');
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUpdateForm({ title: '', content: '' });
    setMarkerForm({ latitude: '', longitude: '', description: '', image_url: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="container">
          <div className="login-container">
            <div className="login-header">
              <h1>Admin Login</h1>
              <p>Access the admin panel to manage updates and markers</p>
            </div>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : <><FaSignInAlt /> Login</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <div className="admin-user">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-danger">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
            onClick={() => setActiveTab('updates')}
          >
            <FaNewspaper /> Updates
          </button>
          <button
            className={`tab ${activeTab === 'markers' ? 'active' : ''}`}
            onClick={() => setActiveTab('markers')}
          >
            <FaMapMarkerAlt /> Markers
          </button>
        </div>

        <div className="admin-content">
          <div className="content-header">
            <h2>{activeTab === 'updates' ? 'Manage Updates' : 'Manage Markers'}</h2>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <FaPlus /> Add {activeTab === 'updates' ? 'Update' : 'Marker'}
            </button>
          </div>

          {showForm && (
            <div className="form-modal">
              <div className="form-container">
                <h3>{editingItem ? 'Edit' : 'Add'} {activeTab === 'updates' ? 'Update' : 'Marker'}</h3>
                <form onSubmit={activeTab === 'updates' ? handleSubmitUpdate : handleSubmitMarker}>
                  {activeTab === 'updates' ? (
                    <>
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={updateForm.title}
                          onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Content</label>
                        <textarea
                          value={updateForm.content}
                          onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={markerForm.latitude}
                          onChange={(e) => setMarkerForm({ ...markerForm, latitude: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={markerForm.longitude}
                          onChange={(e) => setMarkerForm({ ...markerForm, longitude: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={markerForm.description}
                          onChange={(e) => setMarkerForm({ ...markerForm, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Image URL (optional)</label>
                        <input
                          type="url"
                          value={markerForm.image_url}
                          onChange={(e) => setMarkerForm({ ...markerForm, image_url: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={resetForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="data-list">
              {(activeTab === 'updates' ? updates : markers).map((item) => (
                <div key={item.id} className="data-item">
                  <div className="item-content">
                    {activeTab === 'updates' ? (
                      <>
                        <h3>{item.title}</h3>
                        <p>{item.content}</p>
                        <span className="item-date">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <h3>{item.description}</h3>
                        <p>Coordinates: {item.latitude}, {item.longitude}</p>
                        {item.image_url && (
                          <p>Image: <a href={item.image_url} target="_blank" rel="noopener noreferrer">View</a></p>
                        )}
                        <span className="item-date">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)} className="btn btn-sm btn-primary">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
