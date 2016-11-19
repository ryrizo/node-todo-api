const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '58308b84c8f06794273d9b8e';

if (!ObjectID.isValid(id)) {
  return console.log('ID not valid');
}

User.findById(id).then((user) => { // 3 Promise cases, success, error, catch exceptions
  if (!user) {
    return console.log('Unable to find user');
  }
  console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
  console.log('Unable to find user', e);
}).catch((e) => console.log(e));

// var id = 'a5830ad14496704e02ab87b1f'; //id of one document
//
// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

//returns an array of docs even if just one
// Todo.find({
//   _id: id //Mongoose will automatically cast this to the objectID format
// }).then((todos) => {
//   console.log('Todos', todos);
// }).catch((e) => console.log(e));
//
// //find one will only return the first doc
// Todo.findOne({
//   _id: id //Mongoose will automatically cast this to the objectID format
// }).then((todo) => {
//   console.log('Todo', todo);
// }).catch((e) => console.log(e));

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found');
//   }
//   console.log('Todo By Id', todo);
// }).catch((e) => console.log(e));
