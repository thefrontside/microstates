import { createStore, combineReducers } from 'redux'
import { createSelector } from 'reselect'

const ADD_TODO = 'ADD_TODO'
const DELETE_TODO = 'DELETE_TODO'
const EDIT_TODO = 'EDIT_TODO'
const COMPLETE_TODO = 'COMPLETE_TODO'
const COMPLETE_ALL_TODOS = 'COMPLETE_ALL_TODOS'
const CLEAR_COMPLETED = 'CLEAR_COMPLETED'
const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'
const SHOW_ALL = 'show_all'
const SHOW_COMPLETED = 'show_completed'
const SHOW_ACTIVE = 'show_active'

const addTodo = text => ({ type: ADD_TODO, text })
const deleteTodo = id => ({ type: DELETE_TODO, id })
const editTodo = (id, text) => ({ type: EDIT_TODO, id, text })
const completeTodo = id => ({ type: COMPLETE_TODO, id })
const completeAllTodos = () => ({ type: COMPLETE_ALL_TODOS })
const clearCompleted = () => ({ type: CLEAR_COMPLETED })
const setVisibilityFilter = filter => ({ type: SET_VISIBILITY_FILTER, filter })

const getVisibilityFilter = state => state.visibilityFilter
const getTodos = state => state.todos

const visibilityFilter = (state = SHOW_ALL, action) => {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

const getVisibleTodos = createSelector(
  [getVisibilityFilter, getTodos],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case SHOW_ALL:
        return todos
      case SHOW_COMPLETED:
        return todos.filter(t => t.completed)
      case SHOW_ACTIVE:
        return todos.filter(t => !t.completed)
      default:
        throw new Error('Unknown filter: ' + visibilityFilter)
    }
  }
)

const getCompletedTodoCount = createSelector(
  [getTodos],
  todos => (
    todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count,
      0
    )
  )
)

const initialState = [
  {
    text: 'Use Redux',
    completed: false,
    id: 0
  }
]

function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
          completed: false,
          text: action.text
        }
      ]

    case DELETE_TODO:
      return state.filter(todo =>
        todo.id !== action.id
      )

    case EDIT_TODO:
      return state.map(todo =>
        todo.id === action.id ?
          { ...todo, text: action.text } :
          todo
      )

    case COMPLETE_TODO:
      return state.map(todo =>
        todo.id === action.id ?
          { ...todo, completed: !todo.completed } :
          todo
      )

    case COMPLETE_ALL_TODOS:
      const areAllMarked = state.every(todo => todo.completed)
      return state.map(todo => ({
        ...todo,
        completed: !areAllMarked
      }))

    case CLEAR_COMPLETED:
      return state.filter(todo => todo.completed === false)

    default:
      return state
  }
}

const rootReducer = combineReducers({
  todos,
  visibilityFilter
});

const store = createStore(rootReducer)