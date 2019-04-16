import proc from '../../src/internal/proc'
import { noop } from '../../src/utils'
import * as io from '../../src/effects'

test('proc logging', () => {
  expect.assertions(2)

  let actual

  function* child() {
    throw new Error('child error')
  }

  function* main() {
    yield io.call(child)
  }

  proc(main(), undefined, noop, noop, undefined, {
    logger: (level, ...args) => {
      actual = [level, args.join(' ')]
    },
  }).done.catch(err => {
    expect(actual[0]).toBe('error')
    expect(actual[1].indexOf(err.message) >= 0).toBeTruthy()
  })
})
