const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { requireAuth, checkRole } = require('../middleware/auth');

router.get('/', (req, res) => {
  Article.getAllPublished((err, articles) => {
    if (err) {
      req.session.error_msg = 'Error al cargar los artículos';
      articles = [];
    }
    
    Category.getAll((err, categories) => {
      res.render('articles/list', {
        title: 'Todos los Artículos',
        articles,
        categories
      });
    });
  });
});

router.get('/search', (req, res) => {
  const query = req.query.q;
  
  if (!query || query.trim() === '') {
    return res.redirect('/articles');
  }

  Article.search(query, (err, articles) => {
    if (err) {
      req.session.error_msg = 'Error en la búsqueda';
      articles = [];
    }
    
    Category.getAll((err, categories) => {
      res.render('articles/list', {
        title: `Resultados para: "${query}"`,
        articles,
        categories,
        searchQuery: query
      });
    });
  });
});

router.get('/category/:id', (req, res) => {
  const categoryId = req.params.id;
  
  Category.findById(categoryId, (err, category) => {
    if (err || !category) {
      req.session.error_msg = 'Categoría no encontrada';
      return res.redirect('/articles');
    }

    Article.getByCategory(categoryId, (err, articles) => {
      if (err) {
        req.session.error_msg = 'Error al cargar los artículos';
        articles = [];
      }
      
      Category.getAll((err, categories) => {
        res.render('articles/list', {
          title: `Categoría: ${category.name}`,
          articles,
          categories,
          currentCategory: categoryId
        });
      });
    });
  });
});

router.get('/create', requireAuth, checkRole(['editor', 'admin']), (req, res) => {
  Category.getAll((err, categories) => {
    res.render('articles/create', {
      title: 'Crear Artículo',
      categories
    });
  });
});

router.post('/create', requireAuth, checkRole(['editor', 'admin']), (req, res) => {
  const { title, content, category_id, tags } = req.body;
  
  if (!title || !content || !category_id) {
    req.session.error_msg = 'Todos los campos son obligatorios';
    return res.redirect('/articles/create');
  }

  const articleData = {
    title,
    content,
    category_id,
    author_id: req.session.user.id,
    tags: tags || ''
  };

  Article.create(articleData, (err, articleId) => {
    if (err) {
      req.session.error_msg = 'Error al crear el artículo';
      return res.redirect('/articles/create');
    }

    req.session.success_msg = '¡Artículo creado exitosamente!';
    res.redirect(`/articles/view/${articleId}`);
  });
});

router.get('/view/:id', (req, res) => {
  const articleId = req.params.id;

  Article.findById(articleId, (err, article) => {
    if (err || !article) {
      req.session.error_msg = 'Artículo no encontrado';
      return res.redirect('/articles');
    }

    Comment.getByArticle(articleId, (err, comments) => {
      if (err) {
        comments = [];
      }

      res.render('articles/view', {
        title: article.title,
        article,
        comments
      });
    });
  });
});

router.post('/:id/comment', requireAuth, (req, res) => {
  const articleId = req.params.id;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    req.session.error_msg = 'El comentario no puede estar vacío';
    return res.redirect(`/articles/view/${articleId}`);
  }

  const commentData = {
    content: content.trim(),
    article_id: articleId,
    user_id: req.session.user.id
  };

  Comment.create(commentData, (err) => {
    if (err) {
      req.session.error_msg = 'Error al publicar el comentario';
    } else {
      req.session.success_msg = 'Comentario publicado exitosamente';
    }
    res.redirect(`/articles/view/${articleId}`);
  });
});

router.get('/edit/:id', requireAuth, (req, res) => {
  const articleId = req.params.id;

  Article.findById(articleId, (err, article) => {
    if (err || !article) {
      req.session.error_msg = 'Artículo no encontrado';
      return res.redirect('/articles');
    }

    if (article.author_id !== req.session.user.id && req.session.user.role !== 'admin') {
      req.session.error_msg = 'No tienes permiso para editar este artículo';
      return res.redirect(`/articles/view/${articleId}`);
    }

    Category.getAll((err, categories) => {
      res.render('articles/edit', {
        title: 'Editar Artículo',
        article,
        categories
      });
    });
  });
});

router.put('/edit/:id', requireAuth, (req, res) => {
  const articleId = req.params.id;
  const { title, content, category_id, tags } = req.body;

  Article.findById(articleId, (err, article) => {
    if (err || !article) {
      req.session.error_msg = 'Artículo no encontrado';
      return res.redirect('/articles');
    }

    if (article.author_id !== req.session.user.id && req.session.user.role !== 'admin') {
      req.session.error_msg = 'No tienes permiso para editar este artículo';
      return res.redirect(`/articles/view/${articleId}`);
    }

    const articleData = { title, content, category_id, tags };

    Article.update(articleId, articleData, (err) => {
      if (err) {
        req.session.error_msg = 'Error al actualizar el artículo';
        return res.redirect(`/articles/edit/${articleId}`);
      }

      req.session.success_msg = '¡Artículo actualizado exitosamente!';
      res.redirect(`/articles/view/${articleId}`);
    });
  });
});

router.delete('/delete/:id', requireAuth, (req, res) => {
  const articleId = req.params.id;

  Article.findById(articleId, (err, article) => {
    if (err || !article) {
      req.session.error_msg = 'Artículo no encontrado';
      return res.redirect('/articles');
    }

    if (article.author_id !== req.session.user.id && req.session.user.role !== 'admin') {
      req.session.error_msg = 'No tienes permiso para eliminar este artículo';
      return res.redirect(`/articles/view/${articleId}`);
    }

    Article.delete(articleId, (err) => {
      if (err) {
        req.session.error_msg = 'Error al eliminar el artículo';
      } else {
        req.session.success_msg = 'Artículo eliminado exitosamente';
      }
      res.redirect('/articles');
    });
  });
});

module.exports = router;