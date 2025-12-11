function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error_msg = 'Debes iniciar sesión para acceder a esta página';
    res.redirect('/auth/login');
  }
}

function checkRole(roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.error_msg = 'Debes iniciar sesión';
      return res.redirect('/auth/login');
    }

    if (!roles.includes(req.session.user.role)) {
      req.session.error_msg = 'No tienes permisos para acceder a esta página';
      return res.redirect('/');
    }

    next();
  };
}

module.exports = { requireAuth, checkRole };