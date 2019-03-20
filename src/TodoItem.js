import React from 'react'
import classNames from 'classnames'

const ESCAPE_KEY = 27
const ENTER_KEY = 13


export default class TodoItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      editText: this.props.todo.title
    }

    this.editField = React.createRef()
  }

	handleSubmit = event => {
    const { onDestroy, onSave } = this.props
		var val = this.state.editText.trim()
		if (val) {
			onSave(val)
			this.setState({editText: val})
		} else {
			onDestroy()
		}
	}

	handleEdit = () => {
    const { onEdit, todo } = this.props
		onEdit()
		this.setState({editText: todo.title})
	}

	handleKeyDown = event => {
    const { onCancel, todo } = this.props
		if (event.which === ESCAPE_KEY) {
			this.setState({editText: todo.title})
			onCancel(event)
		} else if (event.which === ENTER_KEY) {
			this.handleSubmit(event)
		}
	}

	handleChange = event => {
		if (this.props.editing) {
			this.setState({editText: event.target.value})
		}
	}

	/**
	 * This is a completely optional performance enhancement that you can
	 * implement on any React component. If you were to delete this method
	 * the app would still work correctly (and still be very performant!), we
	 * just use it as an example of how little code it takes to get an order
	 * of magnitude performance improvement.
	 */
	shouldComponentUpdate = (nextProps, nextState) => {
		return (
			nextProps.todo !== this.props.todo ||
			nextProps.editing !== this.props.editing ||
			nextState.editText !== this.state.editText
		)
	}

	/**
	 * Safely manipulate the DOM after updating the state when invoking
	 * `this.props.onEdit()` in the `handleEdit` method above.
	 * For more info refer to notes at https://facebook.github.io/react/docs/component-api.html#setstate
	 * and https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate
	 */
	componentDidUpdate = prevProps => {
		if (!prevProps.editing && this.props.editing) {
			const node = this.editField.current
			node.focus()
			node.setSelectionRange(node.value.length, node.value.length)
		}
	}

	render() {
    const { editing, onDestroy, onToggle, todo } = this.props
    const { editText } = this.state
		return (
			<li className={classNames({
				completed: todo.completed,
				editing,
			})}>
				<div className="view">
					<input
						className="toggle"
						type="checkbox"
						checked={todo.completed}
						onChange={onToggle}
					/>
					<label onDoubleClick={this.handleEdit}>
						{todo.title}
					</label>
					<button className="destroy" onClick={onDestroy} />
				</div>
				<input
					ref={this.editField}
					className="edit"
					value={editText}
					onBlur={this.handleSubmit}
					onChange={this.handleChange}
					onKeyDown={this.handleKeyDown}
				/>
			</li>
		)
	}
}
