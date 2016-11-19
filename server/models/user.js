var mongoose = require('mongoose'); //just making models don't need preconfigured mongoose

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
});

module.exports = {User};
