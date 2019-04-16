import proc from '../../src/internal/proc'
import { is, deferred, arrayOfDeffered } from '../../src/utils'
import * as io from '../../src/effects'

test('proc fork handling: generators', (done) => {
  expect.assertions(4)

  let task, task2

  function* subGen(arg) {
    yield Promise.resolve(1)
    return arg
  }

  class C {
    constructor(val) {
      this.val = val
    }

    *gen() {
      return this.val
    }
  }

  const inst = new C(2)

  function* genFn() {
    task = yield io.fork(subGen, 1)
    task2 = yield io.fork([inst, inst.gen])
  }

  proc(genFn()).done.catch(err => done.fail(err))

  setTimeout(() => {
    expect(task.name).toBe('subGen')
    expect(is.promise(task.done)).toBe(true)
    task.done.then(res => expect(res).toBe(1))

    task2.done.then(res => expect(res).toBe(2))

    Promise.all([task.done, task2.done]).then(() => done())
  }, 0)
})

test('proc join handling : generators', done => {
  expect.assertions(1)

  let actual = []
  const defs = arrayOfDeffered(2)

  const input = cb => {
    Promise.resolve(1)
      .then(() => defs[0].resolve(true))
      .then(() => cb({ type: 'action-1' }))
      .then(() => defs[1].resolve(2)) // the result of the fork will be resolved the last
    // proc must not block and miss the 2 precedent effects

    return () => {}
  }

  function* subGen(arg) {
    yield defs[1].promise // will be resolved after the action-1
    return arg
  }

  function* genFn() {
    const task = yield io.fork(subGen, 1)
    actual.push(yield defs[0].promise)
    actual.push(yield io.take('action-1'))
    actual.push(yield io.join(task))
  }

  proc(genFn(), input).done.catch(err => done.fail(err))
  const expected = [true, { type: 'action-1' }, 1]

  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, 0)
})

test('proc fork/join handling : functions', done => {
  expect.assertions(1)

  let actual = []
  const defs = arrayOfDeffered(2)

  Promise.resolve(1).then(() => defs[0].resolve(true)).then(() => defs[1].resolve(2))

  function api() {
    return defs[1].promise
  }

  function syncFn() {
    return 'sync'
  }

  function* genFn() {
    const task = yield io.fork(api)
    const syncTask = yield io.fork(syncFn)

    actual.push(yield defs[0].promise)
    actual.push(yield io.join(task))
    actual.push(yield io.join(syncTask))
  }

  proc(genFn()).done.catch(err => done.fail(err))
  const expected = [true, 2, 'sync']

  setTimeout(() => {
    expect(actual).toEqual(expected)
    done()
  }, 0)
})

test('proc fork wait for attached children', done => {
  expect.assertions(1)

  const actual = []
  const rootDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = arrayOfDeffered(4)

  Promise.resolve()
    .then(childAdef.resolve)
    .then(rootDef.resolve)
    .then(defs[0].resolve)
    .then(childBdef.resolve)
    .then(defs[2].resolve)
    .then(defs[3].resolve)
    .then(defs[1].resolve)

  function* root() {
    yield io.fork(childA)
    yield rootDef.promise
    yield io.fork(childB)
  }

  function* childA() {
    yield io.fork(leaf, 0)
    yield childAdef.promise
    yield io.fork(leaf, 1)
  }

  function* childB() {
    yield io.fork(leaf, 2)
    yield childBdef.promise
    yield io.fork(leaf, 3)
  }

  function* leaf(idx) {
    yield defs[idx].promise
    actual.push(idx)
  }

  proc(root()).done
    .then(() => {
      expect(actual).toEqual([0, 2, 3, 1])
      done()
    })
    .catch(err => done.fail(err))
})

test('proc auto cancel forks on error', done => {
  expect.assertions(1)

  const actual = []
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = arrayOfDeffered(4)

  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => mainDef.reject('main error'))
    //
    .then(() => defs[2].resolve('leaf 3 resolved'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      actual.push(yield io.call(main))
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield io.fork(childA)
      yield io.fork(childB)
      actual.push(yield mainDef.promise)
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield io.cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield io.fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield io.fork(leaf, 1)
    } finally {
      if (yield io.cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield io.fork(leaf, 2)
      yield io.fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield io.cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } finally {
      if (yield io.cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'main error',
    'leaf 3 cancelled',
    'leaf 4 cancelled',
    'root caught main error',
  ]
  proc(root()).done
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
    .catch(err => done.fail(err))
})

test('proc auto cancel forks on main cancelled', done => {
  expect.assertions(1)

  const actual = []
  const rootDef = deferred()
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = arrayOfDeffered(4)

  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => rootDef.resolve('root resolved'))
    //.then(() => new Promise(r => setTimeout(r,0)))
    .then(() => mainDef.resolve('main resolved'))
    .then(() => defs[2].resolve('leaf 3 resolved'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      const task = yield io.fork(main)
      actual.push(yield rootDef.promise)
      yield io.cancel(task)
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield io.fork(childA)
      yield io.fork(childB)
      actual.push(yield mainDef.promise)
    } finally {
      if (yield io.cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield io.fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield io.fork(leaf, 1)
    } finally {
      if (yield io.cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield io.fork(leaf, 2)
      yield io.fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield io.cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } finally {
      if (yield io.cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'root resolved',
    'main cancelled',
    'leaf 3 cancelled',
    'leaf 4 cancelled',
  ]
  proc(root()).done
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
    .catch(err => done.fail(err))
})

test('proc auto cancel forks if a child aborts', done => {
  expect.assertions(1)

  const actual = []
  /*
  const _push = actual.push
  actual.push = (arg) => {
    console.log(arg)
    _push.call(actual, arg)
  }
  */
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = arrayOfDeffered(4)

  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => mainDef.resolve('main resolved'))
    .then(() => defs[2].reject('leaf 3 error'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      actual.push(yield io.call(main))
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield io.fork(childA)
      yield io.fork(childB)
      actual.push(yield mainDef.promise)
      return 'main returned'
    } finally {
      if (yield io.cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield io.fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield io.fork(leaf, 1)
    } finally {
      if (yield io.cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield io.fork(leaf, 2)
      yield io.fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield io.cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield io.cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'main resolved',
    'leaf 3 error',
    'leaf 4 cancelled',
    'root caught leaf 3 error',
  ]
  proc(root()).done
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
    .catch(err => done.fail(err))
})

test('proc auto cancel parent + forks if a child aborts', done => {
  expect.assertions(1)

  const actual = []
  /*
  const _push = actual.push
  actual.push = (arg) => {
    console.log(arg)
    _push.call(actual, arg)
  }
  */
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = arrayOfDeffered(4)

  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => defs[2].reject('leaf 3 error'))
    .then(() => mainDef.resolve('main resolved'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      actual.push(yield io.call(main))
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield io.fork(childA)
      yield io.fork(childB)
      actual.push(yield mainDef.promise)
      return 'main returned'
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield io.cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield io.fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield io.fork(leaf, 1)
    } finally {
      if (yield io.cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield io.fork(leaf, 2)
      yield io.fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield io.cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield io.cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'leaf 3 error',
    'leaf 4 cancelled',
    'main cancelled',
    'root caught leaf 3 error',
  ]
  proc(root()).done
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
    .catch(err => done.fail(err))
})

test('joining multiple tasks', done => {
  expect.assertions(1)

  const defs = arrayOfDeffered(3)

  let actual

  function* worker(i) {
    return yield defs[i].promise
  }

  function* genFn() {
    const task1 = yield io.fork(worker, 0)
    const task2 = yield io.fork(worker, 1)
    const task3 = yield io.fork(worker, 2)

    actual = yield io.join(task1, task2, task3)
  }

  const expected = [1, 2, 3]

  const mainTask = proc(genFn())

  Promise.resolve().then(() => defs[0].resolve(1)).then(() => defs[2].resolve(3)).then(() => defs[1].resolve(2))

  mainTask.done
    .then(() => {
      expect(actual).toEqual(expected)
      done()
    })
    .catch(err => done.fail(err))
})
