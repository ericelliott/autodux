const { describe } = require('riteway');

const autodux = require('./');
const id = autodux.id;
const assign = autodux.assign;

const createCounterDux = (initial = 0) =>
  autodux({
    // The slice of state your reducer controls.
    slice: 'counter',

    // The initial value for the slice of state.
    initial,

    // No need to implement switching logic, it's done for you.
    actions: {
      // Shorthand definition of action and corresponding reducer.
      increment: state => state + 1,
      decrement: state => state - 1,

      // Another way to define action and reducer.
      multiply: {
        // Define custom mapping of action creator parameter to action payload.
        create: ({ by }) => by,

        reducer: (state, payload) => state * payload
      },

      // Define action and reducer without custom mapping of action creator parameter to action payload.
      divide: {
        reducer: (state, payload) => Math.floor(state / payload)
      }
    },

    selectors: {
      // No need to select the state slice, it's done for you.
      getValue: id,

      // Get access to the root state in case you need it.
      getState: (_, rootState) => rootState
    }
  });

const createWeirdDux = () => autodux();

describe('autodux({ slice: … }).slice', async assert => {
  assert({
    given: "'autodux' is called with 'slice'",
    should: 'have the correct value',
    actual: createCounterDux().slice,
    expected: 'counter'
  });
});

describe('autodux({ initial: … }).initial', async assert => {
  assert({
    given: "'autodux' is called with 'initial'",
    should: 'return valid initial state',
    actual: createCounterDux().initial,
    expected: 0
  });
});

describe('autodux({ actions: … }).actions', async assert => {
  assert({
    given: "'autodux' is called with 'actions'",
    should: 'contain action creators',
    actual: Object.keys(createCounterDux().actions),
    expected: ['setCounter', 'increment', 'decrement', 'multiply', 'divide']
  });

  {
    const { actions } = createCounterDux();

    assert({
      given: "'autodux' is called with 'actions'",
      should: 'contain action creators that return correct action objects',
      actual: [
        actions.increment(),
        actions.decrement(),
        actions.multiply({ by: 2 }),
        actions.divide(1)
      ],
      expected: [
        { type: 'counter/increment', payload: undefined },
        { type: 'counter/decrement', payload: undefined },
        { type: 'counter/multiply', payload: 2 },
        { type: 'counter/divide', payload: 1 }
      ]
    });
  }

  {
    const {
      actions: { setCounter, increment, decrement, multiply, divide }
    } = createCounterDux();

    assert({
      given: "'autodux' is called with 'actions'",
      should: 'contain action creators with correct action type constants',
      actual: [
        setCounter.type,
        increment.type,
        decrement.type,
        multiply.type,
        divide.type
      ],
      expected: [
        'counter/setCounter',
        'counter/increment',
        'counter/decrement',
        'counter/multiply',
        'counter/divide'
      ]
    });
  }

  {
    const { actions } = createCounterDux();

    const value = 50;

    assert({
      given: "'autodux' is called with 'actions'",
      should:
        "contain action creator ('set${slice}') for setting the state of the slice",
      actual: actions.setCounter(value),
      expected: {
        type: 'counter/setCounter',
        payload: value
      }
    });
  }

  {
    const { actions, reducer, initial } = createCounterDux(128);

    assert({
      given: "'autodux' is called with 'actions'",
      should:
        'return action creator that maps parameters to action payload by default',
      actual: [actions.divide(2)].reduce(reducer, initial),
      expected: 64
    });
  }
});

describe('autodux({ … }).actions', async assert => {
  {
    const {
      actions: { setUserName, setAge }
    } = autodux({
      slice: 'user',
      initial: {
        userName: 'Anonymous',
        age: 0
      }
    });

    const userName = 'Freddie';
    const age = 23;

    assert({
      given: "'autodux' is called without 'actions'",
      should:
        'contain correct action creators for each key in the initial state',
      actual: [setUserName(userName), setAge(age)],
      expected: [
        {
          type: 'user/setUserName',
          payload: userName
        },
        {
          type: 'user/setAge',
          payload: age
        }
      ]
    });
  }
});

describe('autodux({ actions: … }).reducer', async assert => {
  {
    const {
      actions: { increment, decrement },
      reducer,
      initial
    } = createCounterDux();

    assert({
      given: "'autodux' is called with 'actions'",
      should: 'return reducer that switches correctly',
      actual: [increment(), increment(), increment(), decrement()].reduce(
        reducer,
        initial
      ),
      expected: 2
    });
  }

  {
    const {
      actions: { increment, multiply },
      reducer,
      initial
    } = createCounterDux();

    assert({
      given: "'autodux' is called with 'actions'",
      should: 'return reducer that considers delivering action payloads',
      actual: [increment(), increment(), multiply({ by: 2 })].reduce(
        reducer,
        initial
      ),
      expected: 4
    });
  }
});

describe('autodux({ … }).reducer', async assert => {
  {
    const initial = { a: 'a' };

    const { reducer } = autodux({
      initial
    });

    assert({
      given: "'autodux' is called without 'actions'",
      should: 'contain reducer that returns valid default state',
      actual: reducer(),
      expected: initial
    });
  }
});

describe('autodux({ slice: …, initial: … }).selectors', async assert => {
  const { getValue } = createCounterDux().selectors;

  {
    assert({
      given: "'autodux' is called with 'slice' and 'initial'",
      should: 'return a selector that knows its state slice',
      actual: getValue({ counter: 3 }),
      expected: 3
    });
  }

  {
    const rootState = {
      sliceName: {
        key1: 'value 1',
        key2: 'value 2'
      }
    };

    const {
      selectors: { getKey1, getKey2 },
      initial
    } = autodux({
      slice: 'sliceName',
      initial: rootState.sliceName
    });

    assert({
      given: "'autodux' is called with 'slice' and 'initial'",
      should: 'expose a selector for each key in the initial state',
      actual: {
        key1: getKey1(rootState),
        key2: getKey2(rootState)
      },
      expected: initial
    });
  }

  {
    const rootState = {
      user: {
        userName: 'Anonymous',
        avatar: 'anonymous.png'
      }
    };

    const {
      selectors: { getUser },
      initial
    } = autodux({
      slice: 'user',
      initial: rootState.user
    });

    assert({
      given: "'autodux' is called with 'slice' and 'initial'",
      should: 'expose a selector for the entire state of the slice',
      actual: getUser(rootState),
      expected: initial
    });
  }

  {
    const { getState } = createCounterDux().selectors;

    const rootState = { counter: 3, foo: 'bar' };

    assert({
      given: "'autodux' is called with argument",
      should:
        'return selector that passes the root state object as the second parameter',
      actual: getState(rootState),
      expected: rootState
    });
  }
});

describe('assign(key)', async assert => {
  const {
    actions: { setUserName, setAvatar },
    reducer
  } = autodux({
    slice: 'user',
    initial: {
      userName: 'Anonymous',
      avatar: 'anonymous.png'
    },
    actions: {
      setUserName: assign('userName'),
      setAvatar: assign('avatar')
    }
  });

  const userName = 'Foo';
  const avatar = 'foo.png';

  assert({
    given: 'a key',
    should:
      'return a reducer that sets the key in the state to the action payload value',
    actual: [setUserName(userName), setAvatar(avatar)].reduce(
      reducer,
      undefined
    ),
    expected: {
      userName,
      avatar
    }
  });
});

// Tests for edge cases.
describe('autodux()', async assert => {
  assert({
    given: "'autodux' is called without an argument",
    should: "return 'slice' with an empty name",
    actual: createWeirdDux().slice,
    expected: ''
  });

  assert({
    given: "'autodux' is called without an argument",
    should: 'return initial state that is an empty string',
    actual: createWeirdDux().initial,
    expected: ''
  });

  assert({
    given: "'autodux' is called without an argument",
    should: "return a single 'set' action creator",
    actual: Object.keys(createWeirdDux().actions),
    expected: ['set']
  });

  assert({
    given: "'autodux' is called without an argument",
    should: "return a single 'set' action creator with the correct type",
    actual: createWeirdDux().actions.set.type,
    expected: '/set'
  });

  assert({
    given: "'autodux' is called without an argument",
    should:
      "return a single 'set' action creator that produces correct action object",
    actual: createWeirdDux().actions.set(),
    expected: { type: '/set', payload: undefined }
  });

  {
    const {
      actions: { set },
      reducer,
      initial
    } = createWeirdDux();

    assert({
      given: "'autodux' is called without an argument",
      should: 'return reducer that changes the state to an empty object',
      actual: [set()].reduce(reducer, initial),
      expected: {}
    });
  }

  assert({
    given: "'autodux' is called without an argument",
    should: "return a single 'get' selector",
    actual: Object.keys(createWeirdDux().selectors),
    expected: ['get']
  });

  {
    const {
      selectors: { get },
      initial
    } = createWeirdDux();

    const rootState = { '': initial };

    assert({
      given: "'autodux' is called without an argument",
      should: "return a single 'get' selector that returns initial state",
      actual: get(rootState),
      expected: initial
    });
  }
});
