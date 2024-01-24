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
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.corsWithOptions, async (req, res, next) => {
    const { title, category, favorites } = req.body;
    let query = {};

    if (favorites === true) {
      const favoritesList = req.user.favorites;
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
        doc.font(__dirname + '/../font/Sandy-Daniel.ttf')
        doc.fontSize(20).text(title, { lineGap: 10 });
        doc.fontSize(10).text(`source: ${recipe.source}   category: ${recipe.category}`);
        let cell1_bottom = 0;
        let cell2_bottom = 0;
        let row2_bottom = 0;
        let row1_top = doc.y;
        doc.fontSize(12);

        //ingredient groups will be mapped out in a 2x2 table
        ingredient_groups.map((ing_group, idx) => {
          const title_left = (idx === 0 || idx === 2) ? 70 : 210 + 80;
          const list_left = (idx === 0 || idx === 2) ? 80 : 210 + 80 + 10;
          const title_top = idx <=1 ? row1_top + 20 : idx === 3 ? cell1_bottom + 25 : cell2_bottom + 25;
          const list_top = idx <=1 ? row1_top + 40 : idx === 3 ? cell1_bottom + 45 : cell2_bottom + 45;

          if (ingredient_groups.length > 1) { doc.text(ing_group.title, title_left, title_top) }
          doc.list(ing_group.ingredients, list_left, list_top, {
              listType: 'bullet',
              bulletRadius: 0.05,
              width: 210,
              lineGap: 6
          });

          //keep track of the bottom values for placement of next row/cell
          if (idx === 0) { cell1_bottom = doc.y }
          if (idx === 1) { cell2_bottom = doc.y}
          if (idx > 1 && (doc.y > row2_bottom)) { row2_bottom = doc.y }
          console.log(`idx: ${idx}, cell1_bottom: ${cell1_bottom}, cell2_bottom: ${cell2_bottom}, row2_bottom: ${row2_bottom}`);
        })

        let next_y = 
          ingredient_groups.length <= 2 ? 
          (cell1_bottom > cell2_bottom ? cell1_bottom : cell2_bottom) : 
          row2_bottom;

        if (recipe.equipment.length !== 0) {
          doc.text('equipment: ' + recipe.equipment, 70, next_y + 15);
          next_y = doc.y
        }

        doc.list(recipe.directions, 70, next_y + 15, {
          listType: 'bullet',
          bulletRadius: 0.05,
          lineGap: 6
        })

      doc.end();

    } catch (err) { next(err) }
  });

  recipeRouter.route('/:recipeId')
    .options(cors.corsWithOptions, (req, res) => {
      res.sendStatus(200);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
      try {
        const recipeId = req.params.recipeId;
        const response = await Recipe.findByIdAndDelete(recipeId);
        res.status(200).send({ success: true, response: response });
      } catch (err) { next(err) }
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
      const recipeId = req.params.recipeId;
      try {
        const recipe = await Recipe.findOneAndUpdate({ _id: recipeId },
          { $set: req.body },
          { new: true }  
        )
        res.status(200).send({ success: true, recipe: recipe });
      } catch (err) { next(err) }
    })

module.exports = recipeRouter;