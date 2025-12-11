const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

router.get('/profile', requireAuth, (req, res) => {
  User.findById(req.session.user.id, (err, user) => {
    if (err || !user) {
      req.session.error_msg = 'Error al cargar el perfil';
      return res.redirect('/');
    }

    const db = require('../config/database');
    
    db.all(`
      SELECT a.*, c.name as category_name
      FROM articles a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.author_id = ?
      ORDER BY a.created_at DESC
    `, [req.session.user.id], (err, articles) => {
      if (err) articles = [];

      res.render('profile/view', {
        title: 'Mi Perfil',
        user,
        articles
      });
    });
  });
});



module.exports = router;