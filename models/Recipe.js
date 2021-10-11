const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  recipe_id: Number,
  title: String,
  image: String,
  steps: Array,
  missedIngredientCount: Number,
  missedIngredients: Array,
  usedIngredients: Array,
  unusedIngredients: Array,
  email: String,
  cheap: Boolean,
  veryHealthy: Boolean,
  veryPopular: Boolean,
  healthScore: Number,
  pricePerServing: Number,
  summary: String,
  cuisines: Array,
  dishTypes: Array,
  diets: Array,
  sourceUrl: String,
  creditsText: String,
  equipment: Array,
  servings: Number,
  readyInMinutes: Number
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
