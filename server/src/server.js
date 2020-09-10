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
app.use(
  BASEPATH,
  express.static(path.join(__dirname, VIEW_DIR), {
    index: false,
  }),
);

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

const router = express.Router();
app.use(BASEPATH, router);

router.get('/api/search', (req, res) => {
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

router.post(
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

router.get('/api/auth/signout', function (req, res) {
  req.logout();
  res.json({ status: 200 });
});

router.get('/api/auth/user', function (req, res) {
  if (req.isAuthenticated()) {
    res.json({ userid: req.user.userid });
  } else {
    res.status(401).json(null);
  }
});

router.get('/api/page/markup', (req, res) => {
  db.getPage(req.query.pageid)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      console.error(err);
      res.json({});
    });
});

router.get('/api/page/history', (req, res) => {
  db.getPageHistory(req.query.pageid, req.query.offset, req.query.limit)
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

router.get('/api/page', (req, res) => {
  db.getPage(req.query.pageid)
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

router.post('/api/page', (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json();
  } else {
    db.upsertPage(
      req.query.pageid,
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

router.get('*', (req, res) => {
  fs.readFile(
    path.join(__dirname, `${VIEW_DIR}/index.html`),
    'utf8',
    (err, data) => {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      data = data.replace(/\(BASEPATH\)/g, `'${BASEPATH}'`);
      data = data.replace(/\(WIKINAME\)/g, `'${WIKINAME}'`);
      data = data.replace(/\/build\//g, `${BASEPATH}build/`);
      res.send(data);
    },
  );
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}${BASEPATH}`);
});
