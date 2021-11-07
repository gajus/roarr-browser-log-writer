const createLogWriter = require('./dist/src/factories/createLogWriter').createLogWriter;

globalThis.ROARR = globalThis.ROARR ?? {};
globalThis.ROARR.write = createLogWriter();
