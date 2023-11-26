const mongoose = require('mongoose');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = require('./app');
const config = require ('./config.js');

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
firebaseApp.use(app);

exports.api = functions.https.onRequest(firebaseApp);