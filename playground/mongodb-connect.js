// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Received an error when connecting to MongoDB server');
  }
  console.log('Connection to MongoDB successful');

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: 'False',
  //   key: 'Values'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to insert todo', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  // db.collection('Users').insertOne({
  //   name: 'Ryan',
  //   age: 26,
  //   location: 'New York'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to add to document to Users collection', err);
  //   }
  //   console.log(result.ops[0]._id.getTimestamp());
  // });

  db.close();
});
