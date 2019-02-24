import { describe } from 'riteway';

import {
  id,
  isFunction,
  isPrimitive,
  selectIfFunction,
  isSliceValid,
  getSelectorName,
  getActionCreatorName,
  getType
} from './helpers';

describe('id(value)', async assert => {
  assert({
    given: 'a value',
    should: 'return the same value',
    actual: [id(1), id('Sigourney'), id({ key: 0 })],
    expected: [1, 'Sigourney', { key: 0 }]
  });
});

describe('isFunction(f)', async assert => {
  assert({
    given: 'a function',
    should: "return 'true'",
    actual: isFunction(() => null),
    expected: true
  });

  assert({
    given:
      "a string, a number, a boolean, 'undefined', 'null', an object or an array",
    should: "return 'false'",
    actual: [
      isFunction('Gene'),
      isFunction(1),
      isFunction(true),
      isFunction(false),
      isFunction(undefined),
      isFunction(null),
      isFunction({}),
      isFunction([])
    ],
    expected: Array(8).fill(false)
  });
});

describe('selectIfFunction(value)', async assert => {
  {
    const fn = () => 'Ray';

    assert({
      given: 'a function',
      should: 'return it',
      actual: selectIfFunction(fn)(),
      expected: 'Ray'
    });
  }

  assert({
    given: 'anything other than function',
    should: "return 'false'",
    actual: [
      selectIfFunction('Jennifer'),
      selectIfFunction(2),
      selectIfFunction(true),
      selectIfFunction(false),
      selectIfFunction(undefined),
      selectIfFunction(null),
      selectIfFunction({}),
      selectIfFunction([])
    ],
    expected: Array(8).fill(false)
  });
});

describe('isPrimitive(value)', async assert => {
  assert({
    given: "a string, a number, a boolean, 'undefined' or 'null'",
    should: "return 'true'",
    actual: [
      isPrimitive('Jason'),
      isPrimitive(3),
      isPrimitive(true),
      isPrimitive(false),
      isPrimitive(undefined),
      isPrimitive(null)
    ],
    expected: Array(6).fill(true)
  });

  assert({
    given: 'an object, an array or a function',
    should: "return 'false'",
    actual: [isPrimitive({}), isPrimitive([]), isPrimitive(() => 0)],
    expected: [false, false, false]
  });
});

describe('isSliceValid(slice)', async assert => {
  assert({
    given: 'a slice as a non-empty string',
    should: "return 'true'",
    actual: [isSliceValid('cast'), isSliceValid('🚀')],
    expected: [true, true]
  });

  assert({
    given: 'a slice as an empty string',
    should: "return 'false'",
    actual: isSliceValid(''),
    expected: false
  });
});

describe('getSelectorName(key)', async assert => {
  assert({
    given: 'a key as string or number',
    should:
      'return a selector name that starts with "get" followed by the capitalized key value',
    actual: [
      getSelectorName('bestActressName'),
      getSelectorName('🍿'),
      getSelectorName('0'),
      getSelectorName(1234)
    ],
    expected: ['getBestActressName', 'get🍿', 'get0', 'get1234']
  });
});

describe('getActionCreatorName(key)', async assert => {
  assert({
    given: 'a key as string or number',
    should:
      'return an action creator name that starts with "set" followed by the capitalized key value',
    actual: [
      getActionCreatorName('bestActressName'),
      getActionCreatorName('🍿'),
      getActionCreatorName('0'),
      getActionCreatorName(1234)
    ],
    expected: ['setBestActressName', 'set🍿', 'set0', 'set1234']
  });
});

describe('getType(slice, actionCreatorName)', async assert => {
  const slice = 'movie';
  const actionCreatorName = 'setProducer';

  assert({
    given: 'slice and action creator name',
    should: 'return correct action type',
    actual: getType(slice, actionCreatorName),
    expected: `${slice}/${actionCreatorName}`
  });
});
