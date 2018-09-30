import { Injectable, Optional, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class WindowService {
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Optional()
    @Inject(Window)
    _window: Window,
  ) {
    if (_window !== null) {
      this.window = _window;
    } else if (isPlatformBrowser(platformId)) {
      this.window = window;
    } else {
      const navigator = Object.assign(Object.create(null), { appVersion: "" });
      this.window = Object.assign(Object.create(null), { navigator });
    }
  }

  public readonly window: Window;
}
