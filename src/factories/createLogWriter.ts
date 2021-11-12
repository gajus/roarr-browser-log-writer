import {
  boolean,
} from 'boolean';
import createGlobalThis from 'globalthis';
import {
  parse,
  test,
} from 'liqe';
import type {
  Query,
} from 'liqe';
import {
  getLogLevelName,
} from 'roarr';
import type {
  LogLevelName,
  LogWriter,
  Message,
} from 'roarr';
import type {
  Storage,
  LogMethods,
} from '../types';
import {
  createLogMethods,
} from './createLogMethods';

const globalThis = createGlobalThis();

type Configuration = {
  logMethods?: LogMethods,
  storage?: Storage,
};

const logLevelColors: {
  [key in LogLevelName]: { backgroundColor: string, color: string, };
} = {
  debug: {backgroundColor: '#712bde', color: '#fff'},
  error: {backgroundColor: '#f05033', color: '#fff'},
  fatal: {backgroundColor: '#f05033', color: '#fff'},
  info: {backgroundColor: '#3174f1', color: '#fff'},
  trace: {backgroundColor: '#666', color: '#fff'},
  warn: {backgroundColor: '#f5a623', color: '#000'},
};

const namespaceColors: {
  [key in LogLevelName]: { color: string, };
} = {
  debug: {color: '#8367d3'},
  error: {color: '#ff1a1a'},
  fatal: {color: '#ff1a1a'},
  info: {color: '#3291ff'},
  trace: {color: '#999'},
  warn: {color: '#f7b955'},
};

const findLiqeQuery = (storage: Storage): Query | null => {
  const query = storage.getItem('ROARR_FILTER');

  return query ? parse(query) : null;
};

export const createLogWriter = (configuration: Configuration = {}): LogWriter => {
  const storage = configuration?.storage ?? globalThis.localStorage;
  const logMethods = configuration?.logMethods ?? createLogMethods();

  if (!storage && !globalThis.localStorage) {
    // eslint-disable-next-line no-console
    console.warn('initiated Roarr browser log writer in non-browser context');

    return () => {
      // Do nothing.
    };
  }

  if (!boolean(storage.getItem('ROARR_LOG'))) {
    return () => {
      // Do nothing.
    };
  }

  const liqeQuery = findLiqeQuery(storage);

  return (message) => {
    const payload = JSON.parse(message) as Message;

    const {
      logLevel: numericLogLevel,
      namespace,
      ...context
    } = payload.context;

    if (liqeQuery && !test(liqeQuery, payload)) {
      return;
    }

    const logLevelName = getLogLevelName(Number(numericLogLevel));
    const logMethod = logMethods[logLevelName];

    const logColor = logLevelColors[logLevelName];
    const styles = `
      background-color: ${logColor.backgroundColor};
      color: ${logColor.color};
      font-weight: bold;
    `;
    const namespaceStyles = `
      color: ${namespaceColors[logLevelName].color};
    `;
    const resetStyles = `
      color: inherit;
    `;

    if (Object.keys(context).length > 0) {
      logMethod(
        `%c ${logLevelName} %c${namespace ? ` [${String(namespace)}]:` : ''
        }%c ${payload.message} %O`,
        styles,
        namespaceStyles,
        resetStyles,
        context,
      );
    } else {
      logMethod(
        `%c ${logLevelName} %c${namespace ? ` [${String(namespace)}]:` : ''
        }%c ${payload.message}`,
        styles,
        namespaceStyles,
        resetStyles,
      );
    }
  };
};
