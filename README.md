# WebWorkerV7

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.0-beta.4.

## IE11 and Edge

For these two browsers a separate bundle is created and served.

## Web Workers

Angular-CLI serve does not seem to work with custom Webpack configs completely, so these features were not working yet: Serve and configurations with file replacement.

As a workaround, a Nodemon script is used instead for automatic recompliation. In the build the Typescript compiler includes `src/main.ts` and fails when there is no DOM configured in the TS configuration for workers. Therefore, the TS config includes the DOM for Web Worker files.

> Note: You have to build the Web Workers before the app, since the files are copied during the app build.

## Development server

Run `npm start` for a dev server and a Web Worker watcher. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

> Note: The IE11/Edge version is served under `http://localhost:4300/`.

> Node: The IE11/Edge version proxies requests to webworkers, so that both evergreen and IE11/Edge can be served at the same time.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

> Note: Since there are multiple builds (IE11, Web Worker), the default is `--prod`. I you want to build without `--prod`, use the development variants.

> Note: The Web Worker bundles do not have a hash in their file names. Currently, we rely on the fact that they are relatively small and that they should only be cached for a short time.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Headless Mode

Chrome and Firefox will run in headless mode.

### Firefox

Run `node .\node_modules\protractor\bin\webdriver-manager update` to install the Webdriver for Firefox.

### IE11

> TL;DR: The repo contains a binary of the Webdriver. Start it before the E2E test.

Run `node .\node_modules\protractor\bin\webdriver-manager update --ie32` to install the 32bit Webdriver for IE11.

> Note: The protractor configuration does not start the driver automatically [issue](https://github.com/angular/protractor/issues/1887). You can find it in `.\node_modules\protractor\node_modules\webdriver-manager\selenium\IEDriverServer[VERSION].exe`.

> Note: The 64 bit driver is unsuable, see [this blog entry](https://kumikoro.wordpress.com/2015/09/20/e2e-testing-with-protractor/).

> Note: The driver [here](https://www.microsoft.com/en-us/download/details.aspx?id=44069) is only for Windows 8.1 or lower.

### Edge

> TL;DR: The repo contains a binary of the Webdriver. Start it before the E2E test.

Download the [Webdriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/). Start the driver before the E2E test.

> Note: Webdriver Manager does not support downloading the driver yet.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
