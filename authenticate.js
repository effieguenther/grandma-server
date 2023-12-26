const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const add = require('date-fns/add');
const User = require('./models/user');
const config = require('./config');
const connect = require('./connect');
const { error } = require('firebase-functions/logger');

//configures a Facebook OAuth 2.0 strategy for Passport
passport.use(new FacebookStrategy({
    clientID: config.fbClientId,
    clientSecret: config.fbClientSecret,
    callbackURL: 'https://grandma-8ed4c.web.app/api/users/auth/facebook/callback'
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
        //returns existing user or creates one
        const user = await User.findOne({ facebookId: profile.id });
        if (user) {
          return cb(null, user);
        }
        const newUser = new User({ facebookId: profile.id, display_name: profile.displayName });
        await newUser.save();
        return cb(null, newUser);
    } catch (err) { return cb(err) }
  }
));

//when a session is initialized, passport stores the user id in the session doc
passport.serializeUser((user, done) => {
  console.log('serializing user...')
  return done(null, user._id);
});

//when any request is made during an active session, passport uses the stored user id to extract the associated user doc
passport.deserializeUser(async (id, done) => {
  console.log('deserializing user...');
  try {
    let user = await User.findById(id);
    return done(null, user)
  } catch (err) {
    return done(err)
  }
});

//middleware function that checks if user exists
//passport.session() middleware in connect.js provides req.user object
exports.verifyUser = async (req, res, next) => {
    console.log('verifying user...');
    if (req.user) { 
      const currentTime = new Date();
      const expirationDate = req.session.cookie.expires;
      const inOneMonth = add(expirationDate, { months: 1 });
      //if the session expires in 1 month or less, add 3 months to the session
      if (inOneMonth >= currentTime) {
        const inThreeMonths = add(currentTime, { months: 3 });
        await connect.extendSession(req.sessionID, inThreeMonths, (err) => {
          if (err) { res.status(500).send({ error: err }) }
        });
        req.session.cookie.expires = inThreeMonths;
        req.session.save();
      }
      return next();
    } 
    else { res.status(400).send({ error: "ERROR, unauthorized" }) }
}
  
