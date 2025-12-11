function validateArticle(req, res, next) {
  const { title, content, category_id } = req.body;

  if (!title || title.trim() === '') {
    req.session.error_msg = 'El título es obligatorio';
    return res.redirect('back');
  }

  if (!content || content.trim() === '') {
    req.session.error_msg = 'El contenido es obligatorio';
    return res.redirect('back');
  }

  if (!category_id) {
    req.session.error_msg = 'La categoría es obligatoria';
    return res.redirect('back');
  }

  next();
}

function validateUser(req, res, next) {
  const { username, email, password, confirm_password } = req.body;

  if (!username || username.trim() === '') {
    req.session.error_msg = 'El nombre de usuario es obligatorio';
    return res.redirect('back');
  }

  if (!email || email.trim() === '') {
    req.session.error_msg = 'El email es obligatorio';
    return res.redirect('back');
  }

  if (!password || password.length < 6) {
    req.session.error_msg = 'La contraseña debe tener al menos 6 caracteres';
    return res.redirect('back');
  }

  if (password !== confirm_password) {
    req.session.error_msg = 'Las contraseñas no coinciden';
    return res.redirect('back');
  }

  next();
}

module.exports = { validateArticle, validateUser };