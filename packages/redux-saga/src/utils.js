export {
  TASK,
  SAGA_ACTION,
  noop,
  is,
  deferred,
  arrayOfDeffered,
  createMockTask,
  cloneableGenerator,
} from './internal/utils'
export { asEffect } from './internal/io'
export { CHANNEL_END } from './internal/proc'

export const namespaceKey = '@@__SELF_URL__'
export const pageKey = '@@__PAGE__'
