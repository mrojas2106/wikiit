const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'wiki_it.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Inicializando base de datos...');

// Crear tablas
db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        avatar VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de categorías
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de artículos
    db.run(`CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER,
        author_id INTEGER NOT NULL,
        tags VARCHAR(255),
        status VARCHAR(20) DEFAULT 'published',
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (author_id) REFERENCES users (id)
    )`);

    // Tabla de comentarios
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        article_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tabla de mensajes
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
    )`);

    // Insertar datos iniciales
    console.log('📝 Insertando datos iniciales...');

    // Insertar usuario administrador
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, 
        ['admin', 'admin@wikiit.com', hashedPassword, 'admin']);

    // Insertar categorías por defecto
    const defaultCategories = [
        'Desarrollo Web',
        'Base de Datos',
        'DevOps',
        'Seguridad',
        'Redes',
        'Cloud Computing',
        'Mobile Development',
        'Inteligencia Artificial'
    ];

    defaultCategories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [category]);
    });

    // Crear índices para mejor rendimiento
    db.run(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)`);

    console.log('✅ Base de datos inicializada correctamente!');
});

// Actualizar la vista de conteo de artículos por categoría
db.run(`CREATE VIEW IF NOT EXISTS category_article_count AS
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
    GROUP BY c.id`);

db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
    } else {
        console.log('📊 Base de datos lista para usar!');
        console.log('👤 Usuario administrador: admin@wikiit.com / admin123');
        console.log('🚀 Ejecuta: npm start para iniciar el servidor');
    }
});