import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class WindowService {
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    if (isPlatformBrowser(platformId)) {
      this.window = window;
    } else {
      const navigator = Object.assign(Object.create(null), { appVersion: "" });
      this.window = Object.assign(Object.create(null), { navigator });
    }
  }

  public readonly window: Window;
}
