import { Injectable } from "@angular/core";
import { WindowService } from "../window/window.service";

@Injectable({
  providedIn: "root",
})
export class PlatformCheckService {
  constructor(windowService: WindowService) {
    this.window = windowService.window;
    this.isEvergreen = !this.detectIE11() && !this.detectEdge();
    console.log("isEvergreen", this.isEvergreen);
  }

  public readonly isEvergreen: boolean;
  private readonly window: Window;

  private detectIE11() {
    const isIE11 = "MSInputMethodContext" in this.window;
    return isIE11;
  }

  private detectEdge() {
    const isEdge = this.window.navigator.appVersion.indexOf("Edge") > -1;
    return isEdge;
  }
}
