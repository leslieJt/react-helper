import { take, put, call, race } from '../../../src/effects'
import {incrementAsync, onBoarding} from '../src/sagas'
import { delay } from '../src/services'
import * as actions from '../src/actions/counter'
import * as types from '../src/constants'


const getState = () => 0


test('counter Saga test', () => {
  const generator = incrementAsync(getState)
  let next

  next = generator.next()
  expect(next.value).toEqual(call(delay, 1000))

  next= generator.next()
  expect(next.value).toEqual(put(actions.increment()))
});

test('onBoarding Saga test', () => {
  const generator = onBoarding(getState)
  const MESSAGE = 'onBoarding Saga must wait for INCREMENT_COUNTER/delay(1000)'

  const expectedRace = race({
    increment : take(types.INCREMENT_COUNTER),
    timeout   : call(delay, 5000)
  })

  let next = generator.next()
  expect(next.value).toEqual(expectedRace)

  next = generator.next({increment: actions.increment()})
  expect(next.value).toEqual(expectedRace)

  next = generator.next({increment: actions.increment()})
  expect(next.value).toEqual(expectedRace)

  next = generator.next({increment: actions.increment()})
  expect(next.value).toEqual(put(actions.showCongratulation()))

  next = generator.next()
  expect(next.done).toBe(true)
});
