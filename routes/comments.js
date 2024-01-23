const express = require('express');
const commentRouter = express.Router();
const Comment = require('../models/comment');
const cors = require('./cors');
const authenticate = require('../authenticate');
const nodemailer = require('nodemailer');
const config = require('../config');
const User = require('../models/user');
const Recipe = require('../models/recipe');

commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .post(cors.corsWithOptions, async (req, res, next) => {
        const { authorId, recipeId, text } = req.body;
        if (!authorId) { throw new Error("no authorId") }
        if (!recipeId) { throw new Error("no recipeId") }
        if (!text) { throw new Error("no text") }

        const input = { authorId: authorId, recipeId: recipeId, text: text }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'effiegguenther@gmail.com', pass: config.gmailPass }
        });

        try {
            const comment = await Comment.create(input);
            const author = await User.findById(authorId);
            const recipe = await Recipe.findById(recipeId);
            const recipeTitle = recipe.title.toUpperCase();
            const users = await User.find({ notifications: true });
            const toList = users.map((user) => user.email);
            const toString = toList.join(", ");

            const mailOptions = {
                from: 'effiegguenther@gmail.com',
                to: toString,
                subject: "Grandma Sandy's kitchen - New Comment",
                html: `<h2 id="header">${author.display_name} posted a new comment!</h2><hr/><h4>${recipeTitle}</h4><p>${text}</p><hr/><p><a href="https://grandma-8ed4c.web.app/recipes" target="_blank">view on website</a></p><p>To unsubscribe, log in and change your email settings</p>`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    next(error)
                } else {
                    console.log('email sent!')
                }
            })
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
