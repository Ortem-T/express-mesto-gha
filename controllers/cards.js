const Card = require('../models/card');

const BadRequestErr = require('../errors/BadRequestErr_400');
const NotFoundErr = require('../errors/NotFoundErr_404');
const ForbiddenErr = require('../errors/ForbiddenErr_403');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr('Переданы некорректные данные.'));
      }
      return next(err);
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundErr('Карточка не найдена'));
      }
      if (card.owner.toString() !== req.user._id) {
        return next(new ForbiddenErr('Это чужая карточка!'));
      }
      return card.remove();
    })
    .then(() => res.send({ message: 'Карточка удалена' }))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundErr('Карточка не найдена'));
      }
      return res.send({ data: card });
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundErr('Карточка не найдена'));
      }
      return res.send({ data: card });
    })
    .catch(next);
};
