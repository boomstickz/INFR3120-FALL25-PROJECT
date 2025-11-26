# Forge My Hero — Authentication Release (Release 2)

Forge My Hero is a Dungeons & Dragons character manager that replaces traditional pen-and-paper sheets with an interactive web app. This release focuses on adding secure authentication, protected routes, and dynamic navigation based on user login state.

## Features Added in Release 2

### User Authentication
- Fully functional Register and Login pages
- Password hashing with **bcrypt**
- Session-based authentication with **express-session**
- Secure logout functionality

### Protected Routes
- Character Edit and Delete pages now require login
- Middleware `isAuthenticated` added to guard sensitive routes
- Auth-aware navigation added to guide users to login or logout

## Project Structure

```
INFR3120-FALL25-PROJECT/
├── package.json                # Project metadata and npm scripts
├── server.js                   # Entry point that bootstraps the Express app
├── public/                     # Static assets served by Express
│   ├── img/                    # Images used by the UI
│   └── Script/                 # Front-end scripts
└── server/                     # Application source code
    ├── config/                 # Express app configuration and database connection
    │   ├── app.js
    │   └── db.js
    ├── controllers/            # Request handlers (e.g., authentication)
    │   └── authController.js
    ├── middleware/             # Custom middleware (auth guards)
    │   └── auth.js
    ├── models/                 # Mongoose schemas for users and characters
    │   ├── User.js
    │   └── character.js
    ├── routes/                 # Express route definitions
    │   ├── character.js
    │   ├── index.js
    │   └── users.js
    └── views/                  # EJS templates
        ├── Characters/
        ├── partials/
        ├── landing.ejs
        ├── login.ejs
        ├── register.ejs
        └── about.ejs
```

## Tech Stack
- Node.js, Express, and EJS
- MongoDB with Mongoose ODM
- express-session for session management
- bcrypt for secure password hashing
- Bootstrap and Font Awesome for styling
