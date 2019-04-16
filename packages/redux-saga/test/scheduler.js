import { take, put, race } from '../src/effects'
import { asap, flush, suspend } from '../src/internal/scheduler'

export const runSyncDispatchTest = (store, runSaga) => {
  const actual = []

  expect.assertions(1)

  runSaga(root)
  store.subscribe(() => {
    if (store.getState() === 'c') store.dispatch({ type: 'b', test: true })
  })
  store.dispatch({ type: 'a', test: true })

  function* root() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { a, b } = yield race({
        a: take('a'),
        b: take('b'),
      })

      actual.push(a ? a.type : b.type)

      if (a) {
        yield put({ type: 'c', test: true })
        continue
      }

      yield put({ type: 'd', test: true })
    }
  }

  Promise.resolve().then(() => {
    expect(actual).toEqual(['a', 'b'])
  })
}

test('scheduler executes all recursively triggered tasks in order', () => {
  const actual = []
  expect.assertions(1)
  asap(() => {
    actual.push('1')
    asap(() => {
      actual.push('2')
    })
    asap(() => {
      actual.push('3')
    })
  })
  expect(actual).toEqual(['1', '2', '3'])
})

test('scheduler when suspended queues up and executes all tasks on flush', () => {
  const actual = []
  expect.assertions(1)
  suspend()
  asap(() => {
    actual.push('1')
    asap(() => {
      actual.push('2')
    })
    asap(() => {
      actual.push('3')
    })
  })
  flush()
  expect(actual).toEqual(['1', '2', '3'])
})
