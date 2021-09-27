const express = require('express');
const router = express.Router();
const axios = require('axios');

const getRecipes = async (req, res) => { 
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_KEY}&cuisine=${req.query.cuisine}&diet=${req.query.diet}&intolerences=${req.query.intolerances}&equipment=${req.query.equipment}&type=${req.query.type}&sort=meta-score&addRecipeInformation=true&number=6`
    );
    const results = response.data.results;

    for(let result of results) {
      let resultSteps = [];
      let resultEquipment = [];
      for(let step of result.analyzedInstructions[0].steps) {
        resultSteps.push(step.step);
      }
      for(let step of result.analyzedInstructions[0].steps) {
        step.equipment[0] ? resultEquipment.push(step.equipment[0].name) : resultEquipment.push('none');
      }
      result.steps = resultSteps;
      result.equipment = resultEquipment;
      delete result.analyzedInstructions;
    }
    res.send(results);
  } catch (err) {
    console.log(err)
    res.status(404).send(err);
  }
};

router.get('/', getRecipes);

module.exports = router;
