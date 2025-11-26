let express = require('express');
let router = express.Router();

// Landing / home page
router.get('/', function (req, res) {
  res.render('landing', { title: 'Forge My Hero — D&D Character Manager' });
});

// About page
router.get('/about', function (req, res) {
  res.render('about', { title: 'About | Forge My Hero' });
});

module.exports = router;