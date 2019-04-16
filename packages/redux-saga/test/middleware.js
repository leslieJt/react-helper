import { createStore, applyMiddleware } from 'redux'
import sagaMiddleware from '../src'
import { is } from '../src/utils'
import { takeEvery } from '../src/effects'

test('middleware output', () => {
  const middleware = sagaMiddleware()

  expect(typeof middleware).toBe('function')

  expect(middleware.length).toBe(1)

  const nextHandler = middleware({})

  expect(typeof nextHandler).toBe('function')

  expect(nextHandler.length).toBe(1)

  const actionHandler = nextHandler()

  expect(typeof actionHandler).toBe('function')

  expect(actionHandler.length).toBe(1)
})

test("middleware's action handler output", () => {
  const action = {}
  const actionHandler = sagaMiddleware()({})(action => action)

  expect(actionHandler(action)).toBe(action)
})

test('middleware.run', () => {
  let actual

  function* saga(...args) {
    actual = args
  }

  const middleware = sagaMiddleware()

  try {
    middleware.run(function*() {})
  } catch (e) {
    expect(e instanceof Error).toBeTruthy()
  }

  createStore(() => {}, applyMiddleware(middleware))
  const task = middleware.run(saga, 'argument')

  expect(is.task(task)).toBeTruthy()

  const expected = ['argument']
  expect(actual).toEqual(expected)
})

test('middleware options', () => {
  try {
    sagaMiddleware({ onError: 42 })
  } catch (e) {
    expect(e.message).toBe('`options.onError` passed to the Saga middleware is not a function!')
  }

  const err = new Error('test')
  function* saga() {
    throw err
  }

  let actual
  const expected = err
  const options = { onError: err => (actual = err) }
  const middleware = sagaMiddleware(options)
  createStore(() => {}, applyMiddleware(middleware))
  middleware.run(saga)

  expect(actual).toBe(expected)
})

test("middleware's custom emitter", () => {
  const actual = []

  function* saga() {
    yield takeEvery('*', ac => actual.push(ac.type))
  }

  const middleware = sagaMiddleware({
    emitter: emit => action => {
      if (action.type === 'batch') {
        action.batch.forEach(emit)
        return
      }
      emit(action)
    },
  })

  const store = createStore(() => {}, applyMiddleware(middleware))
  middleware.run(saga)

  store.dispatch({ type: 'a' })
  store.dispatch({
    type: 'batch',
    batch: [{ type: 'b' }, { type: 'c' }, { type: 'd' }],
  })
  store.dispatch({ type: 'e' })

  const expected = ['a', 'b', 'c', 'd', 'e']

  expect(actual).toEqual(expected)
})
