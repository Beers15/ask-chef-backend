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

module.exports.getRecipesByIngredients = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOONACULAR_KEY}&ingredients=${req.query.ingredients}&ranking=1&number=6`
    );

    const results = [];

    for(let i = 0; i < response.data.length; i++) {
      const recipe = await axios.get(
        `https://api.spoonacular.com/recipes/${response.data[i].id}/information?apiKey=${process.env.SPOONACULAR_KEY}`
      );
      results.push(await getRecipeDetails(recipe.data));
    }
    res.send(results);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
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
      let recipe = req.body;
      recipe.email = user.email;
      const newRecipe = new Recipe(recipe);

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
  const recipeId = req.params.id;
  try {
    const updateRecipe = await Recipe.findByIdAndUpdate(recipeId, req.body, { new: true });
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
      getRecipeDetails(result);
    }
    res.send(results);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
};

const getRecipeDetails = async (recipe) => {
  let resultSteps = [];
  let resultEquipment = [];
  for(let step of recipe.analyzedInstructions[0].steps) {
    resultSteps.push(step.step);
  }
  for(let step of recipe.analyzedInstructions[0].steps) {
    step.equipment[0] ? resultEquipment.push(step.equipment[0].name) : resultEquipment.push('none');
  }
  recipe.steps = resultSteps;
  recipe.summary = recipe.summary.replace(/<a href=.*">/, '');
  recipe.equipment = resultEquipment;
  delete recipe.analyzedInstructions;
  return recipe;
};
