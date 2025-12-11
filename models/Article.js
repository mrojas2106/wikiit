const db = require('../config/database');

class Article {
  static create(articleData, callback) {
    const { title, content, category_id, author_id, tags = '' } = articleData;
    const sql = `INSERT INTO articles (title, content, category_id, author_id, tags, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
    
    db.run(sql, [title, content, category_id, author_id, tags], function(err) {
      callback(err, this.lastID);
    });
  }

  static getAllPublished(callback) {
    const sql = `
      SELECT a.*, u.username, c.name as category_name,
             (SELECT COUNT(*) FROM comments WHERE article_id = a.id) as comment_count
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
    `;
    db.all(sql, callback);
  }

  static findById(id, callback) {
    const sql = `
      SELECT a.*, u.username, u.avatar, c.name as category_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.id = ?
    `;
    db.get(sql, [id], callback);
  }

  static update(id, articleData, callback) {
    const { title, content, category_id, tags } = articleData;
    const sql = `UPDATE articles SET title = ?, content = ?, category_id = ?, tags = ?, updated_at = datetime('now') 
                 WHERE id = ?`;
    
    db.run(sql, [title, content, category_id, tags, id], callback);
  }

  static delete(id, callback) {
    db.run('DELETE FROM articles WHERE id = ?', [id], callback);
  }

  static getByCategory(categoryId, callback) {
    const sql = `
      SELECT a.*, u.username, c.name as category_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.category_id = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
    `;
    db.all(sql, [categoryId], callback);
  }

  static search(query, callback) {
    const sql = `
      SELECT a.*, u.username, c.name as category_name
      FROM articles a 
      LEFT JOIN users u ON a.author_id = u.id 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.status = 'published' AND (a.title LIKE ? OR a.content LIKE ? OR a.tags LIKE ?)
      ORDER BY a.created_at DESC
    `;
    const searchTerm = `%${query}%`;
    db.all(sql, [searchTerm, searchTerm, searchTerm], callback);
  }
}

module.exports = Article;