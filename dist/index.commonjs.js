/*! autodux v1.0.2 by undefined */
var curry = require('lodash.curry');

var sliceSelector = curry(function (slice, fn, state) {
  return fn(state[slice]);
});

var autodux = function autodux() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$initial = _ref.initial,
      initial = _ref$initial === undefined ? '' : _ref$initial,
      _ref$actions = _ref.actions,
      actions = _ref$actions === undefined ? {} : _ref$actions,
      _ref$selectors = _ref.selectors,
      selectors = _ref$selectors === undefined ? {} : _ref$selectors,
      _ref$slice = _ref.slice,
      slice = _ref$slice === undefined ? '' : _ref$slice;

  var reducer = function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initial;

    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        type = _ref2.type,
        payload = _ref2.payload;

    var _ref3 = type ? type.split('/') : 'unknown/unknown'.split('/'),
        namespace = _ref3[0],
        subType = _ref3[1];

    return namespace === slice && actions[subType] ? actions[subType].reducer(state, payload) : state;
  };

  var createSelector = sliceSelector(slice);

  var slicedSelectors = Object.keys(selectors).reduce(function (obj, selector) {
    var _Object$assign, _Object$assign2;

    return slice ? Object.assign(obj, (_Object$assign = {}, _Object$assign[selector] = createSelector(selectors[selector]), _Object$assign)) : Object.assign(obj, (_Object$assign2 = {}, _Object$assign2[selector] = selectors[selector], _Object$assign2));
  }, {});

  var mappedActions = Object.keys(actions).reduce(function (obj, key) {
    var _Object$assign3;

    return Object.assign({}, obj, (_Object$assign3 = {}, _Object$assign3[key] = Object.assign(function () {
      var _actions$key;

      return {
        type: slice + '/' + key,
        payload: typeof actions[key].create === 'function' ? (_actions$key = actions[key]).create.apply(_actions$key, arguments) : undefined
      };
    }, { type: slice + '/' + key }), _Object$assign3));
  }, {});

  return {
    initial: initial, actions: mappedActions, selectors: slicedSelectors, reducer: reducer
  };
};

module.exports = autodux;
//# sourceMappingURL=index.commonjs.js.map
