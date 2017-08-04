const curry = require('lodash.curry');

const sliceSelector = curry((slice, fn, state) => fn(state[slice]));

const autodux = ({
  initial = '',
  actions = {},
  selectors = {},
  slice = ''
} = {}) => {
  const reducer = (state = initial, {type, payload} = {}) => {
    const [ namespace, subType ] = type ?
    type.split('/') :
    'unknown/unknown'.split('/');

    return (namespace === slice && actions[subType]) ?
      actions[subType].reducer(state, payload) :
      state
    ;
  };

  const createSelector = sliceSelector(slice);

  const slicedSelectors = Object.keys(selectors).reduce(
    (obj, selector) => slice ?
      Object.assign(obj, {[selector]: createSelector(selectors[selector]) }) :
      Object.assign(obj, {[selector]: selectors[selector] }),
    {}
  );

  const mappedActions = Object.keys(actions).reduce(
    (obj, key) => Object.assign({}, obj, {
      [key]: Object.assign(
        (...args) => ({
          type: `${ slice }/${ key }`,
          payload: typeof actions[key].create === 'function' ?
            actions[key].create(...args) :
            undefined
        }),
        { type: `${ slice }/${ key }` }
      )
    }),
    {}
  );

  return {
    initial, actions: mappedActions, selectors: slicedSelectors, reducer, slice
  };
};

module.exports = autodux;
