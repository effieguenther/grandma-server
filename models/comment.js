const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const commentSchema = new Schema({
    authorId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    recipeId: {
        type: ObjectId,
        ref: 'Recipe',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

//exports a constructor function which builds an instance of the model class