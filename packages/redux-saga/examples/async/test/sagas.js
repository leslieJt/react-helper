import { call, fork, put, select, take } from '../../../src/effects'
import {
  fetchPosts,
  fetchPostsApi,
  invalidateReddit,
  nextRedditChange,
  startup
} from '../src/sagas'
import * as actions from '../src/actions'
import { postsByRedditSelector, selectedRedditSelector } from '../src/reducers/selectors'

test('fetchPosts Saga', () => {
  const mockPosts = [1, 2, 3]
  const redditName = 'react_reddit'
  const generator = fetchPosts(redditName)
  expect(generator.next().value).toEqual(put(actions.requestPosts(redditName)))
  expect(generator.next().value).toEqual(call(fetchPostsApi, redditName))
  expect(generator.next(mockPosts).value).toEqual(put(actions.receivePosts(redditName, mockPosts)))
  expect(generator.next().done).toBeTruthy()
})

test('invalidateReddit Saga', () => {
  const generator = invalidateReddit()
  expect(generator.next().value).toEqual(take(actions.INVALIDATE_REDDIT))
  expect(generator.next({ reddit: 'new_reddit_1'}).value).toEqual(call(fetchPosts, 'new_reddit_1'))
  expect(generator.next().value).toEqual(take(actions.INVALIDATE_REDDIT))
})

test('nextRedditChange Saga when switching to new reddit', () => {
  const generator = nextRedditChange()
  expect(generator.next().value).toEqual(select(selectedRedditSelector))
  expect(generator.next('prev_reddit').value).toEqual(take(actions.SELECT_REDDIT))
  expect(generator.next().value).toEqual(select(selectedRedditSelector))
  expect(generator.next('new_reddit').value).toEqual(select(postsByRedditSelector))
  expect(generator.next({}).value).toEqual(fork(fetchPosts, 'new_reddit'))
  expect(generator.next().value).toEqual(select(selectedRedditSelector))
})

test('nextRedditChange Saga when same reddit is selected', () => {
  const generator = nextRedditChange()
  generator.next()
  generator.next('prev_reddit')
  generator.next()
  generator.next('prev_reddit')
  expect(generator.next().value).toEqual(select(selectedRedditSelector))
})

test('nextRedditChange Saga when posts were previously loaded', () => {
  const generator = nextRedditChange()
  generator.next()
  generator.next('prev_reddit')
  generator.next()
  generator.next('new_reddit')
  const postsByReddit = {
    'new_reddit': ['cached_post']
  }
  expect(generator.next(postsByReddit).value).toEqual(select(selectedRedditSelector))
})

test('startup Saga', () => {
  const generator = startup()
  expect(generator.next().value).toEqual(select(selectedRedditSelector))
  expect(generator.next('selected_reddit').value).toEqual(fork(fetchPosts, 'selected_reddit'))
  expect(generator.next().done).toBeTruthy()
})
