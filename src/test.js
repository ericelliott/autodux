import { describe, Try } from 'riteway';

import autodux, { id, assign } from './core';
import { SLICE_VALUE_ERROR } from './errors';

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

describe('autodux({ … }).slice', async assert => {
  assert({
    given: "'autodux' is called with 'slice'",
    should: 'have the correct value',
    actual: createCounterDux().slice,
    expected: 'counter'
  });
});

describe('autodux({ … }).initial', async assert => {
  assert({
    given: "'autodux' is called with 'slice' and 'initial'",
    should: 'return valid initial state',
    actual: createCounterDux().initial,
    expected: 0
  });

  assert({
    given: "'autodux' is called without 'initial'",
    should: 'return initial state as an empty string',
    actual: autodux({ slice: 'user' }).initial,
    expected: ''
  });
});

describe('autodux({ … }).actions', async assert => {
  assert({
    given: "'autodux' is called with 'slice' and 'actions'",
    should: 'contain action creators',
    actual: Object.keys(createCounterDux().actions),
    expected: ['setCounter', 'increment', 'decrement', 'multiply', 'divide']
  });

  {
    const { actions } = createCounterDux();

    assert({
      given: "'autodux' is called with 'slice' and 'actions'",
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
      given: "'autodux' is called with 'slice' and 'actions'",
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
    const { actions } = autodux({
      slice: 'words'
    });

    assert({
      given: "'autodux' is called with 'slice' and without 'actions'",
      should:
        "contain a single action creator ('set${slice}') for setting the state of the slice",
      actual: Object.keys(actions).length,
      expected: 1
    });
  }

  {
    const { actions } = createCounterDux();

    const value = 50;

    assert({
      given: "'autodux' is called with 'slice' and 'actions'",
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
      given: "'autodux' is called with 'slice' and 'actions'",
      should:
        'return action creator that maps parameters to action payload by default',
      actual: [actions.divide(2)].reduce(reducer, initial),
      expected: 64
    });
  }

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
      given: "'autodux' is called with 'slice' and without 'actions'",
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

describe('autodux({ … }).reducer', async assert => {
  {
    const {
      actions: { increment, decrement },
      reducer,
      initial
    } = createCounterDux();

    assert({
      given: "'autodux' is called with 'slice' and 'actions'",
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
      given: "'autodux' is called with 'slice' and 'actions'",
      should:
        'return reducer that receives action payload as the second parameter',
      actual: [increment(), increment(), multiply({ by: 2 })].reduce(
        reducer,
        initial
      ),
      expected: 4
    });
  }

  {
    const initial = { name: 'Jim' };

    const { reducer } = autodux({
      slice: 'user',
      initial
    });

    assert({
      given: "'autodux' is called with 'slice' and without 'actions'",
      should: 'return reducer that returns valid default state',
      actual: reducer(),
      expected: initial
    });
  }

  {
    const {
      actions: { setInfo },
      reducer,
      initial
    } = autodux({ slice: 'info', initial: 'Some text goes here…' });

    assert({
      given: "'autodux' is called with 'slice' and without 'actions'",
      should:
        'return reducer that changes the state to the primitive value of action payload',
      actual: [
        [setInfo('Hi!')].reduce(reducer, initial),
        [setInfo(9)].reduce(reducer, initial),
        [setInfo(undefined)].reduce(reducer, initial),
        [setInfo(true)].reduce(reducer, initial),
        [setInfo(null)].reduce(reducer, initial)
      ],
      expected: ['Hi!', 9, undefined, true, null]
    });
  }
});

describe('autodux({ … }).selectors', async assert => {
  {
    const rootState = {
      album: {
        name: 'The Works',
        year: 1984
      }
    };

    const {
      selectors: { getName, getYear },
      initial
    } = autodux({
      slice: 'album',
      initial: rootState.album
    });

    assert({
      given: "'autodux' is called with 'slice' and 'initial'",
      should: 'expose a selector for each key in the initial state',
      actual: {
        name: getName(rootState),
        year: getYear(rootState)
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
    const { getValue } = createCounterDux().selectors;

    assert({
      given: "'autodux' is called with 'slice' and 'selectors'",
      should: 'return a selector that knows its state slice',
      actual: getValue({ counter: 3 }),
      expected: 3
    });
  }

  {
    const { getState } = createCounterDux().selectors;

    const rootState = { counter: 3, foo: 'bar' };

    assert({
      given: "'autodux' is called with 'slice' and 'selectors'",
      should: 'return a selector that can return the root state object',
      actual: getState(rootState),
      expected: rootState
    });
  }
});

describe('autodux()', async assert => {
  assert({
    given: "'autodux' is called without an argument",
    should: 'throw an error',
    actual: Try(autodux).toString(),
    expected: new Error(SLICE_VALUE_ERROR).toString()
  });
});

describe("autodux({ …, slice: undefined | null | '' })", async assert => {
  const error = new Error(SLICE_VALUE_ERROR).toString();

  assert({
    given: "'autodux' is called with improper 'slice' value",
    should: 'throw an error',
    actual: [
      Try(autodux, { slice: undefined }).toString(),
      Try(autodux, { slice: null }).toString(),
      Try(autodux, { slice: '' }).toString()
    ],
    expected: [error, error, error]
  });
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
