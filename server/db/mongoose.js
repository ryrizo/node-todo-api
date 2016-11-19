var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // tells mongoose to use built in Promise
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
