const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tf_linog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Serve static files from React build (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API Routes

// Get all markers
app.get('/api/markers', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, latitude, longitude, description, image_url, images, created_at FROM markers ORDER BY created_at DESC'
    );
    
    // Parse JSON images for each marker
    const markers = rows.map(marker => ({
      ...marker,
      images: marker.images ? JSON.parse(marker.images) : []
    }));
    
    res.json(markers);
  } catch (error) {
    console.error('Error fetching markers:', error);
    res.status(500).json({ error: 'Failed to fetch markers' });
  }
});

// Get all updates
app.get('/api/updates', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, content, created_at FROM updates ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Get all donations
app.get('/api/donations', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, description, contact_info, image_url FROM donations WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get all image groups with their images
app.get('/api/image-groups', async (req, res) => {
  try {
    const [groups] = await pool.execute(
      `SELECT ig.id, ig.title, ig.description, ig.location_name, ig.latitude, ig.longitude, ig.created_at,
       COUNT(i.id) as image_count
       FROM image_groups ig
       LEFT JOIN images i ON ig.id = i.group_id
       GROUP BY ig.id
       ORDER BY ig.created_at DESC`
    );
    
    // Get images for each group
    for (let group of groups) {
      const [images] = await pool.execute(
        'SELECT id, image_url, caption, display_order FROM images WHERE group_id = ? ORDER BY display_order, created_at',
        [group.id]
      );
      group.images = images;
    }
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching image groups:', error);
    res.status(500).json({ error: 'Failed to fetch image groups' });
  }
});

// Get single image group with all images
app.get('/api/image-groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [groups] = await pool.execute(
      'SELECT * FROM image_groups WHERE id = ?',
      [id]
    );
    
    if (groups.length === 0) {
      return res.status(404).json({ error: 'Image group not found' });
    }
    
    const [images] = await pool.execute(
      'SELECT * FROM images WHERE group_id = ? ORDER BY display_order, created_at',
      [id]
    );
    
    const group = groups[0];
    group.images = images;
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching image group:', error);
    res.status(500).json({ error: 'Failed to fetch image group' });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, username, password_hash FROM admin WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Add new update (admin only)
app.post('/api/admin/update', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO updates (title, content) VALUES (?, ?)',
      [title, content]
    );

    res.json({ id: result.insertId, message: 'Update added successfully' });
  } catch (error) {
    console.error('Error adding update:', error);
    res.status(500).json({ error: 'Failed to add update' });
  }
});

// Add new marker (admin only)
app.post('/api/admin/marker', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, description, image_url, images } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(400).json({ error: 'Latitude, longitude, and description required' });
    }

    const imagesJson = images ? JSON.stringify(images) : null;

    const [result] = await pool.execute(
      'INSERT INTO markers (latitude, longitude, description, image_url, images) VALUES (?, ?, ?, ?, ?)',
      [latitude, longitude, description, image_url || null, imagesJson]
    );

    res.json({ id: result.insertId, message: 'Marker added successfully' });
  } catch (error) {
    console.error('Error adding marker:', error);
    res.status(500).json({ error: 'Failed to add marker' });
  }
});

// Edit update (admin only)
app.put('/api/admin/update/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const [result] = await pool.execute(
      'UPDATE updates SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json({ message: 'Update updated successfully' });
  } catch (error) {
    console.error('Error updating update:', error);
    res.status(500).json({ error: 'Failed to update update' });
  }
});

// Edit marker (admin only)
app.put('/api/admin/marker/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, description, image_url, images } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(400).json({ error: 'Latitude, longitude, and description required' });
    }

    const imagesJson = images ? JSON.stringify(images) : null;

    const [result] = await pool.execute(
      'UPDATE markers SET latitude = ?, longitude = ?, description = ?, image_url = ?, images = ? WHERE id = ?',
      [latitude, longitude, description, image_url || null, imagesJson, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    res.json({ message: 'Marker updated successfully' });
  } catch (error) {
    console.error('Error updating marker:', error);
    res.status(500).json({ error: 'Failed to update marker' });
  }
});

// Delete update (admin only)
app.delete('/api/admin/update/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM updates WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// Delete marker (admin only)
app.delete('/api/admin/marker/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM markers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    res.json({ message: 'Marker deleted successfully' });
  } catch (error) {
    console.error('Error deleting marker:', error);
    res.status(500).json({ error: 'Failed to delete marker' });
  }
});

// Add new image group (admin only)
app.post('/api/admin/image-group', authenticateToken, async (req, res) => {
  try {
    const { title, description, location_name, latitude, longitude } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO image_groups (title, description, location_name, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [title, description || null, location_name || null, latitude || null, longitude || null]
    );

    res.json({ id: result.insertId, message: 'Image group added successfully' });
  } catch (error) {
    console.error('Error adding image group:', error);
    res.status(500).json({ error: 'Failed to add image group' });
  }
});

// Add image to group (admin only)
app.post('/api/admin/image', authenticateToken, async (req, res) => {
  try {
    const { group_id, image_url, caption, display_order } = req.body;

    if (!group_id || !image_url) {
      return res.status(400).json({ error: 'Group ID and image URL are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO images (group_id, image_url, caption, display_order) VALUES (?, ?, ?, ?)',
      [group_id, image_url, caption || null, display_order || 0]
    );

    res.json({ id: result.insertId, message: 'Image added successfully' });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Edit image group (admin only)
app.put('/api/admin/image-group/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location_name, latitude, longitude } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const [result] = await pool.execute(
      'UPDATE image_groups SET title = ?, description = ?, location_name = ?, latitude = ?, longitude = ? WHERE id = ?',
      [title, description || null, location_name || null, latitude || null, longitude || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image group not found' });
    }

    res.json({ message: 'Image group updated successfully' });
  } catch (error) {
    console.error('Error updating image group:', error);
    res.status(500).json({ error: 'Failed to update image group' });
  }
});

// Delete image group (admin only)
app.delete('/api/admin/image-group/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM image_groups WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image group not found' });
    }

    res.json({ message: 'Image group deleted successfully' });
  } catch (error) {
    console.error('Error deleting image group:', error);
    res.status(500).json({ error: 'Failed to delete image group' });
  }
});

// Delete image (admin only)
app.delete('/api/admin/image/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM images WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Serve React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
