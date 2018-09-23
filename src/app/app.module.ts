import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

// import { BrowserModule } from "@angular/platform-browser";
// import { NgModule } from "@angular/core";
// // import {
// //   WorkerAppModule,
// //   WORKER_APP_LOCATION_PROVIDERS,
// // } from "@angular/platform-webworker";
// // import { APP_BASE_HREF } from "@angular/common";

// import { AppComponent } from "./app.component";

// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     // WorkerAppModule,
//   ],
//   providers: [
//     // {
//     //   provide: APP_BASE_HREF,
//     //   useValue: "/",
//     // },
//     // WORKER_APP_LOCATION_PROVIDERS,
//   ],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}
