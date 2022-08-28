const jwt = require('jsonwebtoken');
const AuthErr = require('../errors/AuthErr_401');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    throw new AuthErr('Необходима авторизация');
  }

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    throw new AuthErr('Необходима авторизация');
  }

  req.user = payload;
  next();
};
