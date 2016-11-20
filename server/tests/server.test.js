const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: "First test todo"
}, {
  _id: new ObjectID(),
  text: "Second test todo",
  completed: true,
  completedAt: 333
}];

//testing lifecycle method
beforeEach((done) => { //before each test do this, clears database.
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

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
