//jshint esversion:6
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 4567;

const db = require('./models');


const Gallery = db.gallery;

app.use(bodyParser.urlencoded({ extend : true }));

app.post('/gallery', (req, res) => {
  const author = req.body.author;
  const link = req.body.link;
  const description = req.body.description;

  return Gallery.create({author : author, link : link, description : description})
    .then((newArt) => {
      return res.json(newArt);
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});

app.get('/gallery', (req, res) => {
  return Gallery.findAll()
    .then(arts => {
      return res.json(arts);
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});

app.get('/gallery/new', (req, res) => {
  return res.render('partials/gallery/new');
});


app.listen(port, () => {
  db.sequelize.sync({ force : true });
  console.log("Server's UP " + `${port}`);
});