import capitalize from 'lodash/upperFirst';

export const id = x => x;

const selectIf = predicate => x => predicate(x) && x;

export const isFunction = f => typeof f === 'function';

export const selectFunction = selectIf(isFunction);

const isNumber = n => typeof n === 'number';

const isBoolean = b => typeof b === 'boolean';

const isUndefined = v => typeof v === 'undefined';

const isNull = v => v === null;

const isString = s => typeof s === 'string';

export const isPrimitive = v =>
  [isString, isNumber, isBoolean, isUndefined, isNull].some(f => f(v));

const isEmptyString = s => s === '';

export const isSliceValid = slice => isString(slice) && !isEmptyString(slice);

export const getSelectorName = key => `get${capitalize(key)}`;

export const getActionCreatorName = key => `set${capitalize(key)}`;

export const getType = (slice, actionCreatorName) =>
  `${slice}/${actionCreatorName}`;
