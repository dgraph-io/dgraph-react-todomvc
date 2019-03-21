import Utils from './Utils'

import * as dgraph from 'dgraph-js-http'

export default class TodoModel {
  constructor() {
    const clientStub = new dgraph.DgraphClientStub("http://localhost:8080")
    this.dgraph = new dgraph.DgraphClient(clientStub)

    this.todos = []
    this.fetchAndInform()
  }

  async fetchAndInform() {
    this.todos = await this.fetchTodos()
    this.inform()
  }

  async fetchTodos() {
    const query = `{
      todos(func: has(is_todo))
      {
        uid
        title
        completed
      }
    }`
    const res = await this.dgraph.newTxn().query(query)
    return res.data.todos || []
  }

	onChanges = []

	subscribe = onChange =>
		this.onChanges.push(onChange)

	inform = () => {
		this.onChanges.forEach(cb => cb())
	}

	addTodo = title => {
		this.todos = this.todos.concat({
			uid: 123,
			title: title,
			completed: false,
		})

		this.inform()
	}

	toggleAll = checked => {
		// Note: it's usually better to use immutable data structures since they're
		// easier to reason about and React works very well with them. That's why
		// we use map() and filter() everywhere instead of mutating the array or
		// todo items themselves.
		this.todos = this.todos.map(function (todo) {
			return Utils.extend({}, todo, {completed: checked});
		})

		this.inform()
	}

	toggle = todoToToggle => {
		this.todos = this.todos.map(function (todo) {
			return todo !== todoToToggle ?
				todo :
				Utils.extend({}, todo, {completed: !todo.completed});
		})

		this.inform()
	}

	destroy = todo => {
		this.todos = this.todos.filter(function (candidate) {
			return candidate !== todo;
		})

		this.inform()
	}

	save = (todoToSave, text) => {
		this.todos = this.todos.map(function (todo) {
			return todo !== todoToSave ? todo : Utils.extend({}, todo, {title: text})
		})

		this.inform()
	}

	clearCompleted = () => {
		this.todos = this.todos.filter(todo => !todo.completed)

		this.inform()
	}
}
