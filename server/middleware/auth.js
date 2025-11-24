// server/middleware/auth.js

function ensureLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    // optionally remember where user wanted to go
    req.session.redirectTo = req.originalUrl;
    res.redirect('/users/login');
  }
  
  module.exports = { ensureLoggedIn };
  