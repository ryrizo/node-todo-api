require('./config/config');

const {ObjectID} = require('mongodb');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js'); //destructuring here means only pull the mongoose export from requirement
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());


app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc); // provides user information
  }, (e) => {
    res.status(400).send(e);
  });
});


app.get('/todos', (req, res) =>{
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});


//handling url parameters
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send(); // does a res.send finish the function off?
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }, (e) => {
    res.status(400).send();
  }).catch((e) => res.status(400).send());
});


app.delete('/todos/:id', (req, res) => { //successful promise case
  var id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(400).send(); // id is not valid
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send(); // item was not found/deleted
    }
    res.send({todo});
  }, (e) => {
    res.status(404).send(); // failed promise case
  }).catch((e) => res.status(404).send()); //exception
});


app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(400).send(); // id is not valid
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
      return user.generateAuthToken(); // this returns a promise, so we tack on another then
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    });
});//end post users

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});


app.listen(process.env.PORT, () => {
  console.log(`Started up at port ${process.env.PORT}`);
});
module.exports = {app};
