/**
 * Created by fed on 2017/8/24.
 */
import { markStatus } from 'rrc-loader-helper/lib/sagas';

import getData from './server';

const defaultState = {
  dataStatus: 1,
  data: [],
  getCateResult: undefined,
};

export default {
  defaultState,
  * search({ payload }) {
    markStatus('dataStatus');
    const data = yield getData(payload);
    yield (state) => { state.data = data; };

    const otherState = yield 'a';
    console.log('state a is : ', otherState);
    const myState = yield '';
    console.log('my state is : ', myState);
  },
  * getCate() {
    return yield getData();
  },
};
