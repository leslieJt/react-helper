import proc from '../../src/internal/proc'
import * as io from '../../src/effects'

const DELAY = 50

test('processor cps call handling', done => {
  expect.assertions(1)

  let actual = []

  function* genFn() {
    try {
      yield io.cps(cb => {
        actual.push('call 1')
        cb('err')
      })
      actual.push('call 2')
    } catch (err) {
      actual.push('call ' + err)
    }
  }

  proc(genFn()).done.catch(err => done.fail(err))

  const expected = ['call 1', 'call err']

  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, DELAY)
})

test('processor synchronous cps failures handling', done => {
  expect.assertions(1)

  let actual = []
  const dispatch = v => actual.push(v)

  function* genFnChild() {
    try {
      yield io.put('startChild')
      yield io.cps(() => {
        throw new Error('child error')
        //cb(null, "Ok")
      })
      yield io.put('success child')
    } catch (e) {
      yield io.put('failure child')
    }
  }

  function* genFnParent() {
    try {
      yield io.put('start parent')
      yield io.call(genFnChild)
      yield io.put('success parent')
    } catch (e) {
      yield io.put('failure parent')
    }
  }

  proc(genFnParent(), undefined, dispatch).done.catch(err => done.fail(err))

  const expected = ['start parent', 'startChild', 'failure child', 'success parent']
  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, DELAY)
})

test('processor cps cancellation handling', done => {
  expect.assertions(1)

  let cancelled = false
  const cpsFn = cb => {
    cb.cancel = () => {
      cancelled = true
    }
  }

  function* genFn() {
    const task = yield io.fork(function*() {
      yield io.cps(cpsFn)
    })
    yield io.cancel(task)
  }

  proc(genFn(), undefined).done
    .then(() => {
      expect(cancelled).toBeTruthy()
      done()
    })
    .catch(err => {
      done.fail(err)
      t.done()
    })
})
