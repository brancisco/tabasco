var express = require('express');
var router = express.Router();
const pug = require('pug');
const Blog = require('../models/blog.js'); 

const ajaxURL = 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js';

router.get('/login', function(req, res, next) {
  res.render('login', {
    name: 'login',
    imp_style: [{ href: '/stylesheets/login.css' }],
    imp_js: [
      { src: ajaxURL },
      { type: 'text/javascript', src: '/js/login.js'},
    ],
    data: {
      loggedIn: req.tabascoLoginSession.username
    }
  });
});

router.get('/dashboard', function(req, res, next) {
  if (req.tabascoLoginSession.username != process.env.LOGIN_UNAME) {
    return res.redirect(401, '/admin/login');
  }
  res.render('dashboard', {
    name: 'Admin Dashboard',
    imp_style: [
      { href: '/stylesheets/main.css' }
    ],
    imp_js: [
      { src: ajaxURL },
      { type: 'text/javascript', src: '/js/admin-dashboard.js' }
    ]
  });
});

router.get('/post-editor/:ptype(blogs|projects)/:slug', function(req, res, next) {
  if (req.tabascoLoginSession.username != process.env.LOGIN_UNAME) {
    return res.redirect(401, '/admin/login');
  }
  res.render('post-editor', {
    name: 'Admin Post Editor',
    imp_style: [
      { href: '/stylesheets/post-editor.css' }
    ],
    imp_js: [
      { src: ajaxURL },
      { type: 'text/javascript', src: '/js/post-editor.js' }
    ]
  });
});

module.exports = router;
