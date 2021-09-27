const express = require('express');
const router = express.Router();
const axios = require('axios');

const getRecipes = async (req, res) => {
  
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_KEY}&cuisine=${req.query.cuisine}&diet=${req.query.diet}&intolerences=${req.query.intolerances}&equipment=${req.query.equipment}&type=${req.query.type}&sort=meta-score&addRecipeInformation=true&number=6`
    );

    res.send(response.data);
  } catch (err) {
    console.log(err)
    res.status(404).send(err);
  }
};

router.get('/', getRecipes);

module.exports = router;
