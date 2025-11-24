let express = require('express');
let router = express.Router();

const authController = require('../controllers/authController');

// GET /users/login
router.get('/login', authController.displayLoginPage);

// POST /users/login
router.post('/login', authController.processLogin);

// GET /users/register
router.get('/register', authController.displayRegisterPage);

// POST /users/register
router.post('/register', authController.processRegister);

// POST /users/logout
router.post('/logout', authController.processLogout);

module.exports = router;
