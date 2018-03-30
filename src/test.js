const { describe } = require('riteway');

const autodux = require('./');
const id = autodux.id;
const assign = autodux.assign;

const createDux = () => autodux({
  slice: 'counter',
  initial: 0,
  actions: {
    increment: {
      reducer: state => state + 1
    },
    decrement: {
      reducer: state => state - 1
    },
    multiply: {
      create: id,
      reducer: (state, payload) => state * payload
    }
  },
  selectors: {
    getValue: id,
    getStore: (_, store) => store
  }
});

describe('autodux().slice', async should => {
  const { assert } = should();

  assert({
    given: 'autodux is called with args',
    should: 'have the correct string value',
    actual: createDux().slice,
    expected: 'counter',
  });
});

describe('autodux().actions', async should => {
  const { assert } = should();

  assert({
    given: 'autodux is called with args',
    should: 'contain action creators',
    actual: Object.keys(createDux().actions),
    expected: ['setCounter', 'increment', 'decrement', 'multiply']
  });

  {
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

    assert({
      given: 'autodux is called with args',
      should: 'produce correct action objects',
      actual,
      expected
    });
  }

  {
    const {
      actions: {
        setCounter,
        increment,
        decrement,
        multiply
      }
    } = createDux();

    const actual = [
      setCounter.type,
      increment.type,
      decrement.type,
      multiply.type
    ];

    const expected = [
      'counter/setCounter',
      'counter/increment',
      'counter/decrement',
      'counter/multiply'
    ];

    assert({
      given: 'autodux is called with args',
      should: 'produce namespaced action type constants',
      actual,
      expected
    });
  }
});

describe('autodux().reducer', async should => {
  const { assert } = should();

  {
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

    assert({
      given: 'a reducer',
      should: 'switch correctly',
      actual: actions.reduce(reducer, initial),
      expected: 2
    });
  }

  {
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

    assert({
      given: 'a reducer',
      should: 'deliver action payloads',
      actual: actions.reduce(reducer, initial),
      expected: 4
    });
  }
});

describe('autodux().selectors', async should => {
  const { assert } = should();
  const { getValue } = createDux().selectors;

  {
    assert({
      given: 'a property and value',
      should: 'return a selector that knows its state slice',
      actual: getValue({ counter: 3 }),
      expected: 3
    });
  }

  {
    const initial = {
      key1: 'value 1',
      key2: 'value 2'
    };
    const store = {
      slice: initial
    };

    const { selectors: { getKey1, getKey2 } } = autodux({
      slice: 'slice',
      initial
    });

    const actual = {
      key1: getKey1(store),
      key2: getKey2(store)
    };

    assert({
      given: 'a property and value',
      should: 'expose a selector for each key in the initial state',
      actual,
      expected: initial
    });
  }

  {
    const initial = {
      userName: 'Anonymous',
      avatar: 'anonymous.png'
    };
    const store = {
      user: initial
    };

    const {
      selectors: {
        getUser
      }
    } = autodux({
      slice: 'user',
      initial: {
        userName: 'Anonymous',
        avatar: 'anon.png'
      }
    });


    assert({
      given: 'selectors',
      should: 'expose a selector for the entire reducer state',
      actual: getUser(store),
      expected: initial
    });
  }

  {
    const { getStore } = createDux().selectors;

    assert({
      given: 'a store',
      should: 'pass entire store as a second parameter to selectors',
      actual: getStore({ counter: 3, foo: 'bar' }),
      expected: { counter: 3, foo: 'bar' }
    });
  }
});

describe('autodux() action creators', async should => {
  const { assert } = should();

  {

    const value = 'UserName';
    const { actions } = autodux({
      slice: 'emptyCreator',
      actions: {
        nothing: {
          reducer: x => x
        }
      }
    });

    const expected = {
      type: 'emptyCreator/nothing',
      payload: value
    };

    assert({
      given: 'no action creators',
      should: 'should default missing action creators to identity',
      actual: actions.nothing(value),
      expected
    });
  }

  {
    const value = 'UserName';
    const { actions } = autodux({
      slice: 'emptyCreator',
      actions: {
        nothing: {
          reducer: x => x
        }
      }
    });

    const expected = {
      type: 'emptyCreator/nothing',
      payload: value
    };

    assert({
      given: 'no reducer',
      should: 'default missing reducer to spread payload into state',
      actual: actions.nothing(value),
      expected
    });
  }

  {
    const initial = { a: 'a' };

    const { reducer } = autodux({
      initial,
      actions: {
        reducer: x => x
      }
    });

    assert({
      given: 'no args',
      should: 'return valid default state',
      actual: reducer(),
      expected: initial
    });
  }

  {

    const {
      reducer,
      actions: {
        increment,
        decrement,
        multiply
      },
      selectors: {
        getValue
      }
    } = autodux({
      // the slice of state your reducer controls
      slice: 'counter',

      // The initial value of your reducer state
      initial: 0,

      // No need to implement switching logic -- it's
      // done for you.
      actions: {
        increment: state => state + 1,
        decrement: state => state - 1,
        multiply: {
          create: ({ by }) => by,
          reducer: (state, payload) => state * payload
        }
      },

      // No need to select the state slice -- it's done for you.
      selectors: {
        getValue: id
      }
    });

    const state = [
      increment(),
      increment(),
      increment(),
      decrement(),
      multiply({ by: 2 })
    ].reduce(reducer, undefined);

    assert({
      given: 'functions as action values',
      should: 'use function as a reducer',
      actual: getValue({ counter: state }),
      expected: 4
    });
  }
});

describe('autodux/assign(key)', async should => {
  const { assert } = should();

  const {
    actions: {
      setUserName,
      setAvatar
    },
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

  const actual = [
    setUserName(userName),
    setAvatar(avatar)
  ].reduce(reducer, undefined);

  const expected = {
    userName,
    avatar
  };

  assert({
    given: 'default actions (without action keys)',
    should: 'set the key in the state to the payload value',
    actual,
    expected,
  });
});

describe('autodux/default', async should => {
  const { assert } = should();
  {
    const {
      actions: {
        setUser
      },
      reducer
    } = autodux({
      slice: 'user',
      initial: {
        userName: 'Anonymous',
        avatar: 'anonymous.png'
      }
    });
    const userName = 'Foo';
    const avatar = 'foo.png';

    const actual = reducer(undefined, setUser({ userName, avatar }));

    const expected = {
      userName,
      avatar
    };

    assert({
      given: 'actions (without action keys)',
      should: 'create `set${slice}` to spread payload into state',
      actual,
      expected,
    });
  }

  {
    const {
      actions: {
        setUserName,
        setAvatar
      },
      reducer
    } = autodux({
      slice: 'user',
      initial: {
        userName: 'Anonymous',
        avatar: 'anonymous.png'
      }
    });
    const userName = 'Foo';
    const avatar = 'foo.png';

    const actual = [
      setUserName(userName),
      setAvatar(avatar)
    ].reduce(reducer, undefined);

    const expected = {
      userName,
      avatar
    };

    assert({
      given: 'actions (without action keys)',
      should: 'create assignment actions for each key in initial',
      actual,
      expected,
    });
  }
});
