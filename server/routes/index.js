let express = require('express');
let router = express.Router();

// Landing / home page
router.get('/', function (req, res) {
  res.sendFile('index.html', { root: 'public' });
});

// About page
router.get('/about', function (req, res) {
  res.render('about', { title: 'About | Forge My Hero' });
});

module.exports = router;