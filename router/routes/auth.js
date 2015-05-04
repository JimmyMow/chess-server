var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var checkForAuthentication = require('../../middleware/ensureAuth');

router.post('/', checkForAuthentication, function(req, res) {
  req.logout();
  return res.send(true);
});

module.exports = router;
