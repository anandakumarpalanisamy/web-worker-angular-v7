import { Injectable, Optional } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class WindowService {
  // constructor() {
  //   this.window = window;
  // }

  constructor(@Optional() _window: Window) {
    if (_window === null) {
      this.window = window;
    }
  }

  public readonly window: Window;
}
