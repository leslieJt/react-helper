import {
  put,
} from '@vve/redux-saga/effects';
import {
  editInSaga,
} from '../../actions';
import newPutFactory from '../new-put-factory';

describe('#module input-factory', () => {
  const pageName = 'hello';
  function caller() {

  }
  const newInput = newPutFactory(pageName, caller.name);
  it('should return wrapped put() result', () => {
    const fn = jest.fn();
    const str = 'aaavv';
    expect(newInput(fn, str)).toEqual(put({
      fn,
      description: str,
      type: editInSaga,
      page: pageName,
      fromMethod: caller.name,
    }));
  });
  it('should return raw put() result given non-function', () => {
    const input = {
      type: 'fkkkk',
    };
    const input2 = {
      zzz: '123',
    };
    expect(newInput(input)).toEqual(put(input));
    expect(newInput(input2)).toEqual(put(input2));
  });
});
