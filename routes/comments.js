const express = require('express');
const commentRouter = express.Router();
const Comment = require('../models/comment');
const cors = require('./cors');
const authenticate = require('../authenticate');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
        const { authorId, recipeId, text } = req.body;
        if (!authorId) { throw new Error("no authorId") }
        if (!recipeId) { throw new Error("no recipeId") }
        if (!text) { throw new Error("no text") }

        const input = {
            authorId: authorId,
            recipeId: recipeId,
            text: text
        }

        try {
            const comment = await Comment.create(input)
            res.status(200).send({ success: true, comment: comment })
        } catch (err) {
            next(err);
        }
    })

module.exports = commentRouter
