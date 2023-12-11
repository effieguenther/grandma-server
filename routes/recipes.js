const express = require('express');
const recipeRouter = express.Router();
const Recipe = require('../models/recipe');
const cors = require('./cors');
const authenticate = require('../authenticate');

recipeRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, async (req, res, next) => {
    try {
      let all_recipes = await Recipe.find();
      res.status(200).send({ success: true, recipes: all_recipes })
    } catch (err) { next(err) }
  })
  .post(cors.corsWithOptions, async (req, res, next) => {
    try {
      const new_recipe = await Recipe.create(req.body);
      res.status(200).send({ success: true, recipe: new_recipe })
    } catch (err) { next(err) }
  })
  .put((req, res) => {
    res.status(403).send('PUT operation not supported on /recipes');
  })
  .delete((req, res) => {
    res.status(403).send('DELTE operation not supported on /recipes')
  });

recipeRouter.route('/search')
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    const { title, category, favorites } = req.body;
    const favoritesList = req.user.favorites;
    let query = {};

    if (favorites === true) {
      query = {
        $and: [
          { title: { $regex: title, $options: 'i' } },
          { category: { $regex: category, $options: 'i' } },
          { _id: { $in: favoritesList } }
        ]
      }
    } else {
      query = {
        $and: [
          { title: { $regex: title, $options: 'i' } },
          { category: { $regex: category, $options: 'i' } }
        ]
      }
    }

    try {
      const recipes = await Recipe.find(query);
      res.status(200).send({ success: true, recipes: recipes });
    } catch (err) { next(err) }
  })

module.exports = recipeRouter;