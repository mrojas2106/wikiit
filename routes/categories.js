const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { requireAuth, checkRole } = require('../middleware/auth');

router.get('/', (req, res) => {
  Category.getAll((err, categories) => {
    if (err) {
      req.session.error_msg = 'Error al cargar las categorías';
      categories = [];
    }

    res.render('categories/list', {
      title: 'Categorías',
      categories
    });
  });
});

router.post('/create', requireAuth, checkRole(['admin']), (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    req.session.error_msg = 'El nombre de la categoría es obligatorio';
    return res.redirect('/admin/categories');
  }

  Category.create(name.trim(), (err) => {
    if (err) {
      req.session.error_msg = 'Error al crear la categoría';
    } else {
      req.session.success_msg = 'Categoría creada exitosamente';
    }
    res.redirect('/admin/categories');
  });
});

router.delete('/delete/:id', requireAuth, checkRole(['admin']), (req, res) => {
  const categoryId = req.params.id;

  const db = require('../config/database');
  
  db.get('SELECT COUNT(*) as count FROM articles WHERE category_id = ?', [categoryId], (err, result) => {
    if (err) {
      req.session.error_msg = 'Error al verificar la categoría';
      return res.redirect('/admin/categories');
    }

    if (result.count > 0) {
      req.session.error_msg = 'No se puede eliminar una categoría que tiene artículos';
      return res.redirect('/admin/categories');
    }

    Category.delete(categoryId, (err) => {
      if (err) {
        req.session.error_msg = 'Error al eliminar la categoría';
      } else {
        req.session.success_msg = 'Categoría eliminada exitosamente';
      }
      res.redirect('/admin/categories');
    });
  });
});

module.exports = router;