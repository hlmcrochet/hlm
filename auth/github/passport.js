const express = require('/express');
const passport = require('/passport');
const GitHubStrategy = require('../../passport-github').Strategy;
require('dotenv').config();  // to load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Configure Passport with GitHub strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
  // Here you can check if the GitHub profile matches the allowed user
  if (profile.username === 'hlmcrochet') {
    return done(null, profile);
  } else {
    return done(null, false); // reject if it's not your mum's account
  }
}));

// Initialize Passport
app.use(passport.initialize());

// Route for GitHub login
app.get('/auth/github', passport.authenticate('github'));

// GitHub callback route
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect to admin page
    res.redirect('/admin');
  }
);

// Admin route (protect it if needed)
app.get('/admin', (req, res) => {
  // Serve your admin page here
  res.send('Admin Page - You are logged in');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
