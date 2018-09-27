import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

// Babel tests

if (document["documentMode"] || /Edge/.test(navigator.userAgent)) {
  console.log("Hello Microsoft User!");
}

(async function testDynamicImport() {
  const { fn } = await import("./foo");
  console.log("testDynamicImport", fn());
})().catch(err => console.error(err));

const foo = async function*() {
  console.log("async iterators");
  let i = 0;
  do {
    yield i;
    await new Promise(resolve => {
      setTimeout(resolve, 600);
    });
    i += 1;
  } while (i < 5);
};

const o = { a: 42 };
const p = { ...o, b: 666 };
console.log("test object destructuring", JSON.stringify(p));

console.log("window BroadcastChannel", typeof BroadcastChannel);
