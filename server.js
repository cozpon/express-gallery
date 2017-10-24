//jshint esversion:6
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const bcrypt = require('bcrypt');
const flash = require('express-flash');

const path = require('path');

const redis = require('connect-redis')(session);


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
  store: new redis(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

const artworks = db.artworks;
const users = db.users;

app.use(bodyParser.urlencoded({ extend : true }));

///start authentication
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
  successRedirect: '/loggedIn',
  failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/flash');
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

//////end authentication



///not logged in
app.get('/gallery', (req, res) => {

  return artworks.findAll({order : [['id', 'ASC']]})
    .then((data) => {
      let locals ={
        data : data,
        expressFlash: req.flash('success')
      };
      return res.render('partials/gallery/index', locals);
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});
///not logged in end




///logged in

app.get('/loggedIn', isAuthenticated,(req, res) => {

  return artworks.findAll({order : [['id', 'ASC']]})
    .then((data) => {
      let locals ={
        data : data,
        expressFlash: req.flash('success')
      };
      return res.render('partials/loggedIn/index', locals);
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});



app.get('/loggedIn/:id', isAuthenticated, (req, res) => {
  const id = req.params.id;
  return artworks.findById(id)
    .then((data) => {
      let locals ={
        data : data
      };
      return res.render('partials/loggedIn/artwork', locals);
    });
});

app.post('/gallery', isAuthenticated, (req, res) => {
  const data = req.body;

  return artworks.create({author : data.author, link : data.link, description : data.description, userId: req.user.id})
    .then((data) => {
      return res.redirect('/loggedIn');
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});

app.get('/gallery/new', isAuthenticated, (req, res) => {
  console.log('in GAl new');
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
  if(req.user.id === id){
    return artworks.findById(id)
    .then((artwork) => {
       if(req.user.id === artwork.userId){
        let locals ={
          artwork : artwork
        };
        return res.render('partials/gallery/edit', locals);
       }
    });
  } else {
    return res.redirect('/error');
  }
});


app.put('/gallery/:id/edit', isAuthenticated, (req, res) => {
  const data = req.body;
  const id = req.params.id;
  return artworks.update({
    author : data.author,
    link : data.link,
    description : data.description
    },
    {
    where : {id : id}})
    .then((artwork) => {
      let locals ={
        artwork : artwork
      };
      return res.redirect('/gallery');
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});

app.delete('/gallery/:id/edit', isAuthenticated, (req, res) => {
  const id = req.params.id;
  console.log("REQPARAMSID",id);
  return artworks.destroy({where : {id : id}})
      .then((artwork) => {
        let locals ={
          artwork : artwork
        };
        return res.redirect('/gallery');
      })
      .catch(err => {
        console.log(err);
        return res.send(err);
      });
  });






// Route that creates a flash message using the express-flash module
app.get('/flash', function( req, res ) {
  req.flash('success', 'Congrats, You Logged Out... Way To Conform To Societial Standards. Sheep.');
  res.setTimeout(2000, (data) => {
    res.redirect('/gallery');
  });
});


app.get('/error', function( req, res ) {
  req.flash('success', 'Error! You Lack The Access To Edit This Image!');
  console.log("Yooo");
  res.setTimeout(10, (data) => {
  res.redirect('/loggedIn');
  });
});



app.listen(port, () => {
  db.sequelize.sync({ force : false });
  console.log("Server's UP " + `${port}`);
});





