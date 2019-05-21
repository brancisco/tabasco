const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const validate = require('../helpers/git_hub_auth.mjs');
const passHasher = require('../helpers/hash_password.js');

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
  if (!passHasher.validatePassword(pass, process.env.LOGIN_SECRET, process.env.LOGIN_PASS_HASH)) {
    res.status(401).send({});
    return;
  }
  else {
    if (uname === process.env.LOGIN_UNAME)
    res.status(200).send({
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
    });
    return;
  }
});


module.exports = router;
