let express = require('express');
let router = express.Router();

const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

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

// POST /users/profile-picture
router.post('/profile-picture', profileController.uploadProfilePicture);

module.exports = router;
