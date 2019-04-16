import { put, call, select } from '../../../src/effects'
import { getAllProducts, checkout } from '../src/sagas'
import { api } from '../src/services'
import * as actions from '../src/actions'
import { getCart } from '../src/reducers'

const products = [1], cart = [1] // dummy values
const state = { products, cart }
const getState = () => state

test('getProducts Saga test', function () {
  const generator = getAllProducts(getState)

  let next = generator.next(actions.getAllProducts())
  expect(next.value).toEqual(call(api.getProducts))

  next = generator.next(products)
  expect(next.value).toEqual(put(actions.receiveProducts(products)))
})


test('checkout Saga test', function () {
  const generator = checkout()

  let next = generator.next()
  expect(next.value).toEqual(select(getCart))

  next = generator.next(cart)
  expect(next.value).toEqual(call(api.buyProducts, cart))

  next = generator.next()
  expect(next.value).toEqual(put(actions.checkoutSuccess(cart)))
})
