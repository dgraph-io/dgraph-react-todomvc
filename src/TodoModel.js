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

  async addTodo(title) {
    try {
      const res = await this.dgraph.newTxn().mutate({
        setJson: {
          uid: "_:newTodo",
          is_todo: true,
          title,
          completed: false,
        },
        commitNow: true,
      })

      console.info('Created new todo with uid', res.data.uids.newTodo)
    } catch (error) {
      alert('Database write failed!')
      console.error('Network error', error)
    } finally {
      this.fetchAndInform()
    }
	}

	toggleAll = checked => {
		// Note: it's usually better to use immutable data structures since they're
		// easier to reason about and React works very well with them. That's why
		// we use map() and filter() everywhere instead of mutating the array or
		// todo items themselves.
		this.todos = this.todos.map(function (todo) {
			return Object.assign({}, todo, {completed: checked});
		})

		this.inform()
	}

	toggle = todoToToggle => {
		this.todos = this.todos.map(function (todo) {
			return todo !== todoToToggle ?
				todo :
				Object.assign({}, todo, {completed: !todo.completed});
		})

		this.inform()
	}

  async destroy(todo) {
    try {
      await this.dgraph.newTxn().mutate({
        deleteJson: {
          uid: todo.uid
        },
        commitNow: true,
      })
    } catch (error) {
      alert('Database write failed!')
      console.error('Network error', error)
    } finally {
      this.fetchAndInform()
    }
	}

	save = (todoToSave, text) => {
		this.todos = this.todos.map(function (todo) {
			return todo !== todoToSave ? todo : Object.assign({}, todo, {title: text})
		})

		this.inform()
	}

	async clearCompleted() {
    try {
      const uidsToDelete = this.todos
          .filter(({ completed }) => completed)
          .map(({ uid }) => ({ uid }))

      await this.dgraph.newTxn().mutate({
        deleteJson: uidsToDelete,
        commitNow: true,
      })
    } catch (error) {
      alert('Database write failed!')
      console.error('Network error', error)
    } finally {
      this.fetchAndInform()
    }
	}
}
