import test from 'ava';
import {
  getValKeyPath,
  setValKeyPath,
} from '../src/util/obj_key_path_ops';

test('#getVal', t => {
  const examples = {
    a: {
      hello: {
        name: 'renaesop',
        path: ['abc'],
        objs: [
          {
            what: 1,
          },
          {
            what: 2,
          },
        ],
      }
    }
  };
  const keyPath = [
    ['a', 'hello', 'name'],
    'a.hello.objs.0.what'.split('.'),
    'a.hello.path.0'.split('.'),
  ];
  const expected = [
    'renaesop',
    1,
    'abc',
  ];
  for (let i = 0; i < keyPath.length; i++) {
    t.deepEqual(expected[i], getValKeyPath(examples, keyPath[i]));
  }
});

test('#setVal', t => {
  const examples = {
    a: {
      hello: {
        name: 'renaesop',
        path: ['abc'],
        objs: [
          {
            what: 1,
          },
          {
            what: 2,
          }
        ]
      }
    }
  };
  const keyPath = [
    [['a', 'hello', 'name'], 'kiss'],
    ['a.hello.objs.0.what'.split('.'), 1000],
    ['a.hello.path.0'.split('.'), '100']
  ];
  const expected = {
    a: {
      hello: {
        name: 'kiss',
        path: ['100'],
        objs: [
          {
            what: 1000,
          },
          {
            what: 2,
          }
        ]
      }
    }
  };
  let res = examples;
  for (let i = 0; i < keyPath.length; i++) {
    res = setValKeyPath(res, keyPath[i][0], keyPath[i][1]);
  }
  t.deepEqual(expected, res);
});
