/* eslint-disable no-console */

import type {
  LogMethods,
} from '../types';

export const createLogMethods = (): LogMethods => {
  return {
    debug: console.debug.bind(console),
    error: console.error.bind(console),
    fatal: console.error.bind(console),
    info: console.info.bind(console),
    trace: console.debug.bind(console),
    warn: console.warn.bind(console),
  };
};
