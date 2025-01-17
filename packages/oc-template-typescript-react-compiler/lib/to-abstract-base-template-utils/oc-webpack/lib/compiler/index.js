'use strict';

const MemoryFS = require('memory-fs');
const webpack = require('webpack');

const memoryFs = new MemoryFS();

module.exports = function compiler(config, callback) {
  const logger = config.logger;
  delete config.logger;

  const compiler = webpack(config);
  compiler.outputFileSystem = memoryFs;

  compiler.run((error, stats) => {
    let softError;
    let warning;

    // handleFatalError
    if (error) {
      return callback(error);
    }

    const info = stats.toJson();
    // handleSoftErrors
    if (stats.hasErrors()) {
      softError =
        typeof info.errors === 'string' ? info.errors : JSON.stringify(info.errors, null, 2);
      return callback(softError);
    }
    // handleWarnings
    if (stats.hasWarnings()) {
      // eslint-disable-next-line
      warning = info.warnings.toString();
    }

    const log = stats.toString(config.stats || 'errors-only');

    if (log) {
      logger.log(log);
    }
    callback(null, memoryFs.data);
  });
};
