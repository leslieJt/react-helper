import { put, call } from '../../../src/effects'
import { delay } from '../../../src'
import { incrementAsync } from '../src/sagas'

test('incrementAsync Saga test', () => {
  const generator = incrementAsync()

  expect(generator.next().value).toEqual(call(delay, 1000))

  expect(generator.next().value).toEqual(put({type: 'INCREMENT'}))

  expect(generator.next()).toEqual({ done: true, value: undefined })
});
