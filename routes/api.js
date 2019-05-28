const express = require('express');
const pug = require('pug');
const router = express.Router();
const { spawn } = require('child_process');
const validate = require('../helpers/git_hub_auth.mjs');
const passHasher = require('../helpers/hash_password.js');
const Blog = require('../models/blog.js');

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

function getHost(req) {
  return `${req.protocol}://${req.headers.host}`
}

router.post('/push', function(req, res, next) {
  const body = req.body;
  let truth;
  if (process.env.NODE_ENV != 'development') {
    const sig = req.headers['x-hub-signature'];
    if (sig === undefined) {
      console.log('WARNING: NO x-hub-signature header included.');
      res.status(400).send({});
      return;
    }
    const secret = process.env.PULL_X_HUB_SECRET;
    truth = validate.compareSignature(
        sig, 
        validate.generateXHubSignature(body, secret)
    );
  }
  else {
    truth = true;
  }
  if (truth === false) {
    console.log('WARNING: SIG PROVIDED BUT IS INCORRECT-- SOMEONE MAY BE TRYING TO SPOOF');
    res.status(400).send({});
  }
  else {
    if (process.env.NODE_ENV === 'development') {
      res.status(200).send(body);
    }
    else if (body.ref) {
      if (body.ref === 'refs/heads/master' && process.env.NODE_ENV === 'production') {
        console.log('PULLING LATEST FROM MASTER --reason push');
        spawn('bash', ['./scripts/push.sh', 'master', process.env.NODE_ENV]);
      }
      if (body.ref === 'refs/heads/staging' && process.env.NODE_ENV === 'staging') {
        console.log('PULLING LATEST FROM STAGING --reason push');
        spawn('bash', ['./scripts/push.sh', 'staging', process.env.NODE_ENV]);
      }
    }
    else if (body.pull_request) {
      if (body.pull_request.base.ref === 'master' && body.action === 'closed' &&
          body.pull_request.merged === true && process.env.NODE_ENV === 'production') {
        console.log('PULLING LATEST FROM MASTER --reason pull request');
        spawn('bash', ['./scripts/push.sh', 'master', process.env.NODE_ENV]);
      }
      if (body.pull_request.base.ref === 'staging' && body.action === 'closed' &&
          body.pull_request.merged === true && process.env.NODE_ENV === 'staging') {
        console.log('PULLING LATEST FROM STAGING --reason pull request');
        spawn('bash', ['./scripts/push.sh', 'staging', process.env.NODE_ENV]);
      }
    }
    res.status(204).send({});
  }
});

router.post('/login', function(req, res, next) {
  const uname = req.body.username;
  const pass = req.body.password;
  let data = {
    message: 'Logged in as "$"',
    username: undefined,
    _links: {
      self: { href: '/login' },
      admin: [
        {
          title: 'Dashboard',
          href: '/admin/dashboard'
        },
        {
          title: 'Blog Editor',
          href: '/admin/blog-editor'
        }
      ]
    }
  }
  if (req.tabascoLoginSession.username) {
    data.username = req.tabascoLoginSession.username
    res.status(200).send(data)
    return;
  }
  else if (!passHasher.validatePassword(pass, process.env.LOGIN_SECRET, process.env.LOGIN_PASS_HASH)) {
    res.status(401).send({});
    return;
  }
  else {
    if (uname === process.env.LOGIN_UNAME)
    req.tabascoLoginSession.username = uname;
    data.username = req.tabascoLoginSession.username
    res.status(200).send(data);
    return;
  }
});

router.post('/logout', function(req, res, next) {
  req.tabascoLoginSession.reset();
  res.status(204).send({});
});

router.get('/:ptype(posts|blogs|projects)', function(req, res, next) {
  const blog = new Blog(connection);
  const postMap = {posts: -1, blogs: 0, projects: 1};
  const uriMap = ['blog-post', 'project-page'];
  const typeMap = ['blog', 'project'];
  blog.previews({
    direction: 'DESC',
    type: postMap[req.params.ptype] // type: -1=all, 0=blog, 1=project
  },
  function (previews) {
    previews.map((preview) => {
      preview._links = {
        self: { href: `${getHost(req)}/api/${req.params.ptype}/${preview.slug}` },
        post_page: { href: `${getHost(req)}/${uriMap[preview.type]}/${preview.slug}` }
      };
      preview.type = typeMap[preview.type];
      return preview;
    });
    res.status(200).json({
      _links: {
        self: `${getHost(req)}/api/${req.params.ptype}`
      },
      _embedded: {
        [req.params.ptype]: previews
      }
    });
  });

});

router.get('/:ptype(blogs|projects)/:slug', function(req, res, next) {
  const blog = new Blog(connection);
  const postMap = {posts: -1, blogs: 0, projects: 1};
  blog.article(req.params.slug, postMap[req.params.ptype],
  function (article) {
    res.status(200).json({
      _links: {
        self: `${getHost(req)}/api/${req.params.ptype}/${article.slug}`
      },
      ...article
    });
  });
});

router.put('/:ptype(blogs|projects)/:slug', function(req, res, next) {
  const blog = new Blog(connection);
  const postMap = {posts: -1, blogs: 0, projects: 1};
  blog.update(req.params.slug, postMap[req.params.ptype],
    req.body,
    function (article) {
      res.status(200).json({
        _links: {
          self: `${getHost(req)}/api/${req.params.ptype}/${article.slug}`
        },
        ...article
      });
    }
  );
});

router.post('/preview-generator', function(req, res, next) {
  res.render('post-preview', {
    article: {
      title: req.body.title,
      style: req.body.style,
      cover_img_link: req.body.cover_img_link,
      content: pug.render(req.body.content)
    }
  });
});

module.exports = router;
