let express = require('express');
let router = express.Router();

// Landing / home page
router.get('/', function (req, res) {
  res.sendFile('index.html', { root: 'public' });
});

module.exports = router;