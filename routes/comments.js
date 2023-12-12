const express = require('express');
const commentRouter = express.Router();
const Comment = require('../models/comment');
const cors = require('./cors');
const authenticate = require('../authenticate');
const mongoose = require('mongoose')

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

commentRouter.route('/delete/:commentId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
        const commentId = req.params.commentId;
        try {
            const response = await Comment.findByIdAndDelete(commentId);
            res.status(200).send({ success: true, response: response })
        } catch (err) { next(err) }
    })

commentRouter.route('/:commentId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
        const commentId = req.params.commentId;
        const { text } = req.body;
        //TODO: form validation so user can't send an empty string
        if (!text) { throw new Error("no text") }

        try {
            const updatedComment = await Comment.findByIdAndUpdate(
                commentId, 
                { text: text },
                { new: true }
            )
            res.status(200).send({ success: true, comment: updatedComment });
        } catch (err) { next(err) }
    })

module.exports = commentRouter
