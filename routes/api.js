var express = require('express');
var router = express.Router();
const { spawn } = require('child_process');
const validate = require('../helpers/git_hub_auth.mjs');

router.post('/push', function(req, res, next) {
  const body = req.body
  const sig = req.headers['x-github-event']
  if (sig === undefined) {
    res.status(400).send({});
    return;
  }
  const secret = process.env.PULL_X_HUB_SECRET
  const truth = validate.compareSignature(sig, validate.generateXHubSignature(body, secret))
  if (truth === true) {
    console.log(body.ref)
    let exec = spawn('sh', ['push.sh'], { cwd: './scripts/'})
    res.status(204).send({});
    return;
  }
  else {
    console.log('NOT A VALID SECRET OR BODY.. SOMEONE MAY BE TRYING TO SPOOF')
    res.status(404).send({});
    return;
  }
});


module.exports = router;