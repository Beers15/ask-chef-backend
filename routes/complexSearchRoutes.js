const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes');

router.get('/', recipesController.getRecipesByComplexSearch);

module.exports = router;
