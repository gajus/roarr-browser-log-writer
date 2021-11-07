import {
  boolean,
} from 'boolean';
import {
  parse,
  test,
} from 'liqe';
import type {
  Query,
} from 'liqe';
import type {
  logLevels,
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

type Configuration = {
  logMethods?: LogMethods,
  storage?: Storage,
};

type LogLevelName = keyof typeof logLevels;

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

const getLogLevelName = (numericLogLevel: number): LogLevelName => {
  if (numericLogLevel <= 10) {
    return 'trace';
  }

  if (numericLogLevel <= 20) {
    return 'debug';
  }

  if (numericLogLevel <= 30) {
    return 'info';
  }

  if (numericLogLevel <= 40) {
    return 'warn';
  }

  if (numericLogLevel <= 50) {
    return 'error';
  }

  return 'fatal';
};

export const createLogWriter = (configuration: Configuration = {}): LogWriter => {
  const storage = configuration?.storage ?? globalThis.localStorage;
  const logMethods = configuration?.logMethods ?? createLogMethods();

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

    const logLevelName = getLogLevelName(numericLogLevel);
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
        `%c ${logLevelName} %c${namespace ? ` [${namespace}]:` : ''
        }%c ${payload.message} %O`,
        styles,
        namespaceStyles,
        resetStyles,
        context,
      );
    } else {
      logMethod(
        `%c ${logLevelName} %c${namespace ? ` [${namespace}]:` : ''
        }%c ${payload.message}`,
        styles,
        namespaceStyles,
        resetStyles,
      );
    }
  };
};
