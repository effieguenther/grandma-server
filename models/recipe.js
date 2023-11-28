const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: true
    }
})

const recipeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'Sandra Daniel'
    },
    category: {
        type: String,
        enum: ["Appetizers", "Breakfast", "Breads", "Cakes", "Candy", "Casseroles", "Canning", "Cookies", "Desserts", "Drinks", "Fish", "Frosting", "Ice Cream", "Meat", "Pasta", "Pie", "Poultry", "Pudding", "Salads", "Soups", "Vegetables"],
        required: true
    },
    ingredients: {
        type: [ingredientSchema],
        required: true
    },
    equipment: {
        type: [String],
        default: []
    },
    directions: {
        type: [String],
        required: true
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;

//exports a constructor function which builds an instance of the model class