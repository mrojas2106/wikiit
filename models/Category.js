const db = require('../config/database');

class Category {
  static getAll(callback) {
    db.all('SELECT * FROM categories ORDER BY name', callback);
  }

  static create(name, callback) {
    db.run('INSERT INTO categories (name, created_at) VALUES (?, datetime("now"))', [name], function(err) {
      callback(err, this.lastID);
    });
  }

  static findById(id, callback) {
    db.get('SELECT * FROM categories WHERE id = ?', [id], callback);
  }

  static delete(id, callback) {
    db.run('DELETE FROM categories WHERE id = ?', [id], callback);
  }
}

module.exports = Category;