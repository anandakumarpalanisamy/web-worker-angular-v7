const path = require("path");

module.exports = ({ production = false, ie11 = false }) => ({
  mode: production ? "production" : "development",
  entry: ["./src/polyfills.ts", "./src/main.worker.ts"],
  output: {
    path: path.resolve(
      __dirname,
      "assets",
      `${ie11 ? "ie11" : "evergreen"}-webworkers`,
    ),
    filename: "main.worker.js",
  },
  resolve: { extensions: [".ts", ".js", ".json"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          compilerOptions: {
            baseUrl: "./",
            outDir: `./dist/out-tsc/worker${ie11 ? "-ie11" : ""}`,
            sourceMap: production ? false : true,
            declaration: false,
            module: "esnext",
            moduleResolution: "node",
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            target: ie11 ? "es5" : "es2015",
            typeRoots: ["node_modules/@types"],
            lib: ["es2018", "esnext.asynciterable", "dom", "webworker"],
          },
        },
      },
    ],
  },
});
