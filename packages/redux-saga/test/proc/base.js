import proc, { NOT_ITERATOR_ERROR } from '../../src/internal/proc'
import { is } from '../../src/utils'
import * as io from '../../src/effects'

const DELAY = 50
const last = arr => arr[arr.length - 1]
const dropRight = (n, arr) => {
  const copy = [...arr]
  while (n > 0) {
    copy.length = copy.length - 1
    n--
  }
  return copy
}

test('proc input', () => {
  expect.assertions(1)

  try {
    proc({})
  } catch (error) {
    expect(error.message).toBe(NOT_ITERATOR_ERROR)
  }

  try {
    proc((function*() {})())
  } catch (error) {
    expect('proc must not throw if provided with an iterable').toBe(1)
  }
})

test('proc iteration', () => {
  expect.assertions(4)

  let actual = []

  function* genFn() {
    actual.push(yield 1)
    actual.push(yield 2)
    return 3
  }

  const iterator = genFn()
  const endP = proc(iterator).done.catch(err => done.fail(err))
  expect(is.promise(endP)).toBe(true)

  endP.then(res => {
    expect(iterator._isRunning).toBe(false)
    expect(res).toBe(3)
    expect(actual).toEqual([1, 2])
  })
})

test('proc error handling', () => {
  expect.assertions(2)

  function fnThrow() {
    throw 'error'
  }

  /*
    throw
  */
  function* genThrow() {
    fnThrow()
  }

  proc(genThrow()).done.then(
    () => expect('proc must return a rejected promise if generator throws an uncaught error').toBe(1),
    err => expect(err).toBe('error'),
  )

  /*
    try + catch + finally
  */
  let actual = []
  function* genFinally() {
    try {
      fnThrow()
      actual.push('unerachable')
    } catch (error) {
      actual.push('caught-' + error)
    } finally {
      actual.push('finally')
    }
  }

  proc(genFinally()).done.then(
    () =>
      (expect(actual).toEqual(['caught-error', 'finally'])),
    () => expect('proc must route to catch/finally blocks in the generator').toBe(1),
  )
})

test('processor output handling', done => {
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
  }, DELAY)
})

test('processor yielded falsy values', (done) => {
  expect.assertions(2)

  let actual = []

  function* genFn() {
    actual.push(yield false)
    actual.push(yield undefined)
    actual.push(yield null)
    actual.push(yield '')
    actual.push(yield 0)
    actual.push(yield NaN)
  }

  proc(genFn()).done.catch(err => done.fail(err))

  const expected = [false, undefined, null, '', 0, NaN]
  setTimeout(() => {
    expect(isNaN(last(expected))).toBeTruthy()
    expect(dropRight(1, actual)).toEqual(dropRight(1, expected))
    done()
  }, DELAY)
})
