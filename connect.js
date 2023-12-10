const mongoose = require('mongoose');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = require('./app');
const config = require ('./config.js');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongodb-session')(session);

//connect to MongoDb Atlas
const connect = async (uri) => {
    const options = {
        dbName: "grandma",
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    try {
        await mongoose.connect(uri, options);
        console.log('Successfully connected to MongoDB Atlas');
    } catch (err) {
        console.log('Error connecting to MongoDB Atlas', err);
        process.exit(1);
    }
}

//initialize express app as a firebase function
admin.initializeApp();
connect(config.mongoUrl);
const firebaseApp = express();
firebaseApp.set("trust proxy", 1);

//session storage in mongodb
const store = new MongoStore({
    uri: config.mongoUrl,
    databaseName: 'grandma',
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 30, //1 month
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
  });

//configure sessions
firebaseApp.use(session({
    secret: 'Lippy Lacy',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, sameSite: 'none' },
    store: store,
    proxy: true
}))
firebaseApp.use(passport.initialize());
firebaseApp.use(passport.session());

//define and export entire app as cloud function
firebaseApp.use(app);
exports.api = functions.https.onRequest(firebaseApp);