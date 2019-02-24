import * as R from 'ramda';

export const id = x => x;

const selectIf = predicate => x => predicate(x) && x;

export const isFunction = f => typeof f === 'function';

export const selectIfFunction = selectIf(isFunction);

const isNumber = n => typeof n === 'number';

const isBoolean = b => typeof b === 'boolean';

const isString = s => typeof s === 'string';

export const isPrimitive = v =>
  [isString, isNumber, isBoolean, R.isNil].some(f => f(v));

export const isSliceValid = slice => isString(slice) && !R.isEmpty(slice);

const capitalizeFirstWord = R.o(R.join(''), R.adjust(0, R.toUpper));

const getName = R.compose(
  capitalizeFirstWord,
  R.ifElse(isString, R.identity, R.toString)
);

export const getSelectorName = key => `get${getName(key)}`;

export const getActionCreatorName = key => `set${getName(key)}`;

export const getType = (slice, actionCreatorName) =>
  `${slice}/${actionCreatorName}`;
