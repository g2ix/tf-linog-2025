const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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
  database: process.env.DB_NAME || 'earthquake_cebu',
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

// Serve static files from React build
app.use(express.static('../client/build'));

// API Routes

// Get all markers
app.get('/api/markers', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, latitude, longitude, description, image_url, created_at FROM markers ORDER BY created_at DESC'
    );
    res.json(rows);
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
    const { latitude, longitude, description, image_url } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(400).json({ error: 'Latitude, longitude, and description required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO markers (latitude, longitude, description, image_url) VALUES (?, ?, ?, ?)',
      [latitude, longitude, description, image_url || null]
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
    const { latitude, longitude, description, image_url } = req.body;

    if (!latitude || !longitude || !description) {
      return res.status(400).json({ error: 'Latitude, longitude, and description required' });
    }

    const [result] = await pool.execute(
      'UPDATE markers SET latitude = ?, longitude = ?, description = ?, image_url = ? WHERE id = ?',
      [latitude, longitude, description, image_url || null, id]
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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
