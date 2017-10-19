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

app.use(express.static('public'));

const Gallery = db.gallery;

app.use(bodyParser.urlencoded({ extend : true }));

app.post('/gallery', (req, res) => {
  const data = req.body;

  let result = Gallery.create({author : data.author, link : data.link, description : data.description})
    .then((data) => {
      return res.render('partials/gallery/index', data);
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});

app.get('/gallery', (req, res) => {

  return Gallery.findAll({order : [['id', 'ASC']]})
    .then((data) => {
      let locals ={
        data : data
      };
      return res.render('partials/gallery/index', locals);
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
    .then((data) => {
      let locals ={
        data : data
      };
      return res.render('partials/gallery/artwork', locals);
    });
});

app.get('/gallery/:id/edit', (req, res) => {
  const id = req.params.id;

  return Gallery.findById(id)
    .then((data) => {
      let locals ={
        data : data
      };
      return res.render('partials/gallery/edit', locals);
    });
});

app.put('/gallery/:id/edit', (req, res) => {
  const data = req.body;
  const id = req.params.id;


  return Gallery.update({author : data.author, link : data.link, description : data.description}, { where : {id : id}})
    .then((data) => {
      let locals ={
        data : data
      };
      return res.redirect('/gallery');
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
});

app.delete('/gallery/:id/edit', (req, res) => {
  const id = req.params.id;

  Gallery.destroy({where : {id : id}})
    .then((data) => {
      let locals ={
        data : data
      };
      return res.redirect('/gallery');
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
});


app.listen(port, () => {
  db.sequelize.sync({ force : false });
  console.log("Server's UP " + `${port}`);
});





