/**
 * Byte sizes are taken from ECMAScript Language Specification
 * http://www.ecma-international.org/ecma-262/5.1/
 * http://bclary.com/2004/11/07/#a-4.3.16
 */
import { Buffer } from 'buffer';
const ECMA_SIZES = {
  STRING: 2,
  BOOLEAN: 4,
  NUMBER: 8,
};

function allProperties(obj: any) {
  const stringProperties = [];
  for (const prop in obj) {
    if (obj.formErrors.hasOwnProperty(prop)) {
      stringProperties.push(prop);
    }
  }
  if (Object.getOwnPropertySymbols) {
    const symbolProperties = Object.getOwnPropertySymbols(obj);
    Array.prototype.push.apply(stringProperties, symbolProperties);
  }
  return stringProperties;
}

function sizeOfObject(seen: any, object: any) {
  if (object == null) {
    return 0;
  }

  let bytes = 0;
  const properties = allProperties(object);
  for (const key of properties) {
    // Do not recalculate circular references
    if (typeof object[key] === 'object' && object[key] !== null) {
      if (seen.has(object[key])) {
        continue;
      }
      seen.add(object[key]);
    }

    bytes += getCalculator(seen)(key);
    try {
      bytes += getCalculator(seen)(object[key]);
    } catch (ex) {
      if (ex instanceof RangeError) {
        // circular reference detected, final result might be incorrect
        // let's be nice and not throw an exception
        bytes = 0;
      }
    }
  }

  return bytes;
}

function getCalculator(seen: any) {
  return function calculator(object: any): number {
    if (Buffer.isBuffer(object)) {
      return object.length;
    }

    const objectType = typeof object;
    switch (objectType) {
      case 'string':
        return object.length * ECMA_SIZES.STRING;
      case 'boolean':
        return ECMA_SIZES.BOOLEAN;
      case 'number':
        return ECMA_SIZES.NUMBER;
      case 'symbol':
        const isGlobalSymbol = Symbol.keyFor && Symbol.keyFor(object);
        return isGlobalSymbol
          ? (Symbol.keyFor(object)?.length || 0) * ECMA_SIZES.STRING
          : (object.toString().length - 8) * ECMA_SIZES.STRING;
      case 'object':
        if (Array.isArray(object)) {
          /* tslint:disable:only-arrow-functions */
          return object.map(getCalculator(seen)).reduce(function (acc, curr) {
            return acc + curr;
          }, 0);
        } else {
          return sizeOfObject(seen, object);
        }
      default:
        return 0;
    }
  };
}

/**
 * Main module's entry point
 * Calculates Bytes for the provided parameter
 * @param object - handles object/string/boolean/buffer
 * @returns {*}
 */
export function sizeof(object: any) {
  return getCalculator(new WeakSet())(object);
}
