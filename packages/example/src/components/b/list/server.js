import faker from 'faker';

function randOneOf(arr) {
  const size = arr.length;
  const index = Math.floor(size * Math.random());
  return arr[index];
}

const fullData = Array(10000).fill(0).map((_, index) => ({
  id: index + 1,
  sku: faker.commerce.productName(),
  status: randOneOf(['1', '2', '3']),
  img: faker.image.fashion(),
  category: randOneOf(['1', '2']),
  price: faker.commerce.price(),
}));

function sleep(n) {
  return new Promise(resolve => setTimeout(resolve, n * 1000));
}

export default async function getData({ status, category, sku }) {
  await sleep(2);
  return fullData
    .filter(x => status === '0' || x.status === status)
    .filter(x => !category || x.category === category)
    .filter(x => !sku || x.sku === sku);
}
