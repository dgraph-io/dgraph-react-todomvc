import React from 'react'
import ReactDOM from 'react-dom'
import 'todomvc-app-css/index.css'

import TodoApp from './TodoApp'
import TodoModel from './TodoModel'

const model = new TodoModel('react-todos')

function render() {
  ReactDOM.render(
    <TodoApp model={model}/>,
    document.getElementById('root'),
  )
}

model.subscribe(render)
render()
