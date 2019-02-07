const get = require('lodash/fp/get');
const capitalize = require('lodash/upperFirst');

const id = x => x;
const selectIf = predicate => x => predicate(x) && x;
const isFunction = f => typeof f === 'function';
const selectFunction = selectIf(isFunction);

// # Selector creation:
const toGetter = s => `get${capitalize(s)}`;
const sliceSelector = (slice, fn) => state => fn(state[slice], state);

const createInitSelectors = (slice, initial) =>
  Object.keys(initial).reduce(
    (obj, selector) =>
      slice
        ? Object.assign(obj, {
            [toGetter(selector)]: sliceSelector(slice, state =>
              get(selector, state)
            )
          })
        : Object.assign(obj, {
            [toGetter(selector)]: state => get(selector, state)
          }),
    {}
  );

const createSliceSelectors = (slice, selectors) =>
  Object.assign(
    Object.keys(selectors).reduce(
      (obj, selector) =>
        slice
          ? Object.assign(obj, {
              [selector]: sliceSelector(slice, selectors[selector])
            })
          : Object.assign(obj, { [selector]: selectors[selector] }),
      {}
    ),
    {
      [toGetter(slice)]: sliceSelector(slice, id)
    }
  );
// /selector creation

// # Action creation
const getActionName = key => `set${capitalize(key)}`;

const createAction = (slice, action, key, type = `${slice}/${action}`) => ({
  create: Object.assign(payload => payload, { type }),

  reducer: (state, payload) =>
    Object.assign({}, state, key ? { [key]: payload } : payload)
});

const getInitialActions = (slice, initial) =>
  Object.keys(initial).reduce((o, key) => {
    const action = getActionName(key);
    return Object.assign(o, {
      [action]: createAction(slice, action, key)
    });
  }, {});

const addDefaultActions = (slice, initial, actions) => {
  const initialActions = getInitialActions(slice, initial);
  const action = getActionName(slice);

  return Object.assign(
    {},
    {
      [action]: createAction(slice, action)
    },
    initialActions,
    actions
  );
};

const createMappedActions = (slice, actions) =>
  Object.keys(actions).reduce(
    (obj, action) =>
      Object.assign({}, obj, {
        [action]: Object.assign(
          (...args) => ({
            type: `${slice}/${action}`,
            payload:
              typeof actions[action].create === 'function'
                ? actions[action].create(...args)
                : args[0]
          }),
          { type: `${slice}/${action}` }
        )
      }),
    {}
  );
// /action creation

const autodux = ({
  initial = '',
  actions = {},
  selectors = {},
  slice = ''
} = {}) => {
  const allSelectors = Object.assign(
    {},
    createInitSelectors(slice, initial),
    createSliceSelectors(slice, selectors)
  );

  const allActions = createMappedActions(
    slice,
    addDefaultActions(slice, initial, actions)
  );

  const reducer = (state = initial, { type, payload } = {}) => {
    const [namespace, subType] = type
      ? type.split('/')
      : 'unknown/unknown'.split('/');

    const defaultActions = addDefaultActions(slice, initial, {});

    // Look for reducer with top-to-bottom precedence.
    // Fall back to default actions, then undefined.
    // The actions[subType] key can be a function
    // or an object, so we only select the value
    // if it's a function:
    const actionReducer = [
      get(`${subType}.reducer`, actions),
      actions[subType],
      get(`${subType}.reducer`, defaultActions)
    ].reduceRight((f, v) => selectFunction(v) || f);

    return namespace === slice && (actions[subType] || defaultActions[subType])
      ? actionReducer
        ? actionReducer(state, payload)
        : Object.assign({}, state, payload)
      : state;
  };

  return {
    initial,
    reducer,
    slice,
    selectors: allSelectors,
    actions: allActions
  };
};

module.exports = autodux;
module.exports.default = autodux;
module.exports.id = id;

module.exports.assign = key => (state, payload) =>
  Object.assign({}, state, {
    [key]: payload
  });
