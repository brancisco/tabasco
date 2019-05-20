const crypto = require('crypto');

module.exports = {
  generateXHubSignature: function (body, secret) {
    const hmac = crypto.createHmac('sha1', secret);
    const sig = hmac.update(JSON.stringify(body)).digest('hex');
    return `sha1=${sig}`
  },
  compareSignature: function (sig, gen_sig) {
    console.log(sig)
    const source = Buffer.from(sig);
    const comparison = Buffer.from(gen_sig);
    console.log(source);
    console.log(comparison);
    return crypto.timingSafeEqual(source, comparison);
  }
}