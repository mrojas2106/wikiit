const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const { requireAuth, checkRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(checkRole(['admin']));

router.get('/dashboard', (req, res) => {
  const db = require('../config/database');
  
  const stats = {};
  
  db.get('SELECT COUNT(*) as total FROM users', (err, result) => {
    stats.totalUsers = result.total;
    
    db.get('SELECT COUNT(*) as total FROM articles', (err, result) => {
      stats.totalArticles = result.total;
      
      db.get('SELECT COUNT(*) as total FROM categories', (err, result) => {
        stats.totalCategories = result.total;
        
        db.get('SELECT COUNT(*) as total FROM comments', (err, result) => {
          stats.totalComments = result.total;

          User.getAll((err, users) => {
            Article.getAllPublished((err, articles) => {
              Category.getAll((err, categories) => {
                res.render('admin/dashboard', {
                  title: 'Panel de Administración',
                  stats,
                  users,
                  articles,
                  categories
                });
              });
            });
          });
        });
      });
    });
  });
});

router.get('/users', (req, res) => {
  User.getAll((err, users) => {
    if (err) {
      req.session.error_msg = 'Error al cargar los usuarios';
      users = [];
    }

    res.render('admin/users', {
      title: 'Gestión de Usuarios',
      users
    });
  });
});

router.post('/users/:id/role', (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  User.updateRole(userId, role, (err) => {
    if (err) {
      req.session.error_msg = 'Error al actualizar el rol';
    } else {
      req.session.success_msg = 'Rol actualizado exitosamente';
    }
    res.redirect('/admin/users');
  });
});

router.get('/categories', (req, res) => {
  Category.getAll((err, categories) => {
    if (err) {
      req.session.error_msg = 'Error al cargar las categorías';
      categories = [];
    }

    res.render('admin/categories', {
      title: 'Gestión de Categorías',
      categories
    });
  });
});

// routes/admin.js - Agregar después de la ruta POST de roles

router.get('/users/create', (req, res) => {
  res.render('admin/create-user', {
    title: 'Crear Nuevo Usuario'
  });
});

router.post('/users/create', (req, res) => {
  const { username, email, password, confirm_password, role } = req.body;

  // Validaciones
  if (password !== confirm_password) {
    req.session.error_msg = 'Las contraseñas no coinciden';
    return res.redirect('/admin/users/create');
  }

  if (password.length < 6) {
    req.session.error_msg = 'La contraseña debe tener al menos 6 caracteres';
    return res.redirect('/admin/users/create');
  }

  const User = require('../models/User');
  
  User.findByEmail(email, (err, existingUser) => {
    if (err) {
      req.session.error_msg = 'Error del servidor';
      return res.redirect('/admin/users/create');
    }

    if (existingUser) {
      req.session.error_msg = 'El email ya está registrado';
      return res.redirect('/admin/users/create');
    }

    User.create({ username, email, password, role: role || 'user' }, (err, userId) => {
      if (err) {
        req.session.error_msg = 'Error al crear el usuario';
        return res.redirect('/admin/users/create');
      }

      req.session.success_msg = `¡Usuario ${username} creado exitosamente!`;
      res.redirect('/admin/users');
    });
  });
});

module.exports = router;