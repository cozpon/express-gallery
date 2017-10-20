//jshint esversion:6
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const bcrypt = require('bcrypt');

const saltRounds = 12; //about 3 sec.
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

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static('public'));

const artworks = db.artworks;
const users = db.users;

app.use(bodyParser.urlencoded({ extend : true }));

///Passport shish
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done) => {
  console.log('serializing');
  return done(null, {
    id: user.id,
    username: user.username
  });
});

passport.deserializeUser((user, done) => {
  console.log('deserializing');
  db.users.findOne({ where: {id: user.id}})
    .then(user => {
      return done(null, {
        id: user.id,
        username: user.username

      });
    });
});

passport.use(new LocalStrategy(function (username, password, done) {
  db.users.findOne({where: {username : username}})
  .then(user => {
    if(user === null) {
      return done(null, false, {message: 'bad username or password'});
    }else{
      bcrypt.compare(password, user.password)
      .then(res => {
        console.log(res);
        if(res) {return done(null, user);
        }else{
          return done(null, false, {message: 'bad username or password'});
        }
      });
    }
  })
  .catch(err => {
    console.log('error : ', err);
  });
}));

//routes
app.post('/login', passport.authenticate('local', {
  successRedirect: '/gallery',
  failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.sendStatus(200);
});

app.post('/register', (req,res) => {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      db.users.create({
        username: req.body.username,
        password: hash
      })
      .then((user) => {
        console.log(user);
        res.redirect('/gallery');
      })
      .catch((err) => {return res.send('Stupid username');});
    });
  });
});


//secure route for logged in users
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {next();}
  else {res.redirect('/login.html');}
}

app.get('/secret', isAuthenticated, (req,res) => {
  console.log('req.user',req.user);
  console.log('req.user.id', req.user.id);
  console.log('req.user.username',req.user.username);
  console.log('req.user.password',req.user.password);
  res.send('you found the secret');
});


app.post('/gallery', isAuthenticated, (req, res) => {
  const data = req.body;

  let result = artworks.create({author : data.author, link : data.link, description : data.description, userId: req.user.id})
    .then((data) => {
      return res.render('partials/gallery/index', data);
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});

app.get('/gallery', (req, res) => {

  return artworks.findAll({order : [['id', 'ASC']]})
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
  return artworks.findById(id)
    .then((data) => {
      let locals ={
        data : data
      };
      return res.render('partials/gallery/artwork', locals);
    });
});

app.get('/gallery/:id/edit', isAuthenticated, (req, res) => {
  const id = req.params.id;

    return artworks.findById(id)
    .then((artwork) => {
       if(req.user.id === artwork.userId){
      let locals ={
        artwork : artwork

      };
      return res.render('partials/gallery/edit', locals);
    }
  });
});

app.put('/gallery/:id/edit', isAuthenticated, (req, res) => {
  const data = req.body;
  const id = req.params.id;

  return artworks.update({author : data.author, link : data.link, description : data.description}, { where : {id : id}})
    .then((artwork) => {
      if(req.user.id === artwork.userId){
      let locals ={
        artwork : artwork
      };
      return res.redirect('/gallery');
     }
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
});

app.delete('/gallery/:id/edit', isAuthenticated, (req, res) => {
  const id = req.params.id;
  console.log("REQPARAMSID",id);

  artworks.destroy({where : {id : id}})
    .then((artwork) => {
      if(req.user.id === artwork.userId){
      let locals ={
        artwork : artwork
      };
      return res.redirect('/gallery');
      }
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





