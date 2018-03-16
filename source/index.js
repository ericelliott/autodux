const curry = require('lodash.curry');

const sliceSelector = curry((slice, fn, state) => fn(state[slice], state));

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

    const actionReducer = (!actions[subType]) ?
      undefined :
      (typeof actions[subType].reducer == 'function') ?
        actions[subType].reducer :
        (typeof actions[subType] === 'function') ?
          actions[subType] :
          undefined;

    return (namespace === slice && actions[subType]) ?
      (actionReducer) ?
        actionReducer(state, payload) :
        Object.assign({}, state, payload) :
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
    (obj, action) => Object.assign({}, obj, {
      [action]: Object.assign(
        (...args) => ({
          type: `${ slice }/${ action }`,
          payload: typeof actions[action].create === 'function' ?
            actions[action].create(...args) :
            args[0]
        }),
        { type: `${ slice }/${ action }` }
      )
    }),
    {}
  );

  return {
    initial, actions: mappedActions, selectors: slicedSelectors, reducer, slice
  };
};

module.exports = autodux;
module.exports.id = x => x;

module.exports.assign = key => (state, payload) =>
  Object.assign({}, state, {
    [key]: payload
  })
;