const createLogWriter = require('./dist/src/factories/createLogWriter.js').createLogWriter;

globalThis.ROARR = globalThis.ROARR ? {} : globalThis.ROARR;
globalThis.ROARR.write = createLogWriter();
