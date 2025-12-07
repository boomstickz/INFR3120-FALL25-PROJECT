const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const uploadsDir = path.join(__dirname, '../../public/uploads/profile-pictures');
const DEFAULT_PROFILE = '/img/profile-placeholder.svg';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ensureAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'You must be logged in to upload a profile picture.' });
  }
  next();
};

const saveProfileImage = async (userId, imageData) => {
  const matches = imageData.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid image format.');
  }

  const mimeType = matches[1];
  const base64Content = matches[2];
  const buffer = Buffer.from(base64Content, 'base64');
  const maxSize = 5 * 1024 * 1024;

  if (buffer.length > maxSize) {
    throw new Error('Image is too large. Please upload a file under 5MB.');
  }

  const extension = mimeType.split('/')[1] || 'png';
  const filename = `${userId}-${Date.now()}.${extension}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/profile-pictures/${filename}`;
};

module.exports.uploadProfilePicture = [
  ensureAuthenticated,
  async (req, res) => {
    const { imageData } = req.body;

    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'No image provided.' });
    }

    try {
      const user = await User.findById(req.session.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const publicPath = await saveProfileImage(user._id, imageData);
      user.profileImage = publicPath;
      await user.save();

      req.session.user.profileImage = publicPath;

      res.json({ imageUrl: publicPath });
    } catch (err) {
      console.error('Error saving profile picture:', err);
      res.status(400).json({ error: err.message || 'Unable to save profile picture. Please try again.' });
    }
  },
];

module.exports.DEFAULT_PROFILE = DEFAULT_PROFILE;