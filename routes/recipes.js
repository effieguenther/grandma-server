const express = require('express');
const recipeRouter = express.Router();
const Recipe = require('../models/recipe');
const ObjectId = require('mongodb').ObjectId;

recipeRouter.route('/')
  .get(async (req, res, next) => {
    try {
      let all_recipes = await Recipe.find();
      res.status(200).send({ success: true, recipes: all_recipes })
    } catch (err) { next(err) }
  })
  .post(async (req, res, next) => {
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
  .post((req, res) => {
    //will receive a search object with {title, ingredient, category}
  })

module.exports = recipeRouter;