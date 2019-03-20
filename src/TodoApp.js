import React from 'react'
import { createBrowserHistory } from 'history'

import defs from './defs'
import TodoFooter from './TodoFooter'
import TodoItem from './TodoItem'

const ENTER_KEY = 13
const history = createBrowserHistory()

export default class TodoApp extends React.Component {
  state = {
    nowShowing: defs.ALL_TODOS,
    editing: null,
    newTodo: '',
  }

  componentDidMount() {
    const setNowShowingFn = nowShowing => () => this.setState({ nowShowing })

    const routes = {
      '/': setNowShowingFn(defs.ALL_TODOS),
      '/active': setNowShowingFn(defs.ACTIVE_TODOS),
      '/completed': setNowShowingFn(defs.COMPLETED_TODOS),
    }

    const processLocationHash = hash => {
      if (hash) {
        hash = hash.substring(1)
      }
      const route = routes[hash] || routes['/']
      route()
    }

    processLocationHash(history.location.hash)

    history.listen((location, action) =>
      processLocationHash(location.hash)
    )
  }

  handleChange = event =>
    this.setState({ newTodo: event.target.value })

  handleNewTodoKeyDown = event => {
    if (event.keyCode !== ENTER_KEY) {
      return
    }

    event.preventDefault()

    const val = this.state.newTodo.trim()

    if (val) {
      this.props.model.addTodo(val)
      this.setState({ newTodo: '' })
    }
  }

  toggleAll = event => {
    const checked = event.target.checked
    this.props.model.toggleAll(checked)
  }

  toggle = todoToToggle =>
    this.props.model.toggle(todoToToggle)

  destroy = todo =>
    this.props.model.destroy(todo)

  edit = todo =>
    this.setState({ editing: todo.id })

  save = (todoToSave, text) => {
    this.props.model.save(todoToSave, text)
    this.setState({ editing: null })
  }

  cancel = () =>
    this.setState({ editing: null })

  clearCompleted = () =>
    this.props.model.clearCompleted()

  render() {
    const { todos } = this.props.model
    const { editing, newTodo } = this.state

    const shownTodos = todos.filter(todo => {
      switch (this.state.nowShowing) {
        case defs.ACTIVE_TODOS:
          return !todo.completed
        case defs.COMPLETED_TODOS:
          return todo.completed
        default:
          return true
      }
    })

    const todoItems = shownTodos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onToggle={() => this.toggle(todo)}
        onDestroy={() => this.destroy(todo)}
        onEdit={() => this.edit(todo)}
        editing={editing === todo.id}
        onSave={text => this.save(todo, text)}
        onCancel={this.cancel}
      />
    ))

    const activeTodoCount = todos.reduce(function (accum, todo) {
      return todo.completed ? accum : accum + 1
    }, 0)

    const completedCount = todos.length - activeTodoCount

    const footer = (activeTodoCount || completedCount)
      ? <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={this.state.nowShowing}
          onClearCompleted={this.clearCompleted}
        />
      : null

    const main = !todos.length
      ? null
      : (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll}
            checked={activeTodoCount === 0}
          />
          <label
            htmlFor="toggle-all"
          />
          <ul className="todo-list">
            {todoItems}
          </ul>
        </section>
      )

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={newTodo}
            onKeyDown={this.handleNewTodoKeyDown}
            onChange={this.handleChange}
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
      </div>
    )
  }
}
