const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes');

router.route('/')
  .get(recipesController.getRecipes)
  .post(recipesController.addRecipe);

router.get('/db', recipesController.getDataBaseRecipes);

router.route('/:id')
  .delete(recipesController.deleteRecipe)
  .put(recipesController.updateRecipe);

module.exports = router;
