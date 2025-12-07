# Forge My Hero — Final Release

Forge My Hero is a Dungeons & Dragons character manager that replaces paper sheets with a secure, image-rich web app. This full release focuses on polished account management, richer media support and a smoother experience for both new and returning players.

## What's New in This Release

- **Character image uploads** on create and edit pages, supporting multiple portraits that are stored on the server and persisted with each character record.
- **Profile pictures in the navigation bar**, uploaded directly from the UI and cached per session so players always see their avatar after refreshing.
- **Password reset flow** with request and token-based reset pages, including validation for expired or invalid links.

## Core Feature Set

- User registration, login, logout, and session-based authentication with hashed passwords.
- Protected character CRUD routes that only allow signed-in users to add, edit, or delete content.
- Character sheets with ability scores, proficiencies, hit points, and structured inputs for equipment and notes.
- Upload pipelines for character portraits and profile avatars, saved under `/public/uploads` and exposed via static hosting.
- Forgot/reset password screens with email-token verification and safe password validation rules.

## Project Structure

```
INFR3120-FALL25-PROJECT/
├── package.json                # Project metadata and npm scripts
├── server.js                   # Entry point that boots the Express app
├── public/                     # Static assets and uploaded media
│   ├── img/                    # Global images (e.g., default profile placeholder)
│   ├── uploads/                # Saved portraits and profile pictures
│   └── Script/                 # Front-end scripts
└── server/                     # Application source code
    ├── config/                 # Express, database, and env configuration
    ├── controllers/            # Authentication and profile handlers
    ├── middleware/             # Auth guards
    ├── models/                 # Mongoose schemas for users and characters
    ├── routes/                 # Express route definitions (users, characters, landing)
    └── views/                  # EJS templates for auth, characters, and shared partials
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables** (e.g., in a `.env` file; see `.env.example`):
   - `MONGO_URI` — MongoDB connection string
   - `SESSION_SECRET` — secret used to sign session cookies
   - **Password reset email settings** (for real mail delivery):
     - `MAIL_HOST` / `MAIL_PORT` / `MAIL_SECURE` — SMTP details (e.g., host `smtp.gmail.com`, port `465` with `MAIL_SECURE=true`)
     - _or_ `MAIL_SERVICE` — provider name if you prefer Nodemailer service shortcuts (default `gmail`)
     - `MAIL_USER` / `MAIL_PASS` — SMTP username and password (for Gmail, use an app password)
     - `MAIL_FROM` — optional from header (defaults to `Forge My Hero <no-reply@forgemyhero.local>`) 

3. **Run the app**
   ```bash
   npm start
   ```
   The server starts at `http://localhost:3000`
   or on Render:
   https://infr3120-fall25-project-14x6.onrender.com/

## Feature Details

- **Character portrait uploads**: Create and edit routes parse base64 image data, save files under `public/uploads/characters`, and persist the resulting paths with each character. Existing images remain attached unless explicitly removed during editing.
- **Profile avatar uploads**: Authenticated users can update their nav-bar avatar; images are validated for size and written to `public/uploads/profile-pictures`, with the new path stored on their user document and in the session for immediate display.
- **Password reset**: Players can request a reset link, which generates a hashed token with an expiration window. Reset pages validate the token, enforce minimum password length, and clear the token after a successful update.


## Tech Stack
- Node.js, Express, and EJS
- MongoDB with Mongoose ODM
- express-session for session management
- bcrypt for secure password hashing
- Base64 handling for portrait uploads (parsed via multer) and file-system writes for avatars
- Bootstrap and Font Awesome for styling
