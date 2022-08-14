const Card = require('../models/card');

const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: 'Переданы некорректные данные.',
        });
      }
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Ошибка' });
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: 'Переданы некорректные данные.',
        });
      }
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Ошибка' });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(() => res.status(200).send({ message: 'Карточка удалена' }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: 'Карточка с указанным _id не найдена.',
        });
      }
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка с указанным _id не существует' });
      }
      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: 'Переданы некорректные данные.',
        });
      }
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card === null) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка с указанным _id не существует' });
      }
      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({
          message: 'Переданы некорректные данные.',
        });
      }
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Ошибка' });
    });
};
