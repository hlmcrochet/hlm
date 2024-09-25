const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const { Octokit } = require('@octokit/rest');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Body parser middleware
app.use(bodyParser.json());

// Static files middleware
app.use(express.static('public')); // Serve static files from 'public' folder

// Session management (for login sessions)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth setup
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, function (accessToken, refreshToken, profile, cb) {
  // Restrict to your mum's GitHub account only
  if (profile.username === 'hlmcrochet') {
    return cb(null, { profile, accessToken });
  } else {
    return cb(null, false, { message: 'Not authorized' });
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// GitHub login route
app.get('/auth/github', passport.authenticate('github'));

// GitHub callback route after login
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/admin');
  }
);

// Serve the editor page only if logged in and authorized
app.get('/admin', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'views/editor.html'));
  } else {
    res.redirect('/auth/github');
  }
});

// GitHub API integration for saving changes
app.post('/save', async (req, res) => {
  const { html, css } = req.body;
  const octokit = new Octokit({ auth: req.user.accessToken }); // Use authenticated user's token

  try {
    const { data } = await octokit.repos.getContent({
      owner: 'YourMumGitHubUsername', // Replace with your mum's GitHub username
      repo: 'website-repo-name', // Replace with your mum's website repository name
      path: 'index.html',
    });

    const sha = data.sha; // Get the current file's SHA for updating
    await octokit.repos.createOrUpdateFileContents({
      owner: 'YourMumGitHubUsername',
      repo: 'website-repo-name',
      path: 'index.html',
      message: 'Updated index.html via admin editor',
      content: Buffer.from(html).toString('base64'),
      sha,
    });

    res.json({ message: 'Changes saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save changes.', error });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Auto-logout when leaving or reloading the page
app.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.destroy();
  }
  next();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});