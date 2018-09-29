import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { WindowService } from "./services/window/window.service";
import { PlatformCheckService } from "./services/platform-check/platform-check.service";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [WindowService, PlatformCheckService],
  bootstrap: [AppComponent],
})
export class AppModule {}
