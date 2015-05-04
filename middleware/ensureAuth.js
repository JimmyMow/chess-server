var checkForAuthentication = function(req, res, next) {
  if( req.isAuthenticated() ) {
    return next();
  } else {
    return res.status(403).end();
  }
};

module.exports = checkForAuthentication;
