const axios = require('axios');
const Recipe = require('../models/Recipe');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://dev-qttzuf0f.us.auth0.com/.well-known/jwks.json',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

module.exports.getRecipes = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOONACULAR_KEY}&ingredients=${req.query.ingredients}&ranking=1&number=6`
    );
    const results = response.data;

    for (let i = 0; i < 6; i++) {
      let steps = await acquireSteps(response.data[i]);
      results[i].steps = steps;
    }
    res.send(results.slice());
  } catch (err) {
    res.status(404).send(err);
  }
};

const acquireSteps = async (recipe) => {
  try {
    const stepResults = await axios.get(
      `https://api.spoonacular.com/recipes/${recipe.id}/analyzedInstructions?apiKey=${process.env.SPOONACULAR_KEY}`
    );
    return stepResults.data[0].steps.map((step) => step.step);
  } catch (err) {
    console.log(err);
  }
};

module.exports.getDataBaseRecipes = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      let userEmail = user.email;
      Recipe.find({ email: userEmail }, (err, recipes) => {
        res.send(recipes);
      });
    }
  });
};

module.exports.addRecipe = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      const newRecipe = new Recipe({
        recipe_id: req.body.recipe_id,
        title: req.body.title,
        image: req.body.image,
        steps: req.body.steps,
        missedIngredientCount: req.body.missedIngredientCount,
        missedIngredients: req.body.missedIngredients,
        usedIngredients: req.body.usedIngredients,
        unusedIngredients: req.body.unusedIngredients,
        email: user.email,
      });

      newRecipe.save((err, saveRecipeData) => {
        res.status(201).send(saveRecipeData);
      });
    }
  });
};

module.exports.deleteRecipe = async (req, res) => {
  const recipeId = req.params.id;
  try {
    Recipe.deleteOne({ _id: recipeId }).then((deleteOneRecipe) => {
      console.log(deleteOneRecipe);
      res.status(204).send(deleteOneRecipe);
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports.updateRecipe = async (req, res) => {
  console.log(req.body);
  const recipeId = req.params.id;
  try {
    const updateRecipe = await Recipe.findByIdAndUpdate(recipeId, req.body, { new: true });
    console.log(req.body);
    updateRecipe.save((err, updatedRecipe) => {
      res.status(200).send(updatedRecipe);
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports.getRecipesByComplexSearch = async (req, res) => {
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
    console.log(err);
    res.status(404).send(err);
  }
};
