var express = require('express');
var router = express.Router();
const { spawn } = require('child_process');
const validate = require('../helpers/git_hub_auth.mjs');

router.post('/push', function(req, res, next) {
  const body = req.body
  const sig = req.headers['x-hub-signature']
  if (sig === undefined) {
    console.log('WARNING: NO x-hub-signature header included.')
    res.status(400).send({});
    return;
  }
  const secret = process.env.PULL_X_HUB_SECRET
  const truth = validate.compareSignature(sig, validate.generateXHubSignature(body, secret))
  if (truth === false) {
    console.log('WARNING: SIG PROVIDED BUT IS INCORRECT-- SOMEONE MAY BE TRYING TO SPOOF')
    res.status(400).send({});
    return;
  }

  if (body.ref === 'refs/heads/master') {
    console.log('PULLING LATEST FROM MASTER')
    let exec = spawn('sh', ['push.sh'], { cwd: './scripts/'})
  }
  res.status(204).send({});
  return;
});


module.exports = router;