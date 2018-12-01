function isGenerator(obj) {
  return typeof obj.next === 'function' && typeof obj.throw === 'function';
}

export default function isGeneratorFunction(obj) {
  const { constructor } = obj;
  if (!constructor) return false;
  if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') return true;
  return isGenerator(constructor.prototype);
}
