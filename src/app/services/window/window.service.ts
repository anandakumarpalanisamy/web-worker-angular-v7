import { Injectable, Optional, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class WindowService {
  constructor(
    @Optional() _window: Window,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    if (_window === null && isPlatformBrowser(platformId)) {
      this.window = window;
    }
  }

  public readonly window: Window;
}
