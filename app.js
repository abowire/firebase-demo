const config = require('./config');
const firebase = require('firebase');
const firebaseAdmin = require("firebase-admin");
const got = require('got');
const express = require('express');
const session = require("express-session");
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

// Initialize Firebase configuration
firebase.initializeApp(config.firebase);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config.firebaseAdmin.serviceAccountCertificate),
});

// See: https://firebase.google.com/docs/auth/web/custom-auth
const createFirebaseToken = (abowireUserId) => firebaseAdmin.auth().createCustomToken(abowireUserId);
const signInFirebase = (firebaseToken) => firebase.auth().signInWithCustomToken(firebaseToken);
const signOutFirebase = () => firebase.auth().signOut();
const getFirebaseUser = () => firebase.auth().currentUser;

// Custom profile handler to fetch the Abowire user after logging in
OAuth2Strategy.prototype.userProfile = (accessToken, done) => {
  const httpOptions = {
    prefixUrl: 'https://api.abowire.com/v1/',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  };

  return got('user/me', httpOptions).json()
    .then(user => done(null, user))
    .catch(err => done(err));
}

// Initialize Abowire OAuth2 configuration
passport.use('abowire.com', new OAuth2Strategy(config.abowire, async (accessToken, refreshToken, abowireUser, done) => {
  const firebaseToken = await createFirebaseToken(abowireUser.id);
  await signInFirebase(firebaseToken);
  
  return done(null, abowireUser);
}));

// Implement session serializer
passport.serializeUser((user, done) => done(null, JSON.stringify(user)));
passport.deserializeUser((user, done) => done(null, JSON.parse(user)));

// Initialize Express
const app = express();
app.use(session(config.express.session));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Route to start the authentication flow
app.get('/login', passport.authenticate('abowire.com'));

// Route to receive the tokens from Abowire
app.get('/oauth/callback',
  passport.authenticate('abowire.com', {
    successRedirect: '/example',
    failureRedirect: '/?error'
  })
);

// Route to log out
app.get('/logout', async (req, res) => {
  req.logout();
  await signOutFirebase();
  res.redirect('/');
});

// Route to show a Login link
app.get('/', async (req, res) => {
  res.send('<a href="/login">Login with Abowire</a>');
});


// Route to show an example with the data of the current logged user
app.get('/example', async (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }

  res.send(req.user);
});

// Start the Express server
app.listen(3000, () => {
  console.log('App started in http://localhost:3000')
});