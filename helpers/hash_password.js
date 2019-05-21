const crypto = require('crypto')

function encrypt(password, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(password);
  return hmac.digest('hex');
}

function validatePassword(password, secret, trueHash) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(password);
  const testHash = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(trueHash), Buffer.from(testHash));
}

module.exports = {
  encrypt: encrypt,
  validatePassword: validatePassword
}