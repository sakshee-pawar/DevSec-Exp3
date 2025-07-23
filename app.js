const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');  // Importing connect-flash
const app = express();

const PORT = 3000;

// In-memory storage for users
let users = [];

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up EJS as the templating engine
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true
}));

// Initialize flash
app.use(flash());

// Serve static files (like CSS)
app.use(express.static('public'));

// Home / Registration page
app.get('/', (req, res) => {
    // Pass flash messages to the view
    res.render('register', { messages: req.flash('error') });
});

app.post('/', (req, res) => {
    const { fullname, email, password, confirm } = req.body;

    // Simple validation
    if (password !== confirm) {
        req.flash("error", "Passwords do not match");
        return res.redirect('/');
    }

    // Check if email is already used
    if (users.find(user => user.email === email)) {
        req.flash("error", "Email already registered");
        return res.redirect('/');
    }

    // Save user
    users.push({ name: fullname, email: email, password: password });
    req.flash("success", "Registration successful!");
    res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash('error') });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Authenticate user
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        req.session.user = user.name;
        return res.redirect('/users');
    }

    req.flash("error", "Invalid credentials");
    res.redirect('/login');
});

// View all users (protected)
app.get('/users', (req, res) => {
    if (!req.session.user) {
        req.flash("error", "Please log in first");
        return res.redirect('/login');
    }

    res.render('users', { users, currentUser: req.session.user });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
