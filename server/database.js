const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite Database:', err.message);
  } else {
    console.log('Connected to SQLite Database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Admin Table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);

    // 2. Events Table
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      short_desc TEXT,
      details TEXT,
      tag TEXT NOT NULL,
      day TEXT NOT NULL,
      month TEXT NOT NULL,
      image TEXT NOT NULL,
      is_past BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Gallery Table
    db.run(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      image TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed default admin if none exists
    db.get("SELECT * FROM admins WHERE email = 'admin@oxford.com'", (err, row) => {
      if (!row) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('12345', salt);
        db.run("INSERT INTO admins (email, password) VALUES (?, ?)", ['admin@oxford.com', hash], (insertErr) => {
          if (!insertErr) console.log('✓ Default admin (admin@oxford.com) seeded.');
        });
      }
    });

    // Seed default Events if none exists
    db.get("SELECT COUNT(*) as count FROM events", (err, row) => {
      if (row && row.count === 0) {
        const seedEvents = [
          ['Academic Excellence Award', 'Annual academic ceremony', 'The annual academic excellence award ceremony to distribute medals.', 'academic', '25', 'NOV', '/assets/images/image5.jpg', 0],
          ['Sports Week 2026', 'Inter-house competitions', 'A week full of sports competitions among different houses.', 'sports', '18', 'DEC', '/assets/images/3.jpg', 0],
          ['Scouts Camp', 'Annual scouts training', 'Three days scouts training at the hills.', 'scouts', '22', 'DEC', '/assets/images/image13.jpg', 0],
          ['Dashain Celebration', 'Cultural festival', 'Dashain celebration with music and games.', 'celebration', '10', 'NOV', '/assets/images/events.jpg', 1],
          ['Inter-school Football', 'Regional match', 'Football match against neighboring district schools.', 'sports', '25', 'OCT', '/assets/images/slider_bg_1.jpg', 1]
        ];
        seedEvents.forEach(evt => {
          db.run(`INSERT INTO events (title, short_desc, details, tag, day, month, image, is_past) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, evt);
        });
        console.log('✓ Default events seeded.');
      }
    });

    // Seed default Gallery if none exists
    db.get("SELECT COUNT(*) as count FROM gallery", (err, row) => {
      if (row && row.count === 0) {
        const seedGallery = [
          ['/assets/images/image1.jpg'], ['/assets/images/image2.jpg'], ['/assets/images/image3.jpg'],
          ['/assets/images/image4.jpg'], ['/assets/images/image5.jpg'], ['/assets/images/image6.jpg'],
          ['/assets/images/image7.jpg'], ['/assets/images/image8.jpg'], ['/assets/images/image9.jpg'],
          ['/assets/images/image11.jpg'], ['/assets/images/image12.jpg'], ['/assets/images/image13.jpg'],
          ['/assets/images/image14.jpg'], ['/assets/images/unpic1.jpeg'], ['/assets/images/unpic2.jpeg'],
          ['/assets/images/unpic3.jpeg'], ['/assets/images/unpic4.jpeg'], ['/assets/images/unpic5.jpeg'],
          ['/assets/images/unpic6.jpeg'], ['/assets/images/unpic7.jpeg'], ['/assets/images/unpic8.jpeg']
        ];
        seedGallery.forEach(img => {
          db.run(`INSERT INTO gallery (title, image) VALUES (?, ?)`, ['School Image', img[0]]);
        });
        console.log('✓ Default gallery items seeded.');
      }
    });
  });
}

module.exports = db;
