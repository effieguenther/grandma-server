const express = require('express');
const recipeRouter = express.Router();
const Recipe = require('../models/recipe');
const Comment = require('../models/comment');
const cors = require('./cors');
const authenticate = require('../authenticate');
const PDFDoc = require('pdfkit');
const fs = require('fs');

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
  });

recipeRouter.route('/comments/:recipeId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, async (req, res, next) => {
    const recipeId = req.params.recipeId;

    try {
      const comments = await Comment.find({ recipeId: recipeId })
        .populate('authorId');
      res.status(200).send({ success: true, comments: comments })
    } catch (err) { next(err) }
  });

recipeRouter.route('/pdf/:recipeId') 
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, async (req, res, next) => {
    const recipeId = req.params.recipeId;
    try {
      const recipe = await Recipe.findById(recipeId);
      const title = recipe.title;
      const ingredient_groups = recipe.ingredients;
      const doc = new PDFDoc({ size: 'LETTER' });
      doc.pipe(fs.createWriteStream(`${title}.pdf`));
      doc.pipe(res);
        doc.fontSize(25).text(title);
        doc.fontSize(15).text(`source: ${recipe.source}   category: ${recipe.category}`);
        let y = 0;
        ingredient_groups.map((ing_group, idx) => {
          const left = ingredient_groups.length === 1 ? 
            80 :
            //2 ingredient groups - line wrapping works
            ingredient_groups.length === 2 ?
            (idx * 200) + 80 :
            ingredient_groups.length === 3 ?
            (idx * 150) + 80 : 
            //4 ingredient groups - not line wrapping?? why
            (idx * 120) + 80
          if (ingredient_groups.length > 1) { 
            doc.text(ing_group.title, idx === 0 ? 70 : left - (idx * 10), 130) 
          }
          doc.list(ing_group.ingredients, left, 150, {
            listType: 'bullet',
            bulletRadius: 0.05,
            width: 200,
            lineBreak: true
          });
          //keep track  of the tallest list
          if (doc.y > y) { y = doc.y }
        })
        if (recipe.equipment.length !== 0) {
          doc.text('equipment: ')
          recipe.equipment.map((equipment) => {
            doc.text(equipment);
          })
        }
        doc.list(recipe.directions, 70, y + 15, {
          listType: 'bullet',
          bulletRadius: 0.05
        })
      doc.end();
    } catch (err) { next(err) }
  });

module.exports = recipeRouter;