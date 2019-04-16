import { END } from '../../src'
import proc from '../../src/internal/proc'
import { deferred, arrayOfDeffered } from '../../src/utils'
import * as io from '../../src/effects'

test('processor array of effects handling', done => {
  expect.assertions(1)

  let actual
  const def = deferred()

  let cpsCb = {}
  const cps = (val, cb) => (cpsCb = { val, cb })

  const input = cb => {
    Promise.resolve(1)
      .then(() => def.resolve(1))
      .then(() => cpsCb.cb(null, cpsCb.val))
      .then(() => cb({ type: 'action' }))
    return () => {}
  }

  function* genFn() {
    actual = yield io.all([def.promise, io.cps(cps, 2), io.take('action')])
  }

  proc(genFn(), input).done.catch(err => done.fail(err))

  const expected = [1, 2, { type: 'action' }]

  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test('processor empty array', done => {
  expect.assertions(1)

  let actual

  const input = () => {
    return () => {}
  }

  function* genFn() {
    actual = yield io.all([])
  }

  proc(genFn(), input).done.catch(err => done.fail(err))

  const expected = []

  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test('processor array of effect: handling errors', done => {
  expect.assertions(1)

  let actual
  const defs = arrayOfDeffered(2)

  Promise.resolve(1).then(() => defs[0].reject('error')).then(() => defs[1].resolve(1))

  function* genFn() {
    try {
      actual = yield io.all([defs[0].promise, defs[1].promise])
    } catch (err) {
      actual = [err]
    }
  }

  proc(genFn()).done.catch(err => done.fail(err))

  const expected = ['error']

  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  })
})

test('processor array of effect: handling END', done => {
  expect.assertions(1)

  let actual
  const def = deferred()
  const input = cb => {
    Promise.resolve(1).then(() => def.resolve(1)).then(() => cb(END))

    return () => {}
  }

  function* genFn() {
    try {
      actual = yield io.all([def.promise, io.take('action')])
    } finally {
      actual = 'end'
    }
  }

  proc(genFn(), input).done.catch(err => done.fail(err))

  setTimeout(() => {
    expect(actual).toEqual('end')
    done()
  })
})

test('processor array of effect: named effects', done => {
  expect.assertions(1)

  let actual
  const def = deferred()
  const input = cb => {
    Promise.resolve(1).then(() => def.resolve(1)).then(() => cb({ type: 'action' }))

    return () => {}
  }

  function* genFn() {
    actual = yield io.all({
      ac: io.take('action'),
      prom: def.promise,
    })
  }

  proc(genFn(), input).done.catch(err => done.fail(err))

  setTimeout(() => {
    const expected = { ac: { type: 'action' }, prom: 1 }
    expect(actual).toEqual(expected)
    done()
  })
})
