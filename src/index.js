const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

    const user = users.find(user => user.username === username)

    if(!user){
        response.status(404).json({ error: 'User not found' })
    }

    request.user = user

    return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userAlreadyExist = users.find(user => user.username === username)

  if(userAlreadyExist){
    return response.status(400).json({ error: 'User already exists' })
  } else{
    users.push(user)
    response.status(201).send(user)
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  response.send(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  request.user.todos.push(task)

  response.status(201).json(task)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = user.todos.find(task => task.id === request.params.id)
  
  if(!todo){
    response.status(404).json({ error: 'Task not found '})
  } else{
    todo.title = title
    todo.deadline = new Date(deadline)
    response.status(201).json(todo)
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const todo = user.todos.find(task => task.id === request.params.id)
  
  if(!todo){
    response.status(404).json({ error: 'Task not found '})
  } else{
    todo.done = true
    response.status(201).json(todo)
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const todo = user.todos.find(task => task.id === request.params.id)
  
  if(!todo){
    response.status(404).json({ error: 'Task not found '})
  } else{
    user.todos.splice(todo, 1)
    response.status(204).end()
  }
});

module.exports = app;