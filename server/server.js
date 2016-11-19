const {ObjectID} = require('mongodb');

var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js'); //destructuring here means only pull the mongoose export from requirement
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000; //if there use it, if local use 3000

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


app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});
module.exports = {app};
