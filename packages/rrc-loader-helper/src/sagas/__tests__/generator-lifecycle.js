import markStatus, {
  addLifecycle,
} from '../generator-lifecycle';

describe('#module: mark-status', () => {
  test('should yield what onYield processed', () => {
    function* f() {
      yield 1;
    }
    const onYield = jest.fn(() => Math.random());
    const newF = addLifecycle(f, {
      onAddStatus: jest.fn(),
      onOk: jest.fn(),
      onError: jest.fn(),
      onYield,
    });

    const it = newF();

    expect(it.next().value).toEqual(onYield.mock.results[0].value);
  });

  test('should call onYield only when raw generator yield result', () => {
    function* f() {
      markStatus('zzz');
      yield 1;
    }
    const onYield = jest.fn(() => Math.random());
    const newF = addLifecycle(f, {
      onAddStatus: jest.fn(),
      onOk: jest.fn(),
      onError: jest.fn(),
      onYield,
    });

    const it = newF();

    it.next();
    expect(onYield.mock.calls.length).toBe(0);
    expect(it.next().value).toEqual(onYield.mock.results[0].value);
  });

  test('should return right markings', () => {
    const f1Status = ['kkkk', 'sql'];
    const f2Status = ['???', 'zzzz'];
    function* f1() {
      markStatus(f1Status[0]);
      yield 1;
      markStatus(f1Status[1]);
    }

    function* f2() {
      markStatus(f2Status[0]);
      markStatus(f2Status[1]);
      yield 2;
    }

    const onAddStatusF1 = jest.fn(() => Math.random());
    const onOkF1 = jest.fn();
    const newF1 = addLifecycle(f1, {
      onAddStatus: onAddStatusF1,
      onOk: onOkF1,
      onError: jest.fn(),
      onYield: jest.fn(x => x),
    });

    const onAddStatusF2 = jest.fn(() => Math.random());
    const onErrorF2 = jest.fn();
    const onOkF2 = jest.fn();
    const newF2 = addLifecycle(f2, {
      onAddStatus: onAddStatusF2,
      onOk: onOkF2,
      onError: jest.fn(),
      onYield: jest.fn(x => x),
    });
    const it1 = newF1();
    const it2 = newF2();

    expect(it1.next().value).toEqual(onAddStatusF1.mock.results[0].value);
    it1.next();
    expect(onAddStatusF1.mock.calls[0][0]).toEqual([f1Status[0]]);
    expect(it2.next().value).toEqual(onAddStatusF2.mock.results[0].value);
    expect(onOkF2.mock.calls.length).toBe(0);
    it1.next();
    it2.next();
    it2.next();

    // no more yield, markingStatus shall do nothing
    expect(onAddStatusF1.mock.calls.length).toBe(1);
    expect(onOkF1.mock.calls.length).toBe(1);
    expect(onOkF1.mock.calls[0][0]).toEqual([f1Status[0]]);

    expect(onAddStatusF1.mock.calls.length).toBe(1);
    expect(onOkF2.mock.calls[0][0]).toEqual(f2Status);
    expect(onOkF2.mock.calls[0][0]).toEqual(f2Status);
    expect(onErrorF2.mock.calls.length).toBe(0);
  });

  test('should process exception rightly', () => {
    const fStatus = ['fuck'];
    function* f() {
      markStatus(fStatus[0]);
      try {
        yield 1;
      } catch (e) {
        yield 2;
      }
      throw new Error();
    }

    const onAddStatus = jest.fn();
    const onError = jest.fn();
    const onOk = jest.fn();
    const newF = addLifecycle(f, {
      onAddStatus, onError, onOk, onYield: jest.fn(x => x),
    });

    const it = newF();

    it.next();
    expect(onAddStatus.mock.calls[0][0]).toEqual([fStatus[0]]);
    expect(it.throw(new Error())).toEqual({ value: 2, done: false });
    // important: if f throw an error, for new F:
    // first of all, the onError will be called,
    // then the error will throw
    it.next();
    expect(onError.mock.calls.length).toBe(1);
    expect(() => it.next()).toThrow();
    expect(onOk.mock.calls.length).toBe(0);
  });

  test('should process result rightly', () => {
    function* f() {
      markStatus('zzz');
      yield 1;
      return 2;
    }

    const newF = addLifecycle(f, {
      onAddStatus: jest.fn(),
      onOk: jest.fn(),
      onError: jest.fn(),
      onYield: jest.fn(),
    });

    const it = newF();

    it.next();
    it.next();
    it.next();
    const result = it.next();
    expect(result.done).toBe(true);
    expect(result.value).toEqual(2);
  });
});
