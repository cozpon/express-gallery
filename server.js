//jshint esversion:6
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const port = process.env.PORT || 4567;
const app = express();

const db = require('./models');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended" : true }));
app.use(methodOverride('_method'));
app.engine('.hbs', exphbs ({
      defaultLayout: 'main',
      extname: '.hbs'
    }));
app.set('view engine', '.hbs');


const Gallery = db.gallery;

app.use(bodyParser.urlencoded({ extend : true }));

app.post('/gallery', (req, res) => {
  const data = req.body;
  // const author = req.body.author;
  // const link = req.body.link;
  // const description = req.body.description;
  // const artwork = {author : data.author, link : data.link, description : data.description};
  // console.log('1', artwork);

  let result = Gallery.create({author : data.author, link : data.link, description : data.description})
    .then((data) => {
      console.log('DATA DATA ===', data);
      return res.render('partials/gallery/index', data);
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

app.get('/gallery/:id', (req, res) => {
  const id = req.params.id;
  return Gallery.findById(id)
    .then(art => {
      return res.json(art);
    });
});

app.get('/gallery/:id/edit', (req, res) => {
  const id = req.params.id;

  return Gallery.findById(id)
    .then(art => {
      return res.json(art);
    });
});

app.put('/gallery/:id', (req, res) => {
  const id = req.body.id;
  const newAuthor = req.body.author;
  const newLink = req.body.link;
  const newDescription = req.body.description;
  const editArtwork = {author : newAuthor, link : newLink, description : newDescription};

  return Gallery.update({editArtwork : editArtwork})
    .then(newEdit => {
      return res.json(newEdit);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
});

app.delete('/gallery/:id', (req, res) => {
  const id = req.params.id;

  Gallery.destroy({where : {id : id}})
    .then(() => {
      return res.redirect('/gallery');
    });
});


app.listen(port, () => {
  db.sequelize.sync({ force : false });
  console.log("Server's UP " + `${port}`);
});





