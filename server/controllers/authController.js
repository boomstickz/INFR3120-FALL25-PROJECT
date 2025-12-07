// server/controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { DEFAULT_PROFILE } = require('./profileController');

const SALT_ROUNDS = 10;

module.exports.displayLoginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/'); // already logged in
  }
  res.render('login', {
    title: 'Login | Forge My Hero',
    errorMessage: null,
    formData: {},
  });
};

module.exports.displayRegisterPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register', {
    title: 'Register | Forge My Hero',
    errorMessage: null,
    formData: {},
  });
};

module.exports.processRegister = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const formData = { username, email };

  try {
    if (!username || !email || !password || !confirmPassword) {
      return res.render('register', {
        title: 'Register | Forge My Hero',
        errorMessage: 'Please fill in all fields.',
        formData,
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', {
        title: 'Register | Forge My Hero',
        errorMessage: 'Passwords do not match.',
        formData,
      });
    }

    if (password.length < 6) {
      return res.render('register', {
        title: 'Register | Forge My Hero',
        errorMessage: 'Password should be at least 6 characters long.',
        formData,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.render('register', {
        title: 'Register | Forge My Hero',
        errorMessage: 'An account with that email already exists.',
        formData,
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Store minimal user info in session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    };

    res.redirect('/');
  } catch (err) {
    console.error('Error registering user:', err);
    res.render('register', {
      title: 'Register | Forge My Hero',
      errorMessage: 'Something went wrong. Please try again.',
      formData,
    });
  }
};

module.exports.processLogin = async (req, res) => {
  const { email, password } = req.body;

  const formData = { email };

  try {
    if (!email || !password) {
      return res.render('login', {
        title: 'Login | Forge My Hero',
        errorMessage: 'Please enter your email and password.',
        formData,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render('login', {
        title: 'Login | Forge My Hero',
        errorMessage: 'Invalid email or password.',
        formData,
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', {
        title: 'Login | Forge My Hero',
        errorMessage: 'Invalid email or password.',
        formData,
      });
    }
  
    if (!user.profileImage) {
      user.profileImage = DEFAULT_PROFILE;
      await user.save();
    }

    // Save to session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    };

    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;

    res.redirect(redirectTo);
  } catch (err) {
    console.error('Error during login:', err);
    res.render('login', {
      title: 'Login | Forge My Hero',
      errorMessage: 'Something went wrong. Please try again.',
      formData,
    });
  }
};

module.exports.processLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
