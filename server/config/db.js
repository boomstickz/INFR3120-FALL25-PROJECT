// using .env and gitignore to hide mongodb password
require('dotenv').config();

module.exports = {
  URI: process.env.MONGODB_URI
};
