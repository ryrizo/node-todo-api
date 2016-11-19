const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');
//
// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// Todo.findOneAndRemove({_id: '5830d38d5b74a1d15f10a366'})
// Todo.findByIdAndRemove

Todo.findByIdAndRemove('5830d38d5b74a1d15f10a366').then((todo) => {
  console.log(todo);
});
