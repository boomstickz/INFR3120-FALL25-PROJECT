// server/controllers/authController.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const { DEFAULT_PROFILE } = require('./profileController');

const SALT_ROUNDS = 10;
const RESET_WINDOW_MS = 1000 * 60 * 60; // 1 hour
let cachedMailer = null;

async function loadMailer() {
  if (cachedMailer !== null) {
    return cachedMailer;
  }

  cachedMailer = await import('nodemailer')
    .then((mod) => mod.default || mod)
    .catch((err) => {
      console.warn('Nodemailer not available; reset emails will be logged.', err?.message);
      return null;
    });

  return cachedMailer;
}

async function sendResetEmail(recipientEmail, resetUrl) {
  const mailer = await loadMailer();

  if (!mailer) {
    console.log(`[password-reset] Send this link to ${recipientEmail}: ${resetUrl}`);
    return;
  }

  const transportOptions = process.env.MAIL_HOST
    ? {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        secure: process.env.MAIL_SECURE === 'true',
        auth:
          process.env.MAIL_USER && process.env.MAIL_PASS
            ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
            : undefined,
      }
    : {
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      };

  const transporter = mailer.createTransport(transportOptions);

  const mailOptions = {
    from: process.env.MAIL_FROM || 'Forge My Hero <no-reply@forgemyhero.local>',
    to: recipientEmail,
    subject: 'Reset your Forge My Hero password',
    text: `We received a request to reset your Forge My Hero password. Use the link below to set a new one:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <p>We received a request to reset your <strong>Forge My Hero</strong> password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (transporter.options && transporter.options.streamTransport && info?.message) {
    console.log('Password reset email preview:\n', info.message.toString());
  }
}

module.exports.displayLoginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/'); // already logged in
  }
  
  const successMessage = req.session.successMessage || null;
  delete req.session.successMessage;

  res.render('login', {
    title: 'Login | Forge My Hero',
    successMessage,
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
module.exports.displayForgotPasswordPage = (req, res) => {
  res.render('forgot-password', {
    title: 'Forgot Password | Forge My Hero',
    errorMessage: null,
    successMessage: null,
    formData: {},
  });
};

module.exports.processForgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  const successMessage =
    'If an account matches that email, we just sent a reset link. Please check your inbox and spam folder.';

  if (!normalizedEmail) {
    return res.render('forgot-password', {
      title: 'Forgot Password | Forge My Hero',
      errorMessage: 'Please enter the email associated with your account.',
      successMessage: null,
      formData: { email: normalizedEmail },
    });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = Date.now() + RESET_WINDOW_MS;
      await user.save();

      const resetUrl = `${req.protocol}://${req.get('host')}/users/reset/${rawToken}`;
      await sendResetEmail(user.email, resetUrl);
    }

    return res.render('forgot-password', {
      title: 'Forgot Password | Forge My Hero',
      errorMessage: null,
      successMessage,
      formData: {},
    });
  } catch (err) {
    console.error('Error during password reset request:', err);
    return res.render('forgot-password', {
      title: 'Forgot Password | Forge My Hero',
      errorMessage: 'Something went wrong. Please try again.',
      successMessage: null,
      formData: { email: normalizedEmail },
    });
  }
};

module.exports.displayResetPasswordPage = async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.render('reset-password', {
      title: 'Reset Password | Forge My Hero',
      errorMessage: 'This reset link is invalid or has expired. Please request a new one.',
      successMessage: null,
      canReset: false,
      token,
    });
  }

  res.render('reset-password', {
    title: 'Reset Password | Forge My Hero',
    errorMessage: null,
    successMessage: null,
    canReset: true,
    token,
  });
};

module.exports.processResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.render('reset-password', {
      title: 'Reset Password | Forge My Hero',
      errorMessage: 'This reset link is invalid or has expired. Please request a new one.',
      successMessage: null,
      canReset: false,
      token,
    });
  }

  if (!password || !confirmPassword) {
    return res.render('reset-password', {
      title: 'Reset Password | Forge My Hero',
      errorMessage: 'Please fill in all password fields.',
      successMessage: null,
      canReset: true,
      token,
    });
  }

  if (password !== confirmPassword) {
    return res.render('reset-password', {
      title: 'Reset Password | Forge My Hero',
      errorMessage: 'Passwords do not match.',
      successMessage: null,
      canReset: true,
      token,
    });
  }

  if (password.length < 6) {
    return res.render('reset-password', {
      title: 'Reset Password | Forge My Hero',
      errorMessage: 'Password should be at least 6 characters long.',
      successMessage: null,
      canReset: true,
      token,
    });
  }

  try {
    user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.session.successMessage = 'Password reset successful. Please log in with your new password.';
    return res.redirect('/users/login');
  } catch (err) {
    console.error('Error resetting password:', err);
    return res.render('reset-password', {
      title: 'Reset Password | Forge My Hero',
      errorMessage: 'Something went wrong. Please try again.',
      successMessage: null,
      canReset: true,
      token,
    });
  }
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
        successMessage: null,
        errorMessage: 'Please enter your email and password.',
        formData,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render('login', {
        title: 'Login | Forge My Hero',
        successMessage: null,
        errorMessage: 'Invalid email or password.',
        formData,
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', {
        title: 'Login | Forge My Hero',
        successMessage: null,
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
      successMessage: null,
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
