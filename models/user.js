const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportFacebook = require('passport-facebook');

const userSchema = new Schema({
    facebookId: {
        type: String,
        default: ""
    },
    googleId: {
        type: String,
        default: ""
    },
    display_name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true
    },
    notifications: {
        type: Boolean,
        default: true
    },
    favorites: {
        type: [String],
        default: []
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;