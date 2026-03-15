const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'oxford_secret_12345';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure uploads directory exists
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// JWT Verification Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------------------------- //
// --- PUBLIC ROUTES (No Auth Required) ---
// -------------------------------------------------------------------------------- //

// Get all events
app.get('/api/events', (req, res) => {
  db.all("SELECT * FROM events ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Transform flat table into expected React shape: { key, title, short_desc, details, tag, day, month, image, is_past }
    const formattedEvents = rows.map(r => ({
      id: r.id,
      key: `event_api_${r.id}`,
      title: r.title,
      short_desc: r.short_desc,
      details: r.details,
      tag: r.tag,
      day: r.day,
      month: r.month,
      image: r.image.startsWith('http') || r.image.startsWith('/') ? r.image : `http://localhost:${PORT}/uploads/${r.image}`,
      is_past: Boolean(r.is_past)
    }));
    
    res.json({
      upcomingEvents: formattedEvents.filter(e => !e.is_past),
      pastEvents: formattedEvents.filter(e => e.is_past)
    });
  });
});

// Get all gallery items
app.get('/api/gallery', (req, res) => {
  db.all("SELECT * FROM gallery ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formattedGallery = rows.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image.startsWith('http') || r.image.startsWith('/') ? r.image : `http://localhost:${PORT}/uploads/${r.image}`,
    }));
    res.json(formattedGallery);
  });
});


// -------------------------------------------------------------------------------- //
// --- AUTHENTICATION ROUTES ---
// -------------------------------------------------------------------------------- //

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.get("SELECT * FROM admins WHERE email = ?", [email], (err, admin) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordIsValid = bcrypt.compareSync(password, admin.password);
    if (!passwordIsValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  });
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.user.id;

  db.get("SELECT * FROM admins WHERE id = ?", [adminId], (err, admin) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!bcrypt.compareSync(currentPassword, admin.password)) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.run("UPDATE admins SET password = ? WHERE id = ?", [newHash, adminId], function(updateErr) {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ message: 'Password updated successfully' });
    });
  });
});


// -------------------------------------------------------------------------------- //
// --- PROTECTED ADMIN ROUTES ---
// -------------------------------------------------------------------------------- //

// Add Event
app.post('/api/events', authenticateToken, upload.single('image'), (req, res) => {
  const { title, short_desc, details, tag, day, month, is_past } = req.body;
  const image = req.file ? req.file.filename : req.body.image; // fallback to body if passing URL
  
  const query = `INSERT INTO events (title, short_desc, details, tag, day, month, image, is_past) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [title, short_desc, details, tag, day, month, image, is_past === 'true' || is_past === true ? 1 : 0];

  db.run(query, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Event added successfully' });
  });
});

// Edit Event
app.put('/api/events/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { title, short_desc, details, tag, day, month, is_past } = req.body;
  const id = req.params.id;
  
  let query = `UPDATE events SET title=?, short_desc=?, details=?, tag=?, day=?, month=?, is_past=?`;
  let values = [title, short_desc, details, tag, day, month, is_past === 'true' || is_past === true ? 1 : 0];

  if (req.file) {
    query += `, image=?`;
    values.push(req.file.filename);
  }
  
  query += ` WHERE id=?`;
  values.push(id);

  db.run(query, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event updated successfully' });
  });
});

// Delete Event
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM events WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Event deleted successfully' });
  });
});


// Add Gallery Images
app.post('/api/gallery', authenticateToken, upload.array('images', 20), (req, res) => {
  const { title } = req.body;
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Image files are required' });

  let completedImages = 0;
  let errors = [];
  const insertedIds = [];

  req.files.forEach(file => {
    const query = `INSERT INTO gallery (title, image) VALUES (?, ?)`;
    db.run(query, [title || '', file.filename], function(err) {
      if (err) {
         errors.push(err.message);
      } else {
         insertedIds.push(this.lastID);
      }
      completedImages++;
      if (completedImages === req.files.length) {
         if (errors.length > 0) return res.status(500).json({ error: 'Failed to upload some images', details: errors });
         res.json({ message: `${req.files.length} image(s) uploaded to gallery successfully`, ids: insertedIds });
      }
    });
  });
});

// Bulk Delete Gallery Images
app.post('/api/gallery/bulk-delete', authenticateToken, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Array of ids is required' });
  }

  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM gallery WHERE id IN (${placeholders})`, ids, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Images deleted from gallery successfully' });
  });
});

// Delete Gallery Image
app.delete('/api/gallery/:id', authenticateToken, (req, res) => {
  // Optional: Also delete physically from uploads folder. Skipping for simplicity.
  db.run("DELETE FROM gallery WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Image deleted from gallery successfully' });
  });
});


app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
