const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '62f7ac76e95fa59447acd036',
  };

  next();
});

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Что-то пошло не так!' });
});

app.listen(PORT);
