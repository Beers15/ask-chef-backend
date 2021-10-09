const express = require('express');
const app = express();
const cors = require('cors');
const ingredientSearchRoutes = require('./routes/ingredientSearchRoutes');
const complexSearchRoutes = require('./routes/complexSearchRoutes');
const ExpressError = require('./helpers/ExpressError');
const mongoose = require('mongoose');
require('dotenv').config();
app.use(cors());
app.use(express.json());

mongoose.connect(`${process.env.DATABASE_URI}`);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => console.log('Successfully connected to Mognodb'));

app.use('/recipes', ingredientSearchRoutes);
app.use('/recipes/complex-search', complexSearchRoutes);
//if non-defined route is hit, returns error
app.all('*', (req, res, next) => {
  console.log(req.url + ' route not found.');
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  //returns generic error if no specific error is found
  const { status = 500 } = err;
  if(!err.message) 
    err.message = 'Oh no, something went wrong.';

  res.status(status).send(err);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
