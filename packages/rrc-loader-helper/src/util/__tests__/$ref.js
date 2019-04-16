import {
  stick$refToState,
  setASymlink,
} from '../$ref';

test('#stick$ref to state', () => {
  const firstState = {
    a: 123,
  };
  stick$refToState({}, firstState);
  const { $ref } = firstState;
  const secondState = {
    a: 333
  };
  stick$refToState(firstState, secondState);
  const thirdState = {
    a: 444,
    b: 0,
  };
  stick$refToState(secondState, thirdState);
  expect($ref.state).toEqual(thirdState);
});

test('#setASymlink', () => {
  const firstState = {
    '.retain': {
      a: 123,
      b: 2,
    },
  };
  stick$refToState({}, firstState);
  setASymlink(firstState, 'k', 'a');
  expect(firstState.k).toEqual(123);
  setASymlink(firstState, 'k', 'b');
  expect(firstState.k).toEqual(2);
});
