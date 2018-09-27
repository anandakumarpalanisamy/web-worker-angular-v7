const path = require("path");

module.exports = ({ production = false, ie11 = false }) => ({
  mode: production ? "production" : "development",
  entry: {
    main: ["./src/polyfills.ts", "./src/main.worker.ts"],
    another: ["./src/polyfills.ts", "./src/another.worker.ts"],
  },
  output: {
    path: path.resolve(
      __dirname,
      "assets",
      `${ie11 ? "ie11" : "evergreen"}-webworkers`,
    ),
    filename: "[name].worker.js",
  },
  resolve: { extensions: [".ts", ".js", ".json"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          // no exclude option allowed, using config files
          configFile: `tsconfig.worker${ie11 ? ".ie11" : ""}.json`,
        },
      },
    ],
  },
});
