import proc from '../../src/internal/proc'

test('proc native promise handling', done => {
  expect.assertions(1)

  let actual = []

  function* genFn() {
    try {
      actual.push(yield Promise.resolve(1))
      actual.push(yield Promise.reject('error'))
    } catch (e) {
      actual.push('caught ' + e)
    }
  }

  const endP = proc(genFn()).done
  endP.catch(err => done.fail(err))

  endP.then(() => {
    expect(actual).toEqual([1, 'caught error'])
    done()
  })
})

test('proc native promise handling: undefined errors', done => {
  expect.assertions(1)

  let actual = []

  function* genFn() {
    try {
      actual.push(yield Promise.reject())
    } catch (e) {
      actual.push('caught ' + e)
    }
  }

  const endP = proc(genFn()).done
  endP.catch(err => done.fail(err))

  endP.then(() => {
    expect(actual).toEqual(['caught undefined'])
    done()
  })
})
