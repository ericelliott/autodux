import {
  isNil,
  isEmpty,
  o,
  join,
  adjust,
  toUpper,
  compose,
  ifElse,
  identity,
  toString
} from 'ramda';

export const id = x => x;

const selectIf = predicate => x => predicate(x) && x;

export const isFunction = f => typeof f === 'function';

export const selectIfFunction = selectIf(isFunction);

const isNumber = n => typeof n === 'number';

const isBoolean = b => typeof b === 'boolean';

const isString = s => typeof s === 'string';

export const isPrimitive = v =>
  [isString, isNumber, isBoolean, isNil].some(f => f(v));

export const isSliceValid = slice => isString(slice) && !isEmpty(slice);

const capitalizeFirstWord = o(join(''), adjust(0, toUpper));

const getName = compose(
  capitalizeFirstWord,
  ifElse(isString, identity, toString)
);

export const getSelectorName = key => `get${getName(key)}`;

export const getActionCreatorName = key => `set${getName(key)}`;

export const getType = (slice, actionCreatorName) =>
  `${slice}/${actionCreatorName}`;
