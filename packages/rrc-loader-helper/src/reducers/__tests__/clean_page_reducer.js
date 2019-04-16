import {
  cleanPageReducer,
} from '../clean_page_reducer';
import {
  cleanPage,
} from '../../actions';

test('#clean page reducer', () => {
  const page = '/test';
  const url = '/test/1';
  const action = {
    type: cleanPage,
    payload: {
      page, url,
    }
  };
  const rawState = {
    '.retain': {
      [url]: {
        dsad: 123
      },
    },
    [page]: {
      qaq: 333
    },
    ab: 'c',
  };
  expect(cleanPageReducer(rawState, action)).toEqual({
    '.retain': {},
    ab: 'c',
  });
});
