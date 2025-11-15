var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET Characters page. */
router.get('/characters', function(req, res, next) {
  res.render('index', { title: 'Characters' });
});

});
module.exports = router;