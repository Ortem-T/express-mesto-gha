const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthErr = require('../errors/AuthErr_401');
const BadRequestErr = require('../errors/BadRequestErr_400');
const ConflictErr = require('../errors/ConflictErr_409');
const NotFoundErr = require('../errors/NotFoundErr_404');
const { SALT_ROUNDS } = require('../utils/constants');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user === null) {
        return next(new NotFoundErr(`Пользователь с id: ${req.user._id} не найден.`));
      }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestErr('Переданы некорректные данные.'));
      }
      return next(err);
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    if (!user) {
      return next(new NotFoundErr(`Пользователь с id: ${req.user._id} не найден.`));
    }

    return res.send(user);
  })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if (err) {
      return next(err);
    }
    return User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(201).send(
        {
          _id: user._id,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
        },
      ))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          next(new BadRequestErr('Переданы некорректные данные.'));
        } else if (error.name === 'MongoServerError' && error.code === 11000) {
          next(new ConflictErr('Такой пользователь уже существует!'));
        } else {
          next(error);
        }
      });
  });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr('Переданы некорректные данные.'));
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr('Переданы некорректные данные.'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthErr('Неправильные почта или пароль.'));
      }
      return bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return next(new BadRequestErr('Переданы некорректные данные.'));
        } if (!result) {
          return next(new AuthErr('Неправильные почта или пароль.'));
        }
        const token = jwt.sign(
          { _id: user._id },
          'some-secret-key',
          { expiresIn: '7d' },
        );
        return res.cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
        })
          .send({ message: 'Всё верно!' });
      });
    })
    .catch(next);
};
