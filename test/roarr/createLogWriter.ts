import { createLogMethods } from '../../src/factories/createLogMethods';
import { createLogWriter } from '../../src/factories/createLogWriter';
import test from 'ava';
import { stub } from 'sinon';

test('does not log if ROARR_LOG=false', (t) => {
  const trace = stub();

  const write = createLogWriter({
    logMethods: {
      ...createLogMethods(),
      trace,
    },
    storage: {
      getItem: (name) => {
        if (name === 'ROARR_LOG') {
          return 'false';
        }

        return '*';
      },
      setItem: () => {
        // Do nothing.
      },
    },
  });

  write('{"context":{"logLevel":0},"message":"foo"}');

  t.false(trace.called);
});

test('logs if ROARR_LOG=true', (t) => {
  const trace = stub();

  const write = createLogWriter({
    logMethods: {
      ...createLogMethods(),
      trace,
    },
    storage: {
      getItem: (name) => {
        if (name === 'ROARR_LOG') {
          return 'true';
        }

        return '*';
      },
      setItem: () => {
        // Do nothing.
      },
    },
  });

  write('{"context":{"logLevel":0},"message":"foo"}');

  t.true(trace.called);
});

test('does not log if filter does not match', (t) => {
  const trace = stub();

  const write = createLogWriter({
    logMethods: {
      ...createLogMethods(),
      trace,
    },
    storage: {
      getItem: (name) => {
        if (name === 'ROARR_LOG') {
          return 'true';
        }

        return 'nomatch';
      },
      setItem: () => {
        // Do nothing.
      },
    },
  });

  write('{"context":{"logLevel":0},"message":"foo"}');

  t.false(trace.called);
});
