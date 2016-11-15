// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Received an error when connecting to MongoDB server');
  }
  console.log('Connection to MongoDB successful');

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('582a67323314ab07f0f0161e')
  }, {
    $set: { //$set is a mongo update operator
      name: 'Ryan'
    },
    $inc: {
      age: 1
    }
  }, {
      returnOriginal: false
    }).then((result) => {
    console.log(result);
  });

});
