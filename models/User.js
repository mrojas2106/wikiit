const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
static create(userData, callback) {
  const { username, email, password, role = 'user' } = userData;
  
  const bcrypt = require('bcryptjs');
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);
    
    const sql = `INSERT INTO users (username, email, password, role, created_at) 
                 VALUES (?, ?, ?, ?, datetime('now'))`;
    
    const db = require('../config/database');
    db.run(sql, [username, email, hashedPassword, role], function(err) {
      callback(err, this.lastID);
    });
  });
}

  static findByEmail(email, callback) {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  }

  static findById(id, callback) {
    db.get('SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?', [id], callback);
  }

  static comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, callback);
  }

  static getAll(callback) {
    db.all('SELECT id, username, email, role, avatar, created_at FROM users ORDER BY created_at DESC', callback);
  }

  static updateRole(userId, role, callback) {
    db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], callback);
  }
}



module.exports = User;