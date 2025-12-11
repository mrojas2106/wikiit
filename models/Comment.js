const db = require('../config/database');

class Comment {
  static create(commentData, callback) {
    const { content, article_id, user_id } = commentData;
    const sql = `INSERT INTO comments (content, article_id, user_id, created_at) 
                 VALUES (?, ?, ?, datetime('now'))`;
    
    db.run(sql, [content, article_id, user_id], function(err) {
      callback(err, this.lastID);
    });
  }

  static getByArticle(articleId, callback) {
    const sql = `
      SELECT c.*, u.username, u.avatar 
      FROM comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.article_id = ? 
      ORDER BY c.created_at ASC
    `;
    db.all(sql, [articleId], callback);
  }

  static delete(id, callback) {
    db.run('DELETE FROM comments WHERE id = ?', [id], callback);
  }
}

module.exports = Comment;