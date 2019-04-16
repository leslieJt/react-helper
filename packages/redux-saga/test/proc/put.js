import { createStore, applyMiddleware } from 'redux'
import proc from '../../src/internal/proc'
import * as io from '../../src/effects'
import * as utils from '../../src/internal/utils'
import { emitter, channel } from '../../src/internal/channel'
import sagaMiddleware from '../../src'
import { namespaceKey } from '../../src/utils'

test('proc put handling', done => {
  expect.assertions(1)

  let actual = []
  const dispatch = v => actual.push(v)

  function* genFn(arg) {
    yield io.put(arg)
    yield io.put(2)
  }

  proc(genFn('arg'), undefined, dispatch).done.catch(err => done.fail(err))

  const expected = ['arg', 2]
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test('proc put in a channel', done => {
  expect.assertions(1)

  const buffer = []
  const spyBuffer = {
    isEmpty: () => !buffer.length,
    put: it => buffer.push(it),
    take: () => buffer.shift(),
  }
  const chan = channel(spyBuffer)

  function* genFn(arg) {
    yield io.put(chan, arg)
    yield io.put(chan, 2)
  }

  proc(genFn('arg')).done.catch(err => done.fail(err))

  const expected = ['arg', 2]
  setTimeout(() => {
    expect(buffer).toEqual(expected)
    done()
  })
})

test("proc async put's response handling", done => {
  expect.assertions(1)

  let actual = []
  const dispatch = v => Promise.resolve(v)

  function* genFn(arg) {
    actual.push(yield io.put.resolve(arg))
    actual.push(yield io.put.resolve(2))
  }

  proc(genFn('arg'), undefined, dispatch).done.catch(err => done.fail(err))

  const expected = ['arg', 2]
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test("proc error put's response handling", done => {
  expect.assertions(1)

  let actual = []
  const dispatch = v => {
    throw 'error ' + v
  }

  function* genFn(arg) {
    try {
      yield io.put(arg)
      actual.push('put resume')
    } catch (err) {
      actual.push(err)
    }
  }

  proc(genFn('arg'), undefined, dispatch).done.catch(err => done.fail(err))

  const expected = ['put resume']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test("proc error put.resolve's response handling", done => {
  expect.assertions(1)

  let actual = []
  const dispatch = v => {
    throw 'error ' + v
  }

  function* genFn(arg) {
    try {
      actual.push(yield io.put.resolve(arg))
    } catch (err) {
      actual.push(err)
    }
  }

  proc(genFn('arg'), undefined, dispatch).done.catch(err => done.fail(err))

  const expected = ['error arg']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test('proc nested puts handling', done => {
  expect.assertions(1)

  let actual = []
  const em = emitter()

  function* genA() {
    yield io.put({ type: 'a' })
    actual.push('put a')
  }

  function* genB() {
    yield io.take('a')
    yield io.put({ type: 'b' })
    actual.push('put b')
  }

  function* root() {
    yield io.fork(genB) // forks genB first to be ready to take before genA starts putting
    yield io.fork(genA)
  }

  proc(root(), em.subscribe, em.emit).done.catch(err => done.fail(err))

  const expected = ['put a', 'put b']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test('puts emitted while dispatching saga need not to cause stack overflow', done => {
  function* root() {
    yield io.put({ type: 'put a lot of actions' })
    yield io.call(utils.delay, 0)
  }

  expect.assertions(1)
  const reducer = (state, action) => action.type
  const middleware = sagaMiddleware({
    emitter: emit => () => {
      for (var i = 0; i < 32768; i++) {
        emit({ type: 'test' })
      }
    },
  })
  const store = createStore(reducer, applyMiddleware(middleware))

  store.subscribe(() => {})

  middleware.run(root)

  setTimeout(() => {
    expect(true).toBeTruthy()
    done()
  })
})

test('puts in the url isolate context should dispatch action contain the url ', (done) => {
  const url = '/a/1'
  const type = Math.random().toString()
  expect.assertions(4)

  function* root() {
    yield io.fork(runner, url + '>>>>')
    yield io.fork(runner, url)
  }
  function* runner(url) {
    yield io.setContext({
      [namespaceKey]: url,
    })
    yield io.fork(page)
    yield new Promise(resolve => setTimeout(resolve, 10))
    yield io.put({ type })
  }
  function* page() {
    const ur = yield io.getContext(namespaceKey)
    const action = yield io.take(type)
    expect(action.hasOwnProperty(namespaceKey)).toBeTruthy()

    expect(action[namespaceKey]).toBe(ur)
  }

  const reducer = (state, action) => action.type
  const middleware = sagaMiddleware()
  const store = createStore(reducer, applyMiddleware(middleware))

  store.subscribe(() => {})

  middleware.run(function* () {
    yield io.call(root)
    done()
  })
})
