import proc from '../../src/internal/proc'
import { noop } from '../../src/utils'
import * as io from '../../src/effects'

test('proc onError is optional', () => {
  expect.assertions(1)

  const expectedError = new Error('child error')

  function* child() {
    throw expectedError
  }

  function* main() {
    yield io.call(child)
  }

  proc(main(), undefined, noop, noop, undefined, {}).done.catch(err => {
    expect(err).toBe(expectedError)
  })
})

test('proc onError is called for uncaught error', () => {
  expect.assertions(1)

  const expectedError = new Error('child error')

  let actual

  function* child() {
    throw expectedError
  }

  function* main() {
    yield io.call(child)
  }

  proc(main(), undefined, noop, noop, undefined, {
    onError: err => {
      actual = err
    },
  }).done.catch(() => {
    expect(actual).toBe(expectedError)
  })
})

test('proc onError is not called for caught errors', () => {
  expect.assertions(2)

  const expectedError = new Error('child error')

  let actual
  let caught

  function* child() {
    throw expectedError
  }

  function* main() {
    try {
      yield io.call(child)
    } catch (err) {
      caught = err
    }
  }

  proc(main(), undefined, noop, noop, undefined, {
    onError: err => {
      actual = err
    },
  }).done.then(() => {
    expect(actual).toBe(undefined)
    expect(caught).toBe(expectedError)
  })
})
