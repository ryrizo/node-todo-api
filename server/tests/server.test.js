const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


//testing lifecycle method
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      }) //response based checks
      .end((err, res) => { //end function, return an error if present, do external checks
        if (err) {
          return done(err);
        }
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app) //supertest request
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => { //make a callback end function when doing async stuff
        if (err){
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return 404 if non-object id', (done) => {
    var bad_id = "badbadbad";
    request(app)
      .get(`/todos/${bad_id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var good_id = new ObjectID().toHexString();//changed lsb from f
    request(app)
      .get(`/todos/${good_id}`)
      .expect(404)
      .end(done);
  });

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });
});//end /todos/:id checks

describe('DELETE /todos/:id', () => {
  it('should return 400 if invalid id', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(400)
      .end(done);
  });
  it('should return 404 if todo not found', (done) => {
    var new_id = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${new_id}`)
      .expect(404)
      .end(done);
  });
  it('should remove todo', (done) => {
    var rm_id = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${rm_id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(rm_id);
      }).end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(rm_id).then((todo) =>{
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });
});//end delete /todos/:id

describe('PATCH /todos/:id', () => {
  it('should update todo', (done) => {
    var id = todos[0]._id.toHexString();
    var info = {
      text: "Look at me I changed with patch",
      completed: true
    };
    request(app)
      .patch(`/todos/${id}`)
      .send(info)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(id).then((todo) => {
          if (!todo) {
            return done();
          }
          expect(todo.text).toBe(info.text);
          expect(todo.completedAt).toBeA('number');
          expect(todo.completed).toBe(true);
          done();
        }, (err) => {
          done(err);
        }).catch((e) => done(e));
      });
  });//end of it

  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[1]._id.toHexString();
    var info = {
      text: "Setting to false with patch",
      completed: false
    };
    request(app)
      .patch(`/todos/${id}`)
      .send(info)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(id).then((todo) => {
          if (!todo) {
            return done();
          }
          expect(todo.text).toBe(info.text);
          expect(todo.completedAt).toNotExist();
          expect(todo.completed).toBe(false);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnbsssss!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'blah';
    var password = 'a';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {

    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'password123!'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'incorrectPW'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
