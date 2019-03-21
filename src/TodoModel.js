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

    this.todos.forEach(Object.freeze)
    Object.freeze(this.todos)

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

	async toggleAll(completed) {
    try {
      const toggleJson = this.todos
          .map(({ uid }) => ({ uid, completed }))

      await this.dgraph.newTxn().mutate({
        setJson: toggleJson,
        commitNow: true,
      })
    } catch (error) {
      console.error('Network error', error)
    } finally {
      this.fetchAndInform()
    }

	}

	async toggle(todoToToggle) {
    try {
      await this.dgraph.newTxn().mutate({
        setJson: {
          uid: todoToToggle.uid,
          completed: !todoToToggle.completed,
        },
        commitNow: true,
      })
    } catch (error) {
      console.error('Network error', error)
    } finally {
      this.fetchAndInform()
    }
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

	async save(todoToSave, newTitle) {
    try {
      await this.dgraph.newTxn().mutate({
        setJson: {
          uid: todoToSave.uid,
          title: newTitle,
        },
        commitNow: true,
      })
    } catch (error) {
      console.error('Network error', error)
    } finally {
      this.fetchAndInform()
    }
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
