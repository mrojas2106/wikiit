const db = require('../config/database');

class Message {
  static create(messageData, callback) {
    const { subject, content, sender_id, receiver_id } = messageData;
    const sql = `INSERT INTO messages (subject, content, sender_id, receiver_id, created_at) 
                 VALUES (?, ?, ?, ?, datetime('now'))`;
    
    db.run(sql, [subject, content, sender_id, receiver_id], function(err) {
      callback(err, this.lastID);
    });
  }

  static getByUser(userId, callback) {
    const sql = `
      SELECT m.*, u1.username as sender_name, u2.username as receiver_name
      FROM messages m 
      LEFT JOIN users u1 ON m.sender_id = u1.id 
      LEFT JOIN users u2 ON m.receiver_id = u2.id 
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
    `;
    db.all(sql, [userId, userId], callback);
  }

  static markAsRead(messageId, callback) {
    db.run('UPDATE messages SET is_read = 1 WHERE id = ?', [messageId], callback);
  }
}

module.exports = Message;