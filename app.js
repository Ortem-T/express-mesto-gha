const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');

const { PORT = 3000 } = process.env;
const app = express();
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundErr = require('./errors/NotFoundErr_404');
const { regexUrl } = require('./utils/constants');
const { requestLogger, errorLogger } = require('./middlewares/logger');

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(cookieParser());

app.use(requestLogger);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(regexUrl),
    }),
  }),
  createUser,
);

app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use('*', (req, res, next) => {
  next(new NotFoundErr('Указанный роут не существует!'));
});

app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(err.statusCode)
    .send({
      message: statusCode === 500
        ? 'Произошла ошибка на сервере'
        : message,
    });
  next();
});

app.listen(PORT);
