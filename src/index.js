const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username );

  if(!user) {
    return response.status(404).json({error: "User not exists!"});
  }

  request.user = user;
  return next();
}

function checksExistsUserTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find( todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "To Do not found!"})
  }

  request.todo = todo;
  // console.log(todo);

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find( user => user.username === username );

  if(userExists) {
    return response.status(400).json({error: "User already exists."});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request; 

  todo.title = title;
  todo.deadline = deadline
  console.log(todo);
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { todo } = request;
  todo.done = !todo.done;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (request, response) => {
  const { user } = request;
  const { todo } = request;

  const todoIndex = user.todos.findIndex( todos => todos.id === todo.id);

  user.todos.splice(todoIndex, 1);

  return response.status(204).end();
});

module.exports = app;