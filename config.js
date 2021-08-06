module.exports = {
  firebase: {
      apiKey: "API_KEY",
      authDomain: "PROJECT_ID.firebaseapp.com",
      projectId: "PROJECT_ID",
      storageBucket: "PROJECT_ID.appspot.com",
      messagingSenderId: "SENDER_ID",
      appId: "APP_ID",
  },
  firebaseAdmin: {
    // You will need to generate service account certificate and store them in service-account.json
    // See: https://firebase.google.com/docs/auth/web/custom-auth
    serviceAccountCertificate: require("./service-account.json"),
  },
  abowire: {
    // See: https://docs.abowire.com/rest-api/authentication
    authorizationURL: 'https://auth.abowire.com/oauth2/auth',
    tokenURL: 'https://auth.abowire.com/oauth2/token',
    callbackURL: 'http://localhost:3000/oauth/callback',
    clientID: 'your-abowire-key',
    state: true,
    scope: ['openid', 'profile', 'offline_access', 'customer_read'],
  },
  express: {
    session: {
      secret: "cats", // Change me
      resave: true,
      saveUninitialized: true,
    },
  },
};