const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3002;

// Configuración de Handlebars con helpers personalizados
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  helpers: {
    eq: function (a, b) { return a === b; },
    gt: function (a, b) { return a > b; },
    or: function (a, b) { return a || b; },
     hasRole: function (user, roles) {
      if (!user) return false;
      const allowed = roles.split(',').map(r => r.trim());
      return allowed.includes(user.role);
    },
    substr: function (str, start, len) { 
      if (str && str.length > len) {
        return str.substring(start, len) + '...';
      }
      return str;
    },
    formatDate: function (date) { 
      if (!date) return '';
      const moment = require('moment');
      return moment(date).format('DD/MM/YYYY HH:mm');
    },
    split: function (str, separator) {
      if (!str) return [];
      return str.split(separator);
    },
    stripTags: function (html) {
      if (!html) return '';
      
      // Eliminar etiquetas HTML pero preservar el texto
      let text = html.replace(/<[^>]*>/g, ' ');
      
      // Eliminar datos base64 de imágenes (son muy largos)
      text = text.replace(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/g, ' [imagen] ');
      
      // Limpiar espacios múltiples y trim
      text = text.replace(/\s+/g, ' ').trim();
      
      return text;
    },
    contains: function (str, substring) {
      if (!str) return false;
      return str.includes(substring);
    },
    getPreview: function (html, length) {
      if (!html) return '';
      
      // Primero eliminar imágenes base64 (son muy largas)
      let text = html.replace(/<img[^>]*>/g, ' [imagen] ');
      
      // Luego eliminar otras etiquetas HTML
      text = text.replace(/<[^>]*>/g, ' ');
      
      // Limpiar espacios
      text = text.replace(/\s+/g, ' ').trim();
      
      // Truncar si es necesario
      if (text.length > length) {
        return text.substring(0, length) + '...';
      }
      
      return text;
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ 
    extended: true,
    limit: '10mb'  // Límite más razonable
}));
app.use(bodyParser.json({
    limit: '10mb'
}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: 'wiki-it-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware para variables globales
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.session.success_msg;
  res.locals.error_msg = req.session.error_msg;
  req.session.success_msg = null;
  req.session.error_msg = null;
  next();
});

// Rutas
app.use('/auth', require('./routes/auth'));
app.use('/articles', require('./routes/articles'));
app.use('/users', require('./routes/users'));
app.use('/categories', require('./routes/categories'));
app.use('/admin', require('./routes/admin'));

// Ruta principal
app.get('/', (req, res) => {
  const db = require('./config/database');
  
db.all(`
    SELECT a.*, u.username, u.avatar, c.name AS category_name,
           (SELECT COUNT(*) FROM comments WHERE article_id = a.id) AS comment_count
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
    ORDER BY a.created_at DESC
    LIMIT 4
`, (err, articles) => {
    if (err) {
        console.error(err);
        articles = [];
    }

    db.all('SELECT * FROM articles ORDER BY created_at DESC', (err, articulos) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error obteniendo artículos");
        }

        db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error obteniendo categorías");
            }

            // Render final
            return res.render('home', {
                articles,      // Los 4 últimos publicados
                articulos,     // Todos los artículos ordenados
                categories,    // Categorías
                title: 'Inicio - Wiki IT'
            });
        });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});