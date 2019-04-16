import lolex from 'lolex'
import sagaMiddleware from '../../src'
import { createStore, applyMiddleware } from 'redux'
import { delay } from '../../src'
import { take, cancel, throttle } from '../../src/effects'

test('throttle', done => {
  const clock = lolex.install()
  expect.assertions(1)

  const actual = []
  const expected = [['a1', 'a2', 0], ['a1', 'a2', 10], ['a1', 'a2', 20], ['a1', 'a2', 30], ['a1', 'a2', 34]]
  const middleware = sagaMiddleware()
  const store = applyMiddleware(middleware)(createStore)(() => {})
  middleware.run(root)

  function* root() {
    const task = yield throttle(100, 'ACTION', worker, 'a1', 'a2')
    yield take('CANCEL_WATCHER')
    yield cancel(task)
  }

  function* worker(arg1, arg2, { payload }) {
    actual.push([arg1, arg2, payload])
  }

  const dispatchedActions = []
  for (let i = 0; i < 35; i++) {
    dispatchedActions.push(
      delay(i * 10, i).then(val => store.dispatch({ type: 'ACTION', payload: val })).then(() => clock.tick(10)), // next tick
    )
  }

  Promise.resolve()
    .then(() => clock.tick(1)) // just start for the smallest tick
    .then(() => clock.tick(10)) // tick past first delay

  dispatchedActions[34]
    // wait so traling dispatch gets processed
    .then(() => clock.tick(100))
    .then(() => store.dispatch({ type: 'CANCEL_WATCHER' }))
    // shouldn't be processed cause of geting canceled
    .then(() => store.dispatch({ type: 'ACTION', payload: 40 }))
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
    .catch(err => done.fail(err))
    .then(() => clock.uninstall())
})
