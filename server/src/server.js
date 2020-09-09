const db = require('./database');

// ensure connection
db.checkConnection();

const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LocalStrategy = require('passport-local').Strategy;

const auth = require('./auth');
const converter = require('./converter');

const SESSION_SECRET = crypto.randomBytes(64).toString('base64');

const app = express();
const port = process.env.PORT || 3000;

// const VIEW_DIR = process.env.VIEW_DIR || '../../view/public/';
const VIEW_DIR = '../../view/public/';

const BASEPATH = process.env.BASEPATH || '/';
const WIKINAME = process.env.WIKINAME || 'Epoche';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, VIEW_DIR)));

passport.use(
  new LocalStrategy(
    {
      usernameField: 'userid',
      passwordField: 'password',
    },
    (userid, password, done) => {
      db.getUser(userid).then((user) => {
        if (!!user && auth.verifyPassword(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.userid);
});

passport.deserializeUser((userid, done) => {
  db.getUser(userid)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      return done(err);
    });
});

app.use(
  require('express-session')({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/search', (req, res) => {
  db.search(req.query.q, req.query.offset, req.query.limit, req.query.s)
    .then((pages) => {
      res.json({
        pages: pages,
      });
    })
    .catch((err) => {
      console.error(err);
      res.json({});
    });
});

app.post(
  '/api/auth',
  (req, res, next) => {
    passport.authenticate('local', (err, user, _info) => {
      if (err || !user) return res.status(401).json();
      req.logIn(user, next);
    })(req, res, next);
  },
  (req, res) => {
    res.json({ userid: req.user.userid });
  },
);

app.get('/api/auth/signout', function (req, res) {
  req.logout();
  res.json({ status: 200 });
});

app.get('/api/auth/user', function (req, res) {
  if (req.isAuthenticated()) {
    res.json({ userid: req.user.userid });
  } else {
    res.status(401).json(null);
  }
});

app.get('/api/:pageid/markup', (req, res) => {
  db.getPage(req.params.pageid)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      console.error(err);
      res.json({});
    });
});

app.get('/api/:pageid/history', (req, res) => {
  db.getPageHistory(req.params.pageid, req.query.offset, req.query.limit)
    .then((pages) => {
      res.json({
        pages: pages,
      });
    })
    .catch((err) => {
      console.error(err);
      res.json({});
    });
});

app.get('/api/:pageid', (req, res) => {
  db.getPage(req.params.pageid)
    .then((page) => {
      converter.toHtml(page.content).then((html) => {
        page = Object.assign(page, {
          content: html,
        });
        res.json(page);
      });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.post('/api/:pageid', (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json();
  } else {
    db.upsertPage(
      req.params.pageid,
      req.body.title,
      req.body.content,
      req.body.isSubstantial,
      req.user.userid,
    )
      .then((page) => {
        res.json(page);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }
});

app.get('*', (req, res) => {
  fs.readFile(
    path.join(__dirname, `${VIEW_DIR}/index.html`),
    'utf8',
    (err, data) => {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      data = data.replace('BASEPATH', `'${BASEPATH}'`);
      data = data.replace('WIKINAME', `'${WIKINAME}'`);
      res.send(data);
    },
  );
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
