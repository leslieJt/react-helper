import {
  mappingVal,
  reverseMappingVal,
} from '../mapping';

describe('#module: mapping', () => {
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
  test('#mapping should work as expected', () => {
    for (let i = 0; i < examples.length; i += 1) {
      expect(expectResults[i]).toEqual(mappingVal(examples[i], mapping[i]));
    }
  });

  test('#reverse mapping should work as expected', () => {
    for (let i = 0; i < examples.length; i += 1) {
      expect(examples[i]).toEqual(reverseMappingVal(expectResults[i], mapping[i]));
    }
  });
});
