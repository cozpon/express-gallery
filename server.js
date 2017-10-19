//jshint esversion:6
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 4567;

const db = require('./models');

const User = db.user;
const Task = db.task;
app.use(bodyParser.urlencoded({ extend : true }));


app.listen(port, () => {
  db.sequelize.sync({ force : false });
  console.log("Server's UP " + `${port}`);
});