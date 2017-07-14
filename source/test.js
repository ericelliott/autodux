const test = require('tape');
const autodux = require('./index');

const empty = () => {};
const id = x => x;

const createDux = () => autodux({
  slice: 'counter',
  initial: 0,
  actions: {
    increment: {
      create: empty,
      reducer: state => state + 1
    },
    decrement: {
      create: empty,
      reducer: state => state - 1
    },
    multiply: {
      create: id,
      reducer: (state, payload) => state * payload
    }
  },
  selectors: {
    getValue: id
  }
});

test('autodux().actions', assert => {
  const msg = 'should contain action creators';

  const actual = Object.keys(createDux().actions);
  const expected = ['increment', 'decrement', 'multiply'];

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().actions', assert => {
  const msg = 'should produce correct action objects';

  const { actions } = createDux();

  const actual = [
    actions.increment(),
    actions.decrement(),
    actions.multiply(2)
  ];

  const expected = [
    { type: 'counter/increment', payload: undefined },
    { type: 'counter/decrement', payload: undefined },
    { type: 'counter/multiply', payload: 2 },
  ];

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().actions', assert => {
  const msg = 'should produce namespaced action type constants';

  const {
    actions: {
      increment,
      decrement,
      multiply
    }
  } = createDux();

  const actual = [
    increment.type,
    decrement.type,
    multiply.type
  ];

  const expected = [
    'counter/increment',
    'counter/decrement',
    'counter/multiply'
  ];

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().reducer', assert => {
  const msg = 'reducer should switch correctly';

  const {
    actions: {
      increment,
      decrement
    },
    reducer,
    initial
  } = createDux();

  const actions = [
    increment(),
    increment(),
    increment(),
    decrement()
  ];

  const actual = actions.reduce(reducer, initial);
  const expected = 2;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().reducer', assert => {
  const msg = 'reducer should deliver action payloads';

  const {
    actions: {
      increment,
      multiply
    },
    reducer,
    initial
  } = createDux();

  const actions = [
    increment(),
    increment(),
    multiply(2)
  ];

  const actual = actions.reduce(reducer, initial);
  const expected = 4;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux().selectors', assert => {
  const msg = 'should return selector that knows its state slice';
  const { getValue } = createDux().selectors;

  const actual = getValue({ counter: 3 });
  const expected = 3;

  assert.same(actual, expected, msg);
  assert.end();
});

test('autodux() action creators', assert => {
  const msg = 'should default missing action creators to empty';

  const { actions } = autodux({
    slice: 'emptyCreator',
    actions: {
      nothing: {
        reducer: x => x
      }
    }
  });

  const actual = actions.nothing();
  const expected = {
    type: 'emptyCreator/nothing',
    payload: undefined
  };

  assert.same(actual, expected, msg);
  assert.end();
});
