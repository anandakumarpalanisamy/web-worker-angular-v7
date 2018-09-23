const baseConfig = require("./web-worker.webpack.base.config");

module.exports = baseConfig({ production: true, ie11: true });
