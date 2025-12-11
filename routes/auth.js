const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/login', { title: 'Iniciar Sesión' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, user) => {
    if (err) {
      req.session.error_msg = 'Error del servidor';
      return res.redirect('/auth/login');
    }

    if (!user) {
      req.session.error_msg = 'Usuario no encontrado';
      return res.redirect('/auth/login');
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        req.session.error_msg = 'Error del servidor';
        return res.redirect('/auth/login');
      }

      if (isMatch) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };
        req.session.success_msg = `¡Bienvenido de nuevo, ${user.username}!`;
        res.redirect('/');
      } else {
        req.session.error_msg = 'Contraseña incorrecta';
        res.redirect('/auth/login');
      }
    });
  });
});

router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/register', { title: 'Registrarse' });
});

router.post('/register', (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    req.session.error_msg = 'Las contraseñas no coinciden';
    return res.redirect('/auth/register');
  }

  if (password.length < 6) {
    req.session.error_msg = 'La contraseña debe tener al menos 6 caracteres';
    return res.redirect('/auth/register');
  }

  User.findByEmail(email, (err, existingUser) => {
    if (err) {
      req.session.error_msg = 'Error del servidor';
      return res.redirect('/auth/register');
    }

    if (existingUser) {
      req.session.error_msg = 'El email ya está registrado';
      return res.redirect('/auth/register');
    }

    User.create({ username, email, password }, (err, userId) => {
      if (err) {
        req.session.error_msg = 'Error al crear el usuario';
        return res.redirect('/auth/register');
      }

      req.session.success_msg = '¡Registro exitoso! Ahora puedes iniciar sesión.';
      res.redirect('/auth/login');
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;