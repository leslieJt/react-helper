import { createStore, applyMiddleware } from 'redux'
import sagaMiddleware, { detach } from '../../src'
import proc from '../../src/internal/proc'
import * as io from '../../src/effects'

test('proc sync fork failures: functions', done => {
  expect.assertions(1)

  let actual = []

  // NOTE: we'll be forking a function not a Generator
  function immediatelyFailingFork() {
    throw 'immediatelyFailingFork'
  }

  function* genParent() {
    try {
      actual.push('start parent')
      yield io.fork(immediatelyFailingFork)
      actual.push('success parent')
    } catch (e) {
      actual.push('parent caught ' + e)
    }
  }

  function* main() {
    try {
      actual.push('start main')
      yield io.call(genParent)
      actual.push('success main')
    } catch (e) {
      actual.push('main caught ' + e)
    }
  }

  proc(main()).done.catch(err => done.fail(err))

  const expected = ['start main', 'start parent', 'main caught immediatelyFailingFork']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, 0)
})

test('proc sync fork failures: functions/error bubbling', done => {
  expect.assertions(1)

  let actual = []

  // NOTE: we'll be forking a function not a Generator
  function immediatelyFailingFork() {
    throw 'immediatelyFailingFork'
  }

  function* genParent() {
    try {
      actual.push('start parent')
      yield io.fork(immediatelyFailingFork)
      actual.push('success parent')
    } catch (e) {
      actual.push('parent caught ' + e)
    }
  }

  function* main() {
    try {
      actual.push('start main')
      yield io.fork(genParent)
      actual.push('success main')
    } catch (e) {
      actual.push('main caught ' + e)
    }
  }

  proc(main()).done.catch(err => {
    actual.push('uncaught ' + err)
  })

  const expected = ['start main', 'start parent', 'uncaught immediatelyFailingFork']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, 0)
})

test("proc fork's failures: generators", done => {
  expect.assertions(1)

  let actual = []

  function* genChild() {
    throw 'gen error'
  }

  function* genParent() {
    try {
      actual.push('start parent')
      yield io.fork(genChild)
      actual.push('success parent')
    } catch (e) {
      actual.push('parent caught ' + e)
    }
  }

  function* main() {
    try {
      actual.push('start main')
      yield io.call(genParent)
      actual.push('success main')
    } catch (e) {
      actual.push('main caught ' + e)
    }
  }

  proc(main()).done.catch(err => done.fail(err))

  const expected = ['start main', 'start parent', 'main caught gen error']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, 0)
})

test('proc sync fork failures: spawns (detached forks)', done => {
  expect.assertions(1)

  let actual = []

  function* genChild() {
    throw 'gen error'
  }

  function* main() {
    try {
      actual.push('start main')
      const task = yield io.spawn(genChild)
      actual.push('spawn ' + task.name)
      actual.push('success parent')
    } catch (e) {
      actual.push('main caught ' + e)
    }
  }

  proc(main()).done.catch(err => done.fail(err))

  const expected = ['start main', 'spawn genChild', 'success parent']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, 0)
})

test('proc detached forks failures', done => {
  expect.assertions(1)

  const actual = []
  const middleware = sagaMiddleware({ onError: err => actual.push(err) })
  const store = applyMiddleware(middleware)(createStore)(() => {})

  const ACTION_TYPE = 'ACTION_TYPE'
  const ACTION_TYPE2 = 'ACTION_TYPE2'
  const failError = new Error('fail error')

  function willFail(ac) {
    if (!ac.fail) {
      actual.push(ac.i)
      return
    }
    throw failError
  }

  const wontFail = ac => actual.push(ac.i)

  function* saga() {
    yield detach(io.takeEvery(ACTION_TYPE, willFail))
    yield io.takeEvery(ACTION_TYPE2, wontFail)
  }

  middleware.run(saga).done.catch(err => done.fail(err))

  const expected = [0, 1, 2, failError, 4]
  Promise.resolve()
    .then(() => store.dispatch({ type: ACTION_TYPE, i: 0 }))
    .then(() => store.dispatch({ type: ACTION_TYPE, i: 1 }))
    .then(() => store.dispatch({ type: ACTION_TYPE, i: 2 }))
    .then(() => store.dispatch({ type: ACTION_TYPE, i: 3, fail: true }))
    .then(() => store.dispatch({ type: ACTION_TYPE2, i: 4 }))
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
})
