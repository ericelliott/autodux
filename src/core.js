import get from 'lodash/fp/get';
import capitalize from 'lodash/upperFirst';

import { SLICE_VALUE_ERROR } from './errors';

export const id = x => x;
const selectIf = predicate => x => predicate(x) && x;
const isFunction = f => typeof f === 'function';
const isString = s => typeof s === 'string';
const isNumber = n => typeof n === 'number';
const isBoolean = b => typeof b === 'boolean';
const isUndefined = v => typeof v === 'undefined';
const isNull = v => v === null;
const isPrimitive = v =>
  [isString, isNumber, isBoolean, isUndefined, isNull].some(f => f(v));
const isEmptyString = s => s === '';
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
    !key && isPrimitive(payload)
      ? payload
      : Object.assign({}, state, key ? { [key]: payload } : payload)
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

const isSliceValid = slice => isString(slice) && !isEmptyString(slice);

const checkOptions = ({ slice }) => {
  if (!isSliceValid(slice)) {
    throw new Error(SLICE_VALUE_ERROR);
  }
};

const autodux = (options = {}) => {
  checkOptions(options);

  const { initial = '', actions = {}, selectors = {}, slice } = options;

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

export default autodux;

export const assign = key => (state, payload) =>
  Object.assign({}, state, {
    [key]: payload
  });
