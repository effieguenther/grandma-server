const express = require('express');
const userRouter = express.Router();
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

userRouter.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

//get the user that's currently logged in
userRouter.get('/', cors.cors, async (req, res, next) => {
    const user = req.user;
    if (!user) { res.status(400).send({ success: false, error: "no user object" }) }

    try {
      const currentUser = await User.findById(user._id);
      res.status(200).send({ success: true, user: currentUser })
    } catch (err) { next(err) }
  })

//sign in with facebook
userRouter.get('/auth/facebook/', passport.authenticate('facebook'));
userRouter.get('/auth/facebook/callback', 
  cors.corsWithOptions, 
  passport.authenticate('facebook', { failureRedirect: 'https://grandma-8ed4c.web.app/login' }), 
  (req, res) => {
    res.redirect('http://localhost:3000/recipes');
});

//if the provided favorite is in the user's favorites, remove it. Otherwise add it.
userRouter.put('/updateFavorites', cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) { res.status(400).send({ success: false, error: "no user object" }) }
    let updatedUser = null;

    if (user.favorites.includes(req.body.favorite)) { 
      updatedUser = await User.findOneAndUpdate(
        { _id: user._id},
        { $pull: { favorites: req.body.favorite } },
        { new: true }
      )
    } else {
      updatedUser = await User.findOneAndUpdate(
        { _id: user._id},
        { $push: { favorites: req.body.favorite } },
        { new: true }
      )
    }
    res.status(200).send({ success: true, user: updatedUser });
  } catch (err) { next(err) }
})

//update display name
userRouter.put('/changeDisplayName', cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    const user = req.user;
    const name = req.body.name;

    if (!user) { res.status(400).send({ success: false, error: "no user object" }) }
    if (!name) { res.status(400).send({ success: false, error: "no name in body" }) }

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id},
        { $set: { display_name: name } },
        { new: true }
      )
      res.status(200).send({ success: true, user: updatedUser });
    } catch (err) { next(err) }
  })

//just checks to see if a user is logged in - will use this before pages load
userRouter.get('/verify', cors.cors, (req, res) => {
  if (req.user) { res.status(200).send({ success: true }) }
  else { res.status(200).send({ success: false }) }
})

module.exports = userRouter;
