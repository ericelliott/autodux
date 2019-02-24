import { path, prop } from 'ramda';

import { SLICE_VALUE_ERROR } from './errors';
import {
  id,
  isSliceValid,
  isPrimitive,
  isFunction,
  selectIfFunction,
  getSelectorName,
  getActionCreatorName,
  getType
} from './helpers';

const createActionCreator = (slice, name, mapPayload) => {
  const type = getType(slice, name);
  return Object.assign(
    (...args) => ({
      type,
      payload: isFunction(mapPayload) ? mapPayload(...args) : args[0]
    }),
    { type }
  );
};

const createReducer = key => (state, payload) =>
  !key && isPrimitive(payload)
    ? payload
    : Object.assign({}, state, key ? { [key]: payload } : payload);

const createSelector = (slice, fn) => state => fn(state[slice], state);

/**
 * Create default action creators, reducers and selectors.
 * @param {string} slice - Slice name
 * @param {object} initial - Initial state object
 * @returns {[object, object, object]} Tuple containing action creator, reducer and selector.
 */
const createDefaults = (slice, initial) => {
  const sliceActionCreatorName = getActionCreatorName(slice);

  return Object.keys(initial).reduce(
    (resultTuple, key) => {
      const actionCreatorName = getActionCreatorName(key);

      return [
        Object.assign(resultTuple[0], {
          [actionCreatorName]: createActionCreator(slice, actionCreatorName)
        }),
        Object.assign(resultTuple[1], {
          [actionCreatorName]: createReducer(key)
        }),
        Object.assign(resultTuple[2], {
          [getSelectorName(key)]: createSelector(
            slice,
            state => prop(key, state)
          )
        })
      ];
    },
    [
      {
        [sliceActionCreatorName]: createActionCreator(
          slice,
          sliceActionCreatorName
        )
      },
      {
        [sliceActionCreatorName]: createReducer()
      },
      {
        [getSelectorName(slice)]: createSelector(
          slice,
          id
        )
      }
    ]
  );
};

const createActionCreators = (slice, actions) =>
  Object.keys(actions).reduce(
    (obj, action) =>
      Object.assign({}, obj, {
        [action]: createActionCreator(slice, action, actions[action].create)
      }),
    {}
  );

const createSelectors = (slice, selectors) =>
  Object.keys(selectors).reduce(
    (obj, key) =>
      Object.assign(obj, {
        [key]: createSelector(
          slice,
          selectors[key]
        )
      }),
    {}
  );

const checkOptions = ({ slice }) => {
  if (!isSliceValid(slice)) {
    throw new Error(SLICE_VALUE_ERROR);
  }
};

export default function autodux(options = {}) {
  checkOptions(options);

  const { initial = '', actions = {}, selectors = {}, slice } = options;

  const [
    defaultActionCreators,
    defaultReducers,
    defaultSelectors
  ] = createDefaults(slice, initial);

  const allSelectors = Object.assign(
    {},
    defaultSelectors,
    createSelectors(slice, selectors)
  );

  const allActions = Object.assign(
    {},
    defaultActionCreators,
    createActionCreators(slice, actions)
  );

  const rootReducer = (state = initial, { type, payload } = {}) => {
    const [namespace, subType] = type
      ? type.split('/')
      : getType('unknown', 'unknown').split('/');

    // Look for reducer with top-to-bottom precedence.
    // Fall back to default actions, then undefined.
    // The actions[subType] key can be a function
    // or an object, so we only select the value
    // if it's a function:
    const reducer = [
      path([subType, 'reducer'], actions),
      actions[subType],
      defaultReducers[subType]
    ].reduceRight((f, v) => selectIfFunction(v) || f);

    return namespace === slice && (actions[subType] || defaultReducers[subType])
      ? reducer
        ? reducer(state, payload)
        : Object.assign({}, state, payload)
      : state;
  };

  return {
    initial,
    reducer: rootReducer,
    slice,
    selectors: allSelectors,
    actions: allActions
  };
}

export const assign = key => (state, payload) =>
  Object.assign({}, state, {
    [key]: payload
  });
