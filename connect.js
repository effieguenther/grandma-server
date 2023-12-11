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

//initialize app
admin.initializeApp();
connect(config.mongoUrl);
const firebaseApp = express();
firebaseApp.set("trust proxy", true);

//session storage in mongodb
const store = new MongoStore({
    uri: config.mongoUrl,
    databaseName: 'grandma',
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 90, //3 months
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
});
exports.extendSession = async (sessionId, expirationDate, done) => {
    try {
        const db = store.client.db('grandma');
        await db.collection('sessions').updateOne(
            { _id: sessionId },
            { $set: { expires: expirationDate } }
        ) 
        return done();
    } catch (err) {
        done(err);
    }      
}
exports.destroySession = (sessionId, done) => {
    store.destroy(sessionId, (err) => {
        if (err) { return done(err) }
        return done();
    })
}

//configure sessions
firebaseApp.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, 
        httpOnly: true, 
        sameSite: 'none',
        expires: 1000 * 60 * 60 * 24 * 90 //3 months
    },
    store: store,
    proxy: true
}))
firebaseApp.use(passport.initialize());
firebaseApp.use(passport.session());

//define and export entire app as cloud function
firebaseApp.use(app);
exports.api = functions.https.onRequest(firebaseApp);