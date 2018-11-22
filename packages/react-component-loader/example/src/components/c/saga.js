/**
 * Created by fed on 2017/8/24.
 */
import { take } from 'redux-saga/effects';
import * as types from '../b/a/types';

export default function *() {
  yield take('aaa');
  console.log(types.F_SAS, types.ASAS_CD, types.A);
}