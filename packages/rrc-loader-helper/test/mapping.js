import test from 'ava';
import {
  mappingVal,
  reverseMappingVal,
} from '../src/util/mapping';

const examples = [
  {
    name: 'yuji',
    password: '123123',
  },
  {
    name: 'yuji',
    password: '123123',
  },
  ['yuji', '123123']
];
const mapping = [
  {
    name: 'username',
    password: 'passwd'
  },
  {
    name: 0,
    password: 1,
  },
  ['name', 'password']
];
const expectResults = [
  {
    username: 'yuji',
    passwd: '123123'
  },
  ['yuji', '123123'],
  {
    name: 'yuji',
    password: '123123',
  },
];

test('#mapping value', t => {
  for (let i = 0; i < examples.length; i++ ) {
    t.deepEqual(expectResults[i], mappingVal(examples[i], mapping[i]), 'mapping should work');
  }
});

test('#reverse mapping value', t => {
  for (let i = 0; i < examples.length; i++ ) {
    t.deepEqual(examples[i], reverseMappingVal(expectResults[i], mapping[i]), 'mapping should work');
  }
});
