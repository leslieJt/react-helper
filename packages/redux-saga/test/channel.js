import { emitter, channel, eventChannel, END, UNDEFINED_INPUT_ERROR } from '../src/internal/channel'
import { buffers } from '../src/internal/buffers'

const eq = x => y => x === y

test('emitter', () => {
  expect.assertions(1)

  const em = emitter()
  const actual = []

  const unsub1 = em.subscribe(e => actual.push(`1:${e}`))
  const unsub2 = em.subscribe(e => actual.push(`2:${e}`))

  em.emit('e1')
  unsub1()
  em.emit('e2')
  unsub2()
  em.emit('e3')

  const expected = ['1:e1', '2:e1', '2:e2']
  expect(actual).toEqual(expected)
})

test('Unbuffered channel', () => {
  let chan = channel(buffers.none())
  let actual = []
  const logger = () => ac => actual.push(ac)

  try {
    chan.put(undefined)
  } catch (e) {
    expect(e.message).toBe(UNDEFINED_INPUT_ERROR)
  }

  chan = channel(buffers.none())

  chan.take(logger(), eq(1))
  const cb = logger()
  chan.take(cb, eq(1))

  chan.put(1)
  expect(actual).toEqual([1])

  cb.cancel()
  chan.put(1)
  expect(actual).toEqual([1])

  actual = []
  chan.take(logger())
  chan.take(logger())
  chan.close()
  expect(actual).toEqual([END, END])

  actual = []
  chan.take(logger())
  expect(actual).toEqual([END])
  chan.put('action-after-end')
  expect(actual).toEqual([END])
})

test('buffered channel', () => {
  const buffer = []
  const spyBuffer = {
    isEmpty: () => !buffer.length,
    put: it => buffer.push(it),
    take: () => buffer.shift(),
  }

  let chan = channel(spyBuffer)
  let log = []
  const taker = () => ac => log.push(ac)

  const state = () => [chan.__closed__, chan.__takers__, buffer, log]

  var t1 = taker()
  chan.take(t1)
  expect(state()).toEqual(
    [/* closed? */ false, /* takers  */ [t1], /* buffer  */ [], /* log     */ []]
  )

  const t2 = taker()
  chan.take(t2)
  chan.put(1)
  expect(state()).toEqual(
    [/* closed? */ false, /* takers  */ [t2], /* buffer  */ [], /* log     */ [1]]
  )

  chan.put(2)
  chan.put(3)
  chan.put(4)
  //try {
  //  chan.put(5)
  //} catch(err) {
  //  t.equal(err.message, BUFFER_OVERFLOW)
  //}
  expect(state()).toEqual(
    [/* closed? */ false, /* takers  */ [], /* buffer  */ [3, 4], /* log     */ [1, 2]]
  )

  chan.take(taker())
  expect(state()).toEqual(
    [/* closed? */ false, /* takers  */ [], /* buffer  */ [4], /* log     */ [1, 2, 3]]
  )

  chan.close()
  expect(state()).toEqual(
    [/* closed? */ true, /* takers  */ [], /* buffer  */ [4], /* log     */ [1, 2, 3]]
  )

  chan.close()
  expect(state()).toEqual(
    [/* closed? */ true, /* takers  */ [], /* buffer  */ [4], /* log     */ [1, 2, 3]]
  )

  chan.put('hi')
  chan.put('I said hi')
  expect(state()).toEqual(
    [/* closed? */ true, /* takers  */ [], /* buffer  */ [4], /* log     */ [1, 2, 3]]
  )

  chan.take(taker())
  expect(state()).toEqual(
    [/* closed? */ true, /* takers  */ [], /* buffer  */ [], /* log     */ [1, 2, 3, 4]]
  )

  chan.take(taker())
  expect(state()).toEqual(
    [/* closed? */ true, /* takers  */ [], /* buffer  */ [], /* log     */ [1, 2, 3, 4, END]]
  )
})

test('event channel', () => {
  let unsubscribeErr
  try {
    eventChannel(() => {})
  } catch (err) {
    unsubscribeErr = err
  }

  expect(unsubscribeErr).toBeTruthy()

  const em = emitter()
  let chan = eventChannel(em.subscribe)
  let actual = []

  chan.take(ac => actual.push(ac))
  em.emit('action-1')
  expect(actual).toEqual(['action-1'])

  em.emit('action-1')
  expect(actual).toEqual(['action-1'])

  actual = []
  chan.take(ac => actual.push(ac), ac => ac === 'action-xxx')
  chan.close()
  expect(actual).toEqual([END])

  actual = []
  chan.take(ac => actual.push(ac), ac => ac === 'action-yyy')
  expect(actual).toEqual([END])
})

test('unsubscribe event channel', done => {
  let unsubscribed = false
  let chan = eventChannel(() => () => {
    unsubscribed = true
  })
  chan.close()
  expect(unsubscribed).toBeTruthy()

  unsubscribed = false
  chan = eventChannel(emitter => {
    emitter(END)
    return () => {
      unsubscribed = true
    }
  })
  expect(unsubscribed).toBeTruthy()

  unsubscribed = false
  chan = eventChannel(emitter => {
    setTimeout(() => emitter(END), 0)
    return () => {
      unsubscribed = true
    }
  })
  chan.take(input => {
    expect(input).toBe(END)
    expect(unsubscribed).toBeTruthy()
    done()
  })
})

test('expanding buffer', () => {
  let chan = channel(buffers.expanding(2))

  chan.put('action-1')
  chan.put('action-2')
  chan.put('action-3')

  let actual
  chan.flush(items => (actual = items.length))
  let expected = 3

  expect(actual).toBe(expected)
})
